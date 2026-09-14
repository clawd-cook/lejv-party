/**
 * Sparkling opens pages via scheme query, e.g.
 * `hybrid://lynxview_page?bundle=room.lynx.bundle&roomId=ABC123&playerId=...`
 *
 * Official contract: custom query keys land on `lynx.__globalProps.queryItems`
 * (see https://tiktok.github.io/sparkling/guide/scheme.html). Hosts may also
 * expose them at the top level, under `query` / `schemeParams`, or nested
 * `schemeParams.extra` — search all of those.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function coerceString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

/** Flatten likely Sparkling query bags into one ordered list of records. */
export function collectGlobalPropSources(
  props: Record<string, unknown> | null,
): Record<string, unknown>[] {
  if (!props) return []

  const sources: Record<string, unknown>[] = [props]
  const nestedKeys = [
    'queryItems',
    'query',
    'schemeParams',
    'extra',
    'initial_data',
  ] as const

  for (const key of nestedKeys) {
    const nested = asRecord(props[key])
    if (!nested) continue
    sources.push(nested)
    const nestedExtra = asRecord(nested.extra)
    if (nestedExtra) sources.push(nestedExtra)
    const nestedQueryItems = asRecord(nested.queryItems)
    if (nestedQueryItems) sources.push(nestedQueryItems)
  }

  return sources
}

function pickString(
  sources: Record<string, unknown>[],
  keys: string[],
): string {
  for (const source of sources) {
    for (const key of keys) {
      const text = coerceString(source[key]).trim()
      if (text.length > 0) return text
    }
  }
  return ''
}

export function readRoomRouteParams(
  globalProps: unknown = lynx.__globalProps,
): { roomId: string; playerId: string } {
  const props = asRecord(globalProps)
  const sources = collectGlobalPropSources(props)

  const roomId = pickString(sources, ['roomId', 'room_id']).toUpperCase()
  const playerId = pickString(sources, ['playerId', 'player_id', 'p'])

  return { roomId, playerId }
}

export function buildRoomScheme(roomId: string, playerId: string): string {
  const title = encodeURIComponent(`房间 ${roomId}`)
  // Prefer raw open() scheme (not navigate params) so custom keys are not
  // stripped by sparkling-navigation's ALLOWED_SCHEME_PARAMS allowlist.
  // Put roomId/playerId before title so a brittle query parser still sees them.
  return (
    `hybrid://lynxview_page?bundle=room.lynx.bundle` +
    `&roomId=${encodeURIComponent(roomId)}` +
    `&playerId=${encodeURIComponent(playerId)}` +
    `&title=${title}` +
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
