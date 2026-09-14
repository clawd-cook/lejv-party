import { Module } from '@nestjs/common';

import { QuestionEngineService } from './question-engine.service.js';
import { SongBankService } from './song-bank.service.js';
import { TranslationCacheService } from './translation-cache.service.js';
import { TranslatorService } from './translator.service.js';

@Module({
  providers: [
    SongBankService,
    TranslationCacheService,
    TranslatorService,
    QuestionEngineService,
  ],
  exports: [QuestionEngineService],
})
export class QuestionEngineModule {}
