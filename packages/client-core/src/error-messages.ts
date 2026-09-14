export function mapRoomErrorMessage(code: string): string {
  switch (code) {
    case 'ROOM_NOT_FOUND':
      return '房间不存在，请检查房间号'
    case 'ROOM_FULL':
      return '房间人数已满'
    case 'NICKNAME_TAKEN':
      return '该昵称已被占用，请换一个'
    case 'GAME_IN_PROGRESS':
      return '房间已开始游戏，暂不能加入'
    case 'INVALID_NICKNAME':
      return '昵称格式不正确'
    case 'ROOM_CODE_COLLISION':
      return '房间号生成冲突，请重试'
    case 'INVALID_BODY':
      return '请求参数不正确'
    case 'INTERNAL':
      return '操作失败，请重试'
    default:
      return '操作失败，请重试'
  }
}

export function mapApiErrorBody(body: {
  error?: string
  message?: string
}): string {
  if (body.error) return mapRoomErrorMessage(body.error)
  return body.message ?? '操作失败，请重试'
}
