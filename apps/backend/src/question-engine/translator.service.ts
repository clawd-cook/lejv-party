import { Injectable, Logger } from '@nestjs/common';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import type { CEFRLevel } from '@lejv-party/domain';

const TRANSLATE_TIMEOUT_MS = 8000;
const TRANSLATE_TEMPERATURE = 0.4;

export class TranslationError extends Error {
  readonly code = 'TRANSLATION_ERROR';
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'TranslationError';
  }
}

@Injectable()
export class TranslatorService {
  private readonly logger = new Logger(TranslatorService.name);
  private provider: ReturnType<typeof createOpenAICompatible> | null = null;

  private getProvider(): ReturnType<typeof createOpenAICompatible> {
    if (this.provider) return this.provider;
    const baseURL = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;
    if (!baseURL || !apiKey || !model) {
      throw new TranslationError('missing AI_* env');
    }
    this.provider = createOpenAICompatible({
      name: 'custom',
      baseURL,
      apiKey,
    });
    return this.provider;
  }

  private buildPrompt(line: string, level: CEFRLevel): string {
    return [
      `你是一名中英歌词译者。将下面一行中文歌词翻译成 CEFR ${level} 词汇范围内的地道英文，`,
      '保留意象与情感，不要出现歌名、歌手名、拼音、直接罗马音。只返回翻译文本一句，不要多余说明。',
      '',
      `歌词：${line}`,
    ].join('\n');
  }

  private withTimeout(external?: AbortSignal): {
    signal: AbortSignal;
    dispose: () => void;
  } {
    const ctrl = new AbortController();
    const timeout = setTimeout(
      () => ctrl.abort(new Error('translate timeout')),
      TRANSLATE_TIMEOUT_MS,
    );
    const onExternal = () => ctrl.abort(external?.reason);
    if (external) {
      if (external.aborted) ctrl.abort(external.reason);
      else external.addEventListener('abort', onExternal, { once: true });
    }
    return {
      signal: ctrl.signal,
      dispose: () => {
        clearTimeout(timeout);
        if (external) external.removeEventListener('abort', onExternal);
      },
    };
  }

  async translate(
    line: string,
    level: CEFRLevel,
    signal?: AbortSignal,
  ): Promise<string> {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      throw new TranslationError('empty input line');
    }

    const provider = this.getProvider();
    const modelId = process.env.AI_MODEL;
    if (!modelId) {
      throw new TranslationError('missing AI_* env');
    }

    const { signal: composedSignal, dispose } = this.withTimeout(signal);
    try {
      const { text } = await generateText({
        model: provider(modelId),
        prompt: this.buildPrompt(trimmedLine, level),
        temperature: TRANSLATE_TEMPERATURE,
        abortSignal: composedSignal,
      });
      const translation = text.trim();
      if (translation.length === 0) {
        throw new TranslationError('empty translation');
      }
      return translation;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(`translate failed: ${reason}`);
      if (err instanceof TranslationError) throw err;
      throw new TranslationError('translation failed', { cause: err });
    } finally {
      dispose();
    }
  }
}
