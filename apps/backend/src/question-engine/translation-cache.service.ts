import { Injectable } from '@nestjs/common';
import type { CEFRLevel } from '@lejv-party/domain';

@Injectable()
export class TranslationCacheService {
  private readonly cache = new Map<string, string>();

  private key(songId: string, lineIndex: number, level: CEFRLevel): string {
    return `${songId}:${lineIndex}:${level}`;
  }

  get(
    songId: string,
    lineIndex: number,
    level: CEFRLevel,
  ): string | undefined {
    return this.cache.get(this.key(songId, lineIndex, level));
  }

  set(
    songId: string,
    lineIndex: number,
    level: CEFRLevel,
    translation: string,
  ): void {
    this.cache.set(this.key(songId, lineIndex, level), translation);
  }
}
