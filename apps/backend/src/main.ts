import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    ObserveInstrument ? { instrument: ObserveInstrument } : undefined,
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}

// Do not top-level-await bootstrap(): Vercel patches Server#listen and only
// starts the captured server after the entry module finishes evaluating.
void bootstrap();
