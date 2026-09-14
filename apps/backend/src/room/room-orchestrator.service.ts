import { Injectable, Logger } from '@nestjs/common';
import {
  INTERMISSION_MS,
  QUESTION_DURATION_MS,
  type RoomConfig,
  type RoomEvent,
  type RoomState,
  type RoomStatePublic,
} from '@lejv-party/domain';

import {
  NoCandidatesError,
  QuestionEngineService,
  TranslationFailedError,
} from '../question-engine/question-engine.service.js';
import { InMemoryRoomStore } from './in-memory-room.store.js';
import { RoomError } from './room.errors.js';
import { generatePlayerId, generateRoomCode } from './room-id.util.js';
import {
  applyAction,
  initRoomState,
  type ApplyResult,
  type RoomAction,
} from './room-reducer.js';
import { SseEventBusService } from './sse-event-bus.service.js';

export const MAX_PLAYERS = 8;

const MAX_ROOM_CODE_ATTEMPTS = 5;
const QUESTION_TIMER_KEY = 'question';
const REVEAL_TIMER_KEY = 'reveal';

@Injectable()
export class RoomOrchestratorService {
  private readonly logger = new Logger(RoomOrchestratorService.name);

  constructor(
    private readonly store: InMemoryRoomStore,
    private readonly sse: SseEventBusService,
    private readonly questionEngine: QuestionEngineService,
  ) {}

  createRoom(hostNickname: string): {
    roomId: string;
    playerId: string;
    state: RoomStatePublic;
  } {
    if (hostNickname.trim().length === 0) {
      throw new RoomError('INVALID_NICKNAME');
    }

    const playerId = generatePlayerId();
    const now = Date.now();

    let roomId: string | null = null;
    for (let i = 0; i < MAX_ROOM_CODE_ATTEMPTS; i++) {
      const code = generateRoomCode();
      if (!this.store.rooms.has(code)) {
        roomId = code;
        break;
      }
    }
    if (roomId === null) {
      throw new RoomError('ROOM_CODE_COLLISION');
    }

    const state = initRoomState({
      id: roomId,
      hostId: playerId,
      hostNickname,
      now,
    });
    this.store.rooms.set(roomId, state);

    return { roomId, playerId, state: this.store.toPublic(state) };
  }

  joinRoom(
    roomId: string,
    nickname: string,
  ): { playerId: string; state: RoomStatePublic } {
    const state = this.requireRoom(roomId);
    const playerId = generatePlayerId();
    const { next } = this.apply(state, {
      type: 'joinRoom',
      playerId,
      nickname,
      now: Date.now(),
    });
    return { playerId, state: this.store.toPublic(next) };
  }

  leaveRoom(roomId: string, playerId: string): void {
    const state = this.requireRoom(roomId);
    this.apply(state, { type: 'leaveRoom', playerId });

    const remaining = this.store.rooms.get(roomId);
    if (!remaining) return;
    if (remaining.players.length === 0) {
      this.endRoomOnEmpty(roomId);
      return;
    }
    this.checkAllAnswered(roomId);
  }

  updateConfig(
    roomId: string,
    actorId: string,
    patch: Partial<RoomConfig>,
  ): void {
    const state = this.requireRoom(roomId);
    this.apply(state, { type: 'updateConfig', actorId, patch });
  }

  startGame(roomId: string, actorId: string): void {
    const state = this.requireRoom(roomId);
    this.apply(state, { type: 'startGame', actorId });
    void this.loadNextQuestion(roomId);
  }

  submitAnswer(
    roomId: string,
    playerId: string,
    answer: string,
  ): { correct: boolean } {
    const state = this.requireRoom(roomId);
    const { emit } = this.apply(state, {
      type: 'submitAnswer',
      playerId,
      answer,
      now: Date.now(),
    });

    const answerEvt = emit.find(
      (e): e is Extract<RoomEvent, { type: 'answer.submitted' }> =>
        e.type === 'answer.submitted',
    );
    const correct = answerEvt?.correct ?? false;

    if (correct) {
      this.clearQuestionTimeout(roomId);
      this.handleResolve(roomId, playerId);
    } else {
      this.checkAllAnswered(roomId);
    }

    return { correct };
  }

  skipQuestion(roomId: string, playerId: string): void {
    const state = this.requireRoom(roomId);
    if (state.hostId !== playerId) {
      throw new RoomError('NOT_HOST');
    }
    if (state.phase !== 'question') {
      throw new RoomError('NOT_IN_QUESTION');
    }
    this.clearQuestionTimeout(roomId);
    this.handleResolve(roomId, null);
  }

  markConnection(
    roomId: string,
    playerId: string,
    connected: boolean,
  ): void {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    this.apply(state, { type: 'markConnection', playerId, connected });
  }

  getPublicState(roomId: string): RoomStatePublic | undefined {
    const state = this.store.rooms.get(roomId);
    return state ? this.store.toPublic(state) : undefined;
  }

  private requireRoom(roomId: string): RoomState {
    const state = this.store.rooms.get(roomId);
    if (!state) throw new RoomError('ROOM_NOT_FOUND');
    return state;
  }

  private apply(state: RoomState, action: RoomAction): ApplyResult {
    const result = applyAction(state, action);
    this.store.rooms.set(state.id, result.next);
    for (const evt of result.emit) {
      this.sse.publish(state.id, evt);
    }
    return result;
  }

  private scheduleQuestionTimeout(roomId: string, deadlineAt: number): void {
    this.clearQuestionTimeout(roomId);
    const delay = Math.max(0, deadlineAt - Date.now());
    const handle = setTimeout(() => this.onQuestionTimeout(roomId), delay);
    this.store.getRoomTimers(roomId).set(QUESTION_TIMER_KEY, handle);
  }

  private clearQuestionTimeout(roomId: string): void {
    const t = this.store.timers.get(roomId);
    if (!t) return;
    const h = t.get(QUESTION_TIMER_KEY);
    if (h) {
      clearTimeout(h);
      t.delete(QUESTION_TIMER_KEY);
    }
  }

  private scheduleReveal(roomId: string, nextAt: number): void {
    this.clearReveal(roomId);
    const delay = Math.max(0, nextAt - Date.now());
    const handle = setTimeout(() => {
      void this.startNextQuestion(roomId);
    }, delay);
    this.store.getRoomTimers(roomId).set(REVEAL_TIMER_KEY, handle);
  }

  private clearReveal(roomId: string): void {
    const t = this.store.timers.get(roomId);
    if (!t) return;
    const h = t.get(REVEAL_TIMER_KEY);
    if (h) {
      clearTimeout(h);
      t.delete(REVEAL_TIMER_KEY);
    }
  }

  private onQuestionTimeout(roomId: string): void {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    if (state.phase !== 'question') return;
    this.handleResolve(roomId, null);
  }

  private async startNextQuestion(roomId: string): Promise<void> {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    if (state.phase === 'ended' || state.phase === 'lobby') return;
    await this.loadNextQuestion(roomId);
  }

  private async loadNextQuestion(roomId: string): Promise<void> {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    if (state.phase === 'ended' || state.phase === 'lobby') return;

    const config = state.config;
    try {
      const q = await this.questionEngine.nextQuestion(config);

      const latest = this.store.rooms.get(roomId);
      if (!latest) return;
      if (latest.phase === 'ended') return;

      const now = Date.now();
      const { next } = this.apply(latest, {
        type: 'startQuestion',
        songId: q.songId,
        lineIndex: q.lineIndex,
        translation: q.translation,
        title: q.title,
        artist: q.artist,
        now,
        durationMs: QUESTION_DURATION_MS,
      });

      const deadlineAt = next.game?.current?.deadlineAt;
      if (deadlineAt !== undefined) {
        this.scheduleQuestionTimeout(roomId, deadlineAt);
      }
    } catch (err) {
      if (
        err instanceof NoCandidatesError ||
        err instanceof TranslationFailedError
      ) {
        this.logger.error('question generation failed', err);
      } else {
        this.logger.error('loadNextQuestion unexpected error', err);
      }

      const latest = this.store.rooms.get(roomId);
      if (!latest) return;
      if (latest.phase === 'ended') return;
      if (!latest.game) return;
      this.apply(latest, { type: 'endGame', winnerId: null });
      this.store.clearRoomTimers(roomId);
    }
  }

  private handleResolve(roomId: string, scorerArg: string | null): void {
    const state = this.store.rooms.get(roomId);
    if (!state) return;

    const now = Date.now();
    const { next, emit } = this.apply(state, {
      type: 'resolveQuestion',
      scorer: scorerArg,
      now,
      intermissionMs: INTERMISSION_MS,
    });

    if (emit.length === 0) return;

    const scorer = next.game?.current?.scorer;
    const winnerReached =
      !!scorer &&
      (next.game?.scores[scorer] ?? 0) >= next.config.victoryScore;

    if (winnerReached && scorer) {
      this.apply(next, { type: 'endGame', winnerId: scorer });
      this.store.clearRoomTimers(roomId);
      return;
    }

    this.scheduleReveal(roomId, now + INTERMISSION_MS);
  }

  private checkAllAnswered(roomId: string): void {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    if (state.phase !== 'question') return;
    const current = state.game?.current;
    if (!current) return;
    if (current.answered.size < state.players.length) return;
    this.clearQuestionTimeout(roomId);
    this.handleResolve(roomId, null);
  }

  private endRoomOnEmpty(roomId: string): void {
    const state = this.store.rooms.get(roomId);
    if (!state) return;
    if (state.players.length > 0) return;
    this.store.clearRoomTimers(roomId);
    this.sse.closeRoom(roomId);
    this.store.rooms.delete(roomId);
    this.store.timers.delete(roomId);
  }
}
