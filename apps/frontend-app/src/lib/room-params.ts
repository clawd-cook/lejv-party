/**
 * Sparkling opens pages via scheme query, e.g.
 * `hybrid://lynxview_page?bundle=room.lynx.bundle&roomId=ABC123&playerId=...`
 *
 * Query keys are assumed to surface on `lynx.__globalProps` (and optionally
 * nested under `query` / `queryItems` / `schemeParams`). Documented keys:
 * `roomId`, `playerId` (alias `p`).
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return null
}

function pickString(
  source: Record<string, unknown> | null,
  keys: string[],
): string {
  if (!source) return ''
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return ''
}

export function readRoomRouteParams(): { roomId: string; playerId: string } {
  const props = asRecord(lynx.__globalProps as unknown)
  const nested =
    asRecord(props?.query) ??
    asRecord(props?.queryItems) ??
    asRecord(props?.schemeParams)

  const roomId = (
    pickString(props, ['roomId', 'room_id']) ||
    pickString(nested, ['roomId', 'room_id'])
  ).toUpperCase()

  const playerId =
    pickString(props, ['playerId', 'player_id', 'p']) ||
    pickString(nested, ['playerId', 'player_id', 'p'])

  return { roomId, playerId }
}

export function buildRoomScheme(roomId: string, playerId: string): string {
  const title = encodeURIComponent(`房间 ${roomId}`)
  return (
    `hybrid://lynxview_page?bundle=room.lynx.bundle` +
    `&title=${title}` +
    `&roomId=${encodeURIComponent(roomId)}` +
    `&playerId=${encodeURIComponent(playerId)}` +
    `&screen_orientation=portrait`
  )
}

export function buildHomeScheme(): string {
  return (
    'hybrid://lynxview_page?bundle=home.lynx.bundle' +
    '&title=%E6%AD%8C%E8%AF%8D%E7%8C%9C%E7%8C%9C%E7%8C%9C' +
    '&screen_orientation=portrait'
  )
}
