import { Injectable } from '@nestjs/common';
import type {
  CurrentQuestion,
  CurrentQuestionPublic,
  GameState,
  GameStatePublic,
  RoomState,
  RoomStatePublic,
} from '@lejv-party/domain';

export type Timers = Map<string, NodeJS.Timeout>;

@Injectable()
export class InMemoryRoomStore {
  readonly rooms = new Map<string, RoomState>();
  readonly timers = new Map<string, Timers>();

  getRoomTimers(roomId: string): Timers {
    let t = this.timers.get(roomId);
    if (!t) {
      t = new Map();
      this.timers.set(roomId, t);
    }
    return t;
  }

  clearRoomTimers(roomId: string): void {
    const t = this.timers.get(roomId);
    if (!t) return;
    for (const h of t.values()) clearTimeout(h);
    t.clear();
  }

  toPublic(state: RoomState): RoomStatePublic {
    return {
      id: state.id,
      hostId: state.hostId,
      players: state.players,
      config: state.config,
      phase: state.phase,
      createdAt: state.createdAt,
      game: state.game ? this.gameToPublic(state.game) : undefined,
    };
  }

  private gameToPublic(game: GameState): GameStatePublic {
    return {
      questionIndex: game.questionIndex,
      scores: game.scores,
      winner: game.winner,
      current: game.current ? this.currentToPublic(game.current) : undefined,
    };
  }

  private currentToPublic(current: CurrentQuestion): CurrentQuestionPublic {
    const { answered, ...rest } = current;
    return { ...rest, answeredCount: answered.size };
  }
}
