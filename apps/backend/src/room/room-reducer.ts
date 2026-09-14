import {
  checkAnswer,
  type CEFRLevel,
  type CurrentQuestion,
  type Era,
  type GameState,
  type Genre,
  type PlayerState,
  type RoomConfig,
  type RoomEvent,
  type RoomState,
} from '@lejv-party/domain';

import { RoomError } from './room.errors.js';

const MAX_PLAYERS = 8;

const VALID_LEVELS: readonly CEFRLevel[] = ['A2', 'B1', 'B2', 'C1'];
const VALID_VICTORY_SCORES: readonly number[] = [3, 5, 10];

export type RoomAction =
  | { type: 'joinRoom'; playerId: string; nickname: string; now: number }
  | { type: 'leaveRoom'; playerId: string }
  | { type: 'renamePlayer'; playerId: string; nickname: string }
  | { type: 'updateConfig'; actorId: string; patch: Partial<RoomConfig> }
  | { type: 'startGame'; actorId: string }
  | {
      type: 'startQuestion';
      songId: string;
      lineIndex: number;
      translation: string;
      title: string;
      artist: string;
      now: number;
      durationMs: number;
    }
  | { type: 'submitAnswer'; playerId: string; answer: string; now: number }
  | {
      type: 'resolveQuestion';
      scorer: string | null;
      now: number;
      intermissionMs: number;
    }
  | { type: 'endGame'; winnerId: string | null }
  | { type: 'markConnection'; playerId: string; connected: boolean };

export type ApplyResult = { next: RoomState; emit: RoomEvent[] };

const DEFAULT_CONFIG: RoomConfig = {
  level: 'B1',
  eras: ['00s', '10s'] as Era[],
  genres: ['流行'] as Genre[],
  victoryScore: 5,
};

export function initRoomState(params: {
  id: string;
  hostId: string;
  hostNickname: string;
  now: number;
}): RoomState {
  const host: PlayerState = {
    id: params.hostId,
    nickname: params.hostNickname.trim(),
    joinedAt: params.now,
    connected: true,
  };
  return {
    id: params.id,
    hostId: params.hostId,
    players: [host],
    config: {
      ...DEFAULT_CONFIG,
      eras: [...DEFAULT_CONFIG.eras],
      genres: [...DEFAULT_CONFIG.genres],
    },
    phase: 'lobby',
    createdAt: params.now,
  };
}

export function applyAction(state: RoomState, action: RoomAction): ApplyResult {
  switch (action.type) {
    case 'joinRoom':
      return handleJoinRoom(state, action);
    case 'leaveRoom':
      return handleLeaveRoom(state, action);
    case 'renamePlayer':
      return handleRenamePlayer(state, action);
    case 'updateConfig':
      return handleUpdateConfig(state, action);
    case 'startGame':
      return handleStartGame(state, action);
    case 'startQuestion':
      return handleStartQuestion(state, action);
    case 'submitAnswer':
      return handleSubmitAnswer(state, action);
    case 'resolveQuestion':
      return handleResolveQuestion(state, action);
    case 'endGame':
      return handleEndGame(state, action);
    case 'markConnection':
      return handleMarkConnection(state, action);
  }
}

function handleJoinRoom(
  state: RoomState,
  action: Extract<RoomAction, { type: 'joinRoom' }>,
): ApplyResult {
  if (state.phase !== 'lobby') {
    throw new RoomError('GAME_IN_PROGRESS');
  }
  if (state.players.length >= MAX_PLAYERS) {
    throw new RoomError('ROOM_FULL');
  }

  const nickname = action.nickname.trim();
  if (nickname.length === 0) {
    throw new RoomError('INVALID_NICKNAME');
  }
  if (state.players.some((p) => p.id === action.playerId)) {
    throw new RoomError('PLAYER_EXISTS');
  }
  if (hasNicknameConflict(state.players, nickname, null)) {
    throw new RoomError('NICKNAME_TAKEN');
  }

  const player: PlayerState = {
    id: action.playerId,
    nickname,
    joinedAt: action.now,
    connected: true,
  };
  return {
    next: { ...state, players: [...state.players, player] },
    emit: [{ type: 'player.joined', player }],
  };
}

function handleLeaveRoom(
  state: RoomState,
  action: Extract<RoomAction, { type: 'leaveRoom' }>,
): ApplyResult {
  const idx = state.players.findIndex((p) => p.id === action.playerId);
  if (idx === -1) return { next: state, emit: [] };

  const remaining = state.players.filter((p) => p.id !== action.playerId);

  let nextHostId = state.hostId;
  let hostChanged = false;
  if (state.hostId === action.playerId && remaining.length > 0) {
    const heir = remaining.slice().sort((a, b) => a.joinedAt - b.joinedAt)[0];
    if (heir) {
      nextHostId = heir.id;
      hostChanged = true;
    }
  }

  const next: RoomState = {
    ...state,
    players: remaining,
    hostId: nextHostId,
  };
  const emit: RoomEvent[] = [
    { type: 'player.left', playerId: action.playerId },
  ];
  if (hostChanged) {
    emit.push({ type: 'host.changed', hostId: nextHostId });
  }
  return { next, emit };
}

function handleRenamePlayer(
  state: RoomState,
  action: Extract<RoomAction, { type: 'renamePlayer' }>,
): ApplyResult {
  const idx = state.players.findIndex((p) => p.id === action.playerId);
  if (idx === -1) throw new RoomError('NOT_A_MEMBER');

  const nickname = action.nickname.trim();
  if (nickname.length === 0) throw new RoomError('INVALID_NICKNAME');
  if (hasNicknameConflict(state.players, nickname, action.playerId)) {
    throw new RoomError('NICKNAME_TAKEN');
  }

  const players = state.players.slice();
  const existing = players[idx];
  if (!existing) throw new RoomError('NOT_A_MEMBER');
  players[idx] = { ...existing, nickname };

  return {
    next: { ...state, players },
    emit: [{ type: 'player.renamed', playerId: action.playerId, nickname }],
  };
}

function handleUpdateConfig(
  state: RoomState,
  action: Extract<RoomAction, { type: 'updateConfig' }>,
): ApplyResult {
  if (action.actorId !== state.hostId) throw new RoomError('NOT_HOST');
  if (state.phase !== 'lobby') throw new RoomError('GAME_IN_PROGRESS');

  const merged: RoomConfig = {
    ...state.config,
    ...action.patch,
    eras: action.patch.eras ? [...action.patch.eras] : state.config.eras,
    genres: action.patch.genres
      ? [...action.patch.genres]
      : state.config.genres,
  };

  if (!VALID_LEVELS.includes(merged.level)) {
    throw new RoomError('INVALID_LEVEL');
  }
  if (merged.eras.length === 0) throw new RoomError('INVALID_ERAS');
  if (merged.genres.length === 0) throw new RoomError('INVALID_GENRES');
  if (!VALID_VICTORY_SCORES.includes(merged.victoryScore)) {
    throw new RoomError('INVALID_VICTORY_SCORE');
  }

  return {
    next: { ...state, config: merged },
    emit: [{ type: 'config.updated', config: merged }],
  };
}

function handleStartGame(
  state: RoomState,
  action: Extract<RoomAction, { type: 'startGame' }>,
): ApplyResult {
  if (action.actorId !== state.hostId) throw new RoomError('NOT_HOST');
  if (state.phase !== 'lobby') throw new RoomError('ALREADY_STARTED');
  if (state.players.length < 1) throw new RoomError('NOT_ENOUGH_PLAYERS');

  const scores: Record<string, number> = {};
  for (const p of state.players) scores[p.id] = 0;

  const game: GameState = { questionIndex: 0, scores };
  return {
    next: { ...state, phase: 'question', game },
    emit: [{ type: 'game.started' }],
  };
}

function handleStartQuestion(
  state: RoomState,
  action: Extract<RoomAction, { type: 'startQuestion' }>,
): ApplyResult {
  if (state.phase !== 'question' && state.phase !== 'reveal') {
    throw new RoomError('NOT_IN_GAME');
  }
  const game = state.game;
  if (!game) throw new RoomError('NOT_IN_GAME');

  const nextIndex = game.questionIndex + 1;
  const current: CurrentQuestion = {
    songId: action.songId,
    lineIndex: action.lineIndex,
    translation: action.translation,
    title: action.title,
    artist: action.artist,
    startedAt: action.now,
    deadlineAt: action.now + action.durationMs,
    answered: new Set<string>(),
  };
  const nextGame: GameState = {
    ...game,
    questionIndex: nextIndex,
    current,
  };

  return {
    next: { ...state, phase: 'question', game: nextGame },
    emit: [
      {
        type: 'question.started',
        index: nextIndex,
        translation: action.translation,
        deadlineAt: current.deadlineAt,
      },
    ],
  };
}

function handleSubmitAnswer(
  state: RoomState,
  action: Extract<RoomAction, { type: 'submitAnswer' }>,
): ApplyResult {
  if (state.phase !== 'question') throw new RoomError('NOT_IN_QUESTION');
  const game = state.game;
  if (!game || !game.current) throw new RoomError('NOT_IN_QUESTION');

  if (!state.players.some((p) => p.id === action.playerId)) {
    throw new RoomError('NOT_A_MEMBER');
  }
  if (game.current.answered.has(action.playerId)) {
    throw new RoomError('ALREADY_ANSWERED');
  }

  const correct = checkAnswer(action.answer, game.current.title);

  const answered = new Set(game.current.answered);
  answered.add(action.playerId);

  let nextCurrent: CurrentQuestion = { ...game.current, answered };
  let nextScores = game.scores;

  if (correct) {
    nextCurrent = { ...nextCurrent, scorer: action.playerId };
    nextScores = {
      ...game.scores,
      [action.playerId]: (game.scores[action.playerId] ?? 0) + 1,
    };
  }

  return {
    next: {
      ...state,
      game: { ...game, scores: nextScores, current: nextCurrent },
    },
    emit: [
      {
        type: 'answer.submitted',
        playerId: action.playerId,
        correct,
      },
    ],
  };
}

function handleResolveQuestion(
  state: RoomState,
  action: Extract<RoomAction, { type: 'resolveQuestion' }>,
): ApplyResult {
  if (state.phase !== 'question') return { next: state, emit: [] };
  const game = state.game;
  if (!game || !game.current) return { next: state, emit: [] };

  const scorer = game.current.scorer ?? action.scorer ?? null;
  const revealAt = action.now + action.intermissionMs;

  const nextCurrent: CurrentQuestion = { ...game.current, revealAt };
  if (scorer && !nextCurrent.scorer) nextCurrent.scorer = scorer;

  const nextGame: GameState = { ...game, current: nextCurrent };
  const next: RoomState = { ...state, phase: 'reveal', game: nextGame };

  const willEndGame =
    scorer !== null &&
    (nextGame.scores[scorer] ?? 0) >= state.config.victoryScore;

  return {
    next,
    emit: [
      {
        type: 'question.resolved',
        scorer,
        title: game.current.title,
        artist: game.current.artist,
        nextAt: willEndGame ? null : revealAt,
      },
    ],
  };
}

function handleEndGame(
  state: RoomState,
  action: Extract<RoomAction, { type: 'endGame' }>,
): ApplyResult {
  const game = state.game;
  if (!game) throw new RoomError('NOT_IN_GAME');

  const nextGame: GameState = {
    ...game,
    winner: action.winnerId ?? undefined,
  };

  return {
    next: { ...state, phase: 'ended', game: nextGame },
    emit: [
      {
        type: 'game.ended',
        winnerId: action.winnerId ?? null,
        scores: game.scores,
      },
    ],
  };
}

function handleMarkConnection(
  state: RoomState,
  action: Extract<RoomAction, { type: 'markConnection' }>,
): ApplyResult {
  const idx = state.players.findIndex((p) => p.id === action.playerId);
  if (idx === -1) return { next: state, emit: [] };

  const existing = state.players[idx];
  if (!existing) return { next: state, emit: [] };
  if (existing.connected === action.connected) {
    return { next: state, emit: [] };
  }

  const players = state.players.slice();
  players[idx] = { ...existing, connected: action.connected };

  return { next: { ...state, players }, emit: [] };
}

function hasNicknameConflict(
  players: readonly PlayerState[],
  candidate: string,
  ignorePlayerId: string | null,
): boolean {
  const key = candidate.trim().toLowerCase();
  return players.some(
    (p) =>
      p.id !== ignorePlayerId && p.nickname.trim().toLowerCase() === key,
  );
}
