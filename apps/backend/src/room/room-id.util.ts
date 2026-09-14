const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

export function generateRoomCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);

  let out = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    out += ROOM_CODE_ALPHABET[bytes[i]! % ROOM_CODE_ALPHABET.length];
  }
  return out;
}

export function generatePlayerId(): string {
  return crypto.randomUUID();
}
