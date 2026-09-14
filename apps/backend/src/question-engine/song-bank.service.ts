import { createRequire } from 'node:module';

import { Injectable } from '@nestjs/common';

import type { Song } from './song.types.js';

const require = createRequire(import.meta.url);

@Injectable()
export class SongBankService {
  readonly songs: readonly Song[];

  constructor() {
    const songsPath = require.resolve(
      '@lejv-party/game-data/song-lyric/songs.json',
    );
    const raw = require(songsPath) as unknown;
    this.songs = raw as Song[];
  }
}
