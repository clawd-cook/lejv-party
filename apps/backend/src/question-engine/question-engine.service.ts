import { Injectable } from '@nestjs/common';
import type { RoomConfig } from '@lejv-party/domain';

import { filterSongs } from './song-filter.js';
import { SongBankService } from './song-bank.service.js';
import { TranslationCacheService } from './translation-cache.service.js';
import {
  TranslationError,
  TranslatorService,
} from './translator.service.js';
import type { Song } from './song.types.js';

export class NoCandidatesError extends Error {
  readonly code = 'NO_CANDIDATES';
  constructor(message = 'no candidates match config') {
    super(message);
    this.name = 'NoCandidatesError';
  }
}

export class TranslationFailedError extends Error {
  readonly code = 'TRANSLATION_FAILED';
  constructor(message = 'translation failed after retry', options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TranslationFailedError';
  }
}

export type NextQuestion = {
  songId: string;
  lineIndex: number;
  translation: string;
  title: string;
  artist: string;
};

const MAX_SONG_ATTEMPTS = 2;

@Injectable()
export class QuestionEngineService {
  constructor(
    private readonly songBank: SongBankService,
    private readonly cache: TranslationCacheService,
    private readonly translator: TranslatorService,
  ) {}

  async nextQuestion(
    config: RoomConfig,
    signal?: AbortSignal,
  ): Promise<NextQuestion> {
    const candidates = filterSongs(this.songBank.songs, config);
    if (candidates.length === 0) {
      throw new NoCandidatesError();
    }

    const pool: Song[] = candidates.slice();
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_SONG_ATTEMPTS && pool.length > 0; attempt++) {
      const songIdx = Math.floor(Math.random() * pool.length);
      const song = pool[songIdx];
      pool.splice(songIdx, 1);
      if (!song) continue;

      const lineIndex = Math.floor(Math.random() * song.lyricLines.length);
      const line = song.lyricLines[lineIndex];
      if (!line) continue;

      const cached = this.cache.get(song.id, lineIndex, config.level);
      if (cached) {
        return {
          songId: song.id,
          lineIndex,
          translation: cached,
          title: song.title,
          artist: song.artist,
        };
      }

      try {
        const translation = await this.translator.translate(
          line,
          config.level,
          signal,
        );
        this.cache.set(song.id, lineIndex, config.level, translation);
        return {
          songId: song.id,
          lineIndex,
          translation,
          title: song.title,
          artist: song.artist,
        };
      } catch (err) {
        lastError = err;
        if (!(err instanceof TranslationError)) {
          throw err;
        }
      }
    }

    throw new TranslationFailedError(undefined, { cause: lastError });
  }
}
