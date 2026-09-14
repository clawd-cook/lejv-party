import { describe, expect, it } from 'vitest'

import { clientReducer } from './room-client-reducer.js'

describe('clientReducer', () => {
  it('applies room.snapshot as full replace', () => {
    const state = {
      id: 'ABC123',
      hostId: 'p1',
      players: [],
      config: {
        level: 'B1' as const,
        eras: ['00s' as const],
        genres: ['流行' as const],
        victoryScore: 5,
      },
      phase: 'lobby' as const,
      createdAt: 1,
    }

    const next = clientReducer(null, {
      type: 'event',
      event: { type: 'room.snapshot', state },
    })

    expect(next).toEqual(state)
  })

  it('updates hostId on host.changed', () => {
    const state = {
      id: 'ABC123',
      hostId: 'p1',
      players: [{ id: 'p2', nickname: 'B', joinedAt: 2, connected: true }],
      config: {
        level: 'B1' as const,
        eras: ['00s' as const],
        genres: ['流行' as const],
        victoryScore: 5,
      },
      phase: 'lobby' as const,
      createdAt: 1,
    }

    const next = clientReducer(state, {
      type: 'event',
      event: { type: 'host.changed', hostId: 'p2' },
    })

    expect(next?.hostId).toBe('p2')
  })
})
