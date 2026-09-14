// Domain types for the multiplayer song-lyric guessing game.
// Server-authoritative state; public (SSE-broadcast) variants strip
// non-serializable pieces such as Set<string>.

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1'

export type Era = '80s' | '90s' | '00s' | '10s' | '20s'

export type Genre = '流行' | '摇滚' | '民谣' | '说唱' | '影视 OST'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type RoomPhase = 'lobby' | 'question' | 'reveal' | 'ended'

export type RoomConfig = {
  level: CEFRLevel
  eras: Era[]
  genres: Genre[]
  victoryScore: number
}

export type PlayerState = {
  id: string
  nickname: string
  joinedAt: number
  connected: boolean
}

export type PlayerPublic = PlayerState

export type CurrentQuestion = {
  songId: string
  lineIndex: number
  translation: string
  startedAt: number
  deadlineAt: number
  answered: Set<string>
  scorer?: string
  revealAt?: number
  title: string
  artist: string
}

export type GameState = {
  questionIndex: number
  current?: CurrentQuestion
  scores: Record<string, number>
  winner?: string
}

export type RoomState = {
  id: string
  hostId: string
  players: PlayerState[]
  config: RoomConfig
  phase: RoomPhase
  game?: GameState
  createdAt: number
}

export type CurrentQuestionPublic = Omit<CurrentQuestion, 'answered'> & {
  answeredCount: number
}

export type GameStatePublic = Omit<GameState, 'current'> & {
  current?: CurrentQuestionPublic
}

export type RoomStatePublic = Omit<RoomState, 'game'> & {
  game?: GameStatePublic
}

export type RoomEvent =
  | { type: 'room.snapshot'; state: RoomStatePublic }
  | { type: 'player.joined'; player: PlayerPublic }
  | { type: 'player.left'; playerId: string }
  | { type: 'player.renamed'; playerId: string; nickname: string }
  | { type: 'host.changed'; hostId: string }
  | { type: 'config.updated'; config: RoomConfig }
  | { type: 'game.started' }
  | {
      type: 'question.started'
      index: number
      translation: string
      deadlineAt: number
    }
  | { type: 'answer.submitted'; playerId: string; correct: boolean }
  | {
      type: 'question.resolved'
      scorer: string | null
      title: string
      artist: string
      nextAt: number | null
    }
  | {
      type: 'game.ended'
      winnerId: string | null
      scores: Record<string, number>
    }
