export type RoomErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'NICKNAME_TAKEN'
  | 'ROOM_FULL'
  | 'GAME_IN_PROGRESS'
  | 'ALREADY_STARTED'
  | 'ALREADY_ANSWERED'
  | 'NOT_IN_QUESTION'
  | 'NOT_IN_GAME'
  | 'INVALID_NICKNAME'
  | 'INVALID_CONFIG'
  | 'INVALID_LEVEL'
  | 'INVALID_ERAS'
  | 'INVALID_GENRES'
  | 'INVALID_VICTORY_SCORE'
  | 'NOT_ENOUGH_PLAYERS'
  | 'PLAYER_EXISTS'
  | 'ROOM_CODE_COLLISION'
  | 'NOT_HOST'
  | 'NOT_A_MEMBER'
  | 'INTERNAL'

export function errorStatus(code: string): number {
  switch (code) {
    case 'ROOM_NOT_FOUND':
      return 404
    case 'NICKNAME_TAKEN':
    case 'ROOM_FULL':
    case 'GAME_IN_PROGRESS':
    case 'ALREADY_STARTED':
    case 'ALREADY_ANSWERED':
    case 'NOT_IN_QUESTION':
    case 'NOT_IN_GAME':
    case 'INVALID_NICKNAME':
    case 'INVALID_CONFIG':
    case 'INVALID_LEVEL':
    case 'INVALID_ERAS':
    case 'INVALID_GENRES':
    case 'INVALID_VICTORY_SCORE':
    case 'NOT_ENOUGH_PLAYERS':
    case 'PLAYER_EXISTS':
    case 'ROOM_CODE_COLLISION':
      return 409
    case 'NOT_HOST':
    case 'NOT_A_MEMBER':
      return 403
    default:
      return 500
  }
}
