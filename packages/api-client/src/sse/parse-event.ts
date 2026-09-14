import type { RoomEvent } from '@lejv-party/domain'

export function parseSseDataLine(data: string): RoomEvent | null {
  if (data.startsWith(':')) return null
  try {
    return JSON.parse(data) as RoomEvent
  } catch {
    return null
  }
}

export function parseSseChunk(chunk: string): RoomEvent[] {
  const events: RoomEvent[] = []
  const lines = chunk.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data: ')) continue
    const parsed = parseSseDataLine(line.slice(6))
    if (parsed) events.push(parsed)
  }
  return events
}
