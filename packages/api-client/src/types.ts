import type { RoomConfig, RoomStatePublic } from '@lejv-party/domain'

export type ApiErrorBody = {
  error: string
  message?: string
  issues?: unknown
}

export type CreateRoomResponse = {
  roomId: string
  playerId: string
  state: RoomStatePublic
}

export type JoinRoomResponse = {
  playerId: string
  state: RoomStatePublic
}

export type AnswerResponse = {
  correct: boolean
}

export type UpdateConfigRequest = {
  actorId: string
  patch: Partial<RoomConfig>
}
