import type { RoomConfig } from '@lejv-party/domain'

import { requestJson } from './http.js'
import type {
  AnswerResponse,
  CreateRoomResponse,
  JoinRoomResponse,
  UpdateConfigRequest,
} from './types.js'

export async function createRoom(nickname: string): Promise<CreateRoomResponse> {
  return requestJson<CreateRoomResponse>('/api/room', {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  })
}

export async function joinRoom(
  roomId: string,
  nickname: string,
): Promise<JoinRoomResponse> {
  return requestJson<JoinRoomResponse>(
    `/api/room/${encodeURIComponent(roomId)}/join`,
    {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    },
  )
}

export async function leaveRoom(
  roomId: string,
  playerId: string,
): Promise<void> {
  await requestJson<void>(
    `/api/room/${encodeURIComponent(roomId)}/leave`,
    {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    },
  )
}

export async function updateRoomConfig(
  roomId: string,
  body: UpdateConfigRequest,
): Promise<void> {
  await requestJson<void>(
    `/api/room/${encodeURIComponent(roomId)}/config`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}

export async function startGame(
  roomId: string,
  actorId: string,
): Promise<void> {
  await requestJson<void>(
    `/api/room/${encodeURIComponent(roomId)}/start`,
    {
      method: 'POST',
      body: JSON.stringify({ actorId }),
    },
  )
}

export async function submitAnswer(
  roomId: string,
  playerId: string,
  answer: string,
): Promise<AnswerResponse> {
  return requestJson<AnswerResponse>(
    `/api/room/${encodeURIComponent(roomId)}/answer`,
    {
      method: 'POST',
      body: JSON.stringify({ playerId, answer }),
    },
  )
}

export async function skipQuestion(
  roomId: string,
  actorId: string,
): Promise<void> {
  await requestJson<void>(
    `/api/room/${encodeURIComponent(roomId)}/skip`,
    {
      method: 'POST',
      body: JSON.stringify({ actorId }),
    },
  )
}

export type { RoomConfig }
