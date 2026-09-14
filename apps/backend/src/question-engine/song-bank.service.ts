import { Injectable } from '@nestjs/common';

import songsJson from '@lejv-party/game-data/song-lyric/songs.json' with { type: 'json' };

import type { Song } from './song.types.js';

@Injectable()
export class SongBankService {
  readonly songs: readonly Song[];

  constructor() {
    this.songs = songsJson as Song[];
  }
}
