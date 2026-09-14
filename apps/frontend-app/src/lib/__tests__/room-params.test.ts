import { describe, expect, test } from 'vitest'

import {
  buildRoomScheme,
  collectGlobalPropSources,
  readRoomRouteParams,
} from '../room-params.js'

describe('readRoomRouteParams', () => {
  test('reads official queryItems bag', () => {
    expect(
      readRoomRouteParams({
        queryItems: { roomId: 'ab12cd', playerId: 'p-1' },
      }),
    ).toEqual({ roomId: 'AB12CD', playerId: 'p-1' })
  })

  test('reads top-level keys', () => {
    expect(
      readRoomRouteParams({ roomId: 'XYZ789', playerId: 'host' }),
    ).toEqual({ roomId: 'XYZ789', playerId: 'host' })
  })

  test('reads schemeParams.extra (native hybrid bag)', () => {
    expect(
      readRoomRouteParams({
        schemeParams: { extra: { roomId: 'vn2faa', p: 'alias-player' } },
      }),
    ).toEqual({ roomId: 'VN2FAA', playerId: 'alias-player' })
  })

  test('prefers queryItems when empty top-level query object exists', () => {
    expect(
      readRoomRouteParams({
        query: {},
        queryItems: { roomId: 'QQ11WW', playerId: 'z' },
      }),
    ).toEqual({ roomId: 'QQ11WW', playerId: 'z' })
  })

  test('returns empty when missing', () => {
    expect(readRoomRouteParams({})).toEqual({ roomId: '', playerId: '' })
  })
})

describe('buildRoomScheme', () => {
  test('includes roomId and playerId query keys', () => {
    const scheme = buildRoomScheme('AB12CD', 'player-9')
    expect(scheme).toContain('bundle=room.lynx.bundle')
    expect(scheme).toContain('roomId=AB12CD')
    expect(scheme).toContain('playerId=player-9')
  })
})

describe('collectGlobalPropSources', () => {
  test('includes nested extra', () => {
    const sources = collectGlobalPropSources({
      schemeParams: { extra: { roomId: 'A' } },
    })
    expect(sources.some((s) => s.roomId === 'A')).toBe(true)
  })
})
