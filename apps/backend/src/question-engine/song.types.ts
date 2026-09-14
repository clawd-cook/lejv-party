import type { Difficulty, Era, Genre } from '@lejv-party/domain';

export type Song = {
  id: string;
  title: string;
  artist: string;
  year: number;
  era: Era;
  genre: Genre;
  difficulty: Difficulty;
  lyricLines: string[];
};
