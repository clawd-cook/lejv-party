import type { CEFRLevel, Difficulty, RoomConfig } from '@lejv-party/domain';

import type { Song } from './song.types.js';

const DIFFICULTY_BY_LEVEL: Record<CEFRLevel, readonly Difficulty[]> = {
  A2: ['easy'],
  B1: ['easy', 'medium'],
  B2: ['easy', 'medium', 'hard'],
  C1: ['medium', 'hard'],
};

export function filterSongs(
  songs: readonly Song[],
  config: RoomConfig,
): Song[] {
  const eras = new Set(config.eras);
  const genres = new Set(config.genres);
  const difficulties = new Set(DIFFICULTY_BY_LEVEL[config.level]);
  return songs.filter(
    (s) =>
      eras.has(s.era) && genres.has(s.genre) && difficulties.has(s.difficulty),
  );
}
