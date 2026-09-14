import type { RoomEvent } from '@lejv-party/domain'

import { apiUrl } from '../config.js'
import { parseSseDataLine, parseSseChunk } from './parse-event.js'

export type RoomEventSubscription = {
  close: () => void
}

export type SubscribeRoomEventsOptions = {
  /** Prefer fetch-based SSE (Lynx). Default: auto-detect EventSource. */
  transport?: 'eventsource' | 'fetch'
}

function streamUrl(roomId: string, playerId: string): string {
  return apiUrl(
    `/api/room/${encodeURIComponent(roomId)}/stream?p=${encodeURIComponent(playerId)}`,
  )
}

function subscribeViaEventSource(
  roomId: string,
  playerId: string,
  onEvent: (event: RoomEvent) => void,
): RoomEventSubscription {
  const es = new EventSource(streamUrl(roomId, playerId))

  es.onmessage = (msg) => {
    if (typeof msg.data !== 'string') return
    const parsed = parseSseDataLine(msg.data)
    if (parsed) onEvent(parsed)
  }

  return {
    close: () => es.close(),
  }
}

async function subscribeViaFetch(
  roomId: string,
  playerId: string,
  onEvent: (event: RoomEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(streamUrl(roomId, playerId), { signal })
  if (!res.ok || !res.body) {
    throw new Error(`SSE connect failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      for (const evt of parseSseChunk(part + '\n\n')) {
        onEvent(evt)
      }
    }
  }
}

function subscribeViaFetchTransport(
  roomId: string,
  playerId: string,
  onEvent: (event: RoomEvent) => void,
): RoomEventSubscription {
  const controller = new AbortController()
  void subscribeViaFetch(roomId, playerId, onEvent, controller.signal).catch(
    () => {
      // Caller may reconnect; swallow abort/network errors here.
    },
  )
  return {
    close: () => controller.abort(),
  }
}

export function subscribeRoomEvents(
  roomId: string,
  playerId: string,
  onEvent: (event: RoomEvent) => void,
  options?: SubscribeRoomEventsOptions,
): RoomEventSubscription {
  const transport =
    options?.transport ??
    (typeof EventSource !== 'undefined' ? 'eventsource' : 'fetch')

  if (transport === 'eventsource') {
    return subscribeViaEventSource(roomId, playerId, onEvent)
  }

  return subscribeViaFetchTransport(roomId, playerId, onEvent)
}
