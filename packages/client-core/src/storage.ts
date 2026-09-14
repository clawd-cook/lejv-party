const STORAGE_PREFIX = 'lejv-party:player:'

function storageKey(roomId: string): string {
  return `${STORAGE_PREFIX}${roomId.toUpperCase()}`
}

export function savePlayerId(roomId: string, playerId: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(storageKey(roomId), playerId)
}

export function loadPlayerId(roomId: string): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(storageKey(roomId))
}

export function clearPlayerId(roomId: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(storageKey(roomId))
}
