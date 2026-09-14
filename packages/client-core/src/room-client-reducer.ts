import type {
  CurrentQuestionPublic,
  GameStatePublic,
  RoomEvent,
  RoomStatePublic,
} from '@lejv-party/domain'

export type ClientRoomState = RoomStatePublic | null

export type ClientAction =
  | { type: 'event'; event: RoomEvent }
  | { type: 'reset' }

export function clientReducer(
  state: ClientRoomState,
  action: ClientAction,
): ClientRoomState {
  if (action.type === 'reset') return null

  const evt = action.event

  if (evt.type === 'room.snapshot') return evt.state

  if (!state) return state

  switch (evt.type) {
    case 'player.joined': {
      if (state.players.some((p) => p.id === evt.player.id)) return state
      return { ...state, players: [...state.players, evt.player] }
    }

    case 'player.left': {
      return {
        ...state,
        players: state.players.filter((p) => p.id !== evt.playerId),
      }
    }

    case 'player.renamed': {
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === evt.playerId ? { ...p, nickname: evt.nickname } : p,
        ),
      }
    }

    case 'host.changed': {
      return { ...state, hostId: evt.hostId }
    }

    case 'config.updated': {
      return { ...state, config: evt.config }
    }

    case 'game.started': {
      const scores: Record<string, number> = {}
      for (const p of state.players) scores[p.id] = 0
      const game: GameStatePublic = { questionIndex: 0, scores }
      return { ...state, phase: 'question', game }
    }

    case 'question.started': {
      const prev = state.game ?? { questionIndex: 0, scores: {} }
      const current: CurrentQuestionPublic = {
        songId: '',
        lineIndex: 0,
        translation: evt.translation,
        title: '',
        artist: '',
        startedAt: Date.now(),
        deadlineAt: evt.deadlineAt,
        answeredCount: 0,
      }
      const game: GameStatePublic = {
        ...prev,
        questionIndex: evt.index,
        current,
      }
      return { ...state, phase: 'question', game }
    }

    case 'answer.submitted': {
      if (!state.game || !state.game.current) return state
      const currentQ = state.game.current
      const nextCurrent: CurrentQuestionPublic = {
        ...currentQ,
        answeredCount: currentQ.answeredCount + 1,
        scorer: evt.correct ? evt.playerId : currentQ.scorer,
      }
      const nextScores = evt.correct
        ? {
            ...state.game.scores,
            [evt.playerId]: (state.game.scores[evt.playerId] ?? 0) + 1,
          }
        : state.game.scores
      const game: GameStatePublic = {
        ...state.game,
        scores: nextScores,
        current: nextCurrent,
      }
      return { ...state, game }
    }

    case 'question.resolved': {
      if (!state.game || !state.game.current) {
        return { ...state, phase: 'reveal' }
      }
      const nextCurrent: CurrentQuestionPublic = {
        ...state.game.current,
        title: evt.title,
        artist: evt.artist,
        scorer: evt.scorer ?? state.game.current.scorer,
        revealAt: evt.nextAt ?? undefined,
      }
      const game: GameStatePublic = { ...state.game, current: nextCurrent }
      return { ...state, phase: 'reveal', game }
    }

    case 'game.ended': {
      const prev = state.game ?? { questionIndex: 0, scores: {} }
      const game: GameStatePublic = {
        ...prev,
        scores: evt.scores,
        winner: evt.winnerId ?? undefined,
      }
      return { ...state, phase: 'ended', game }
    }
  }
}
