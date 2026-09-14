import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  answerBodySchema,
  createRoomBodySchema,
  joinRoomBodySchema,
  leaveRoomBodySchema,
  skipQuestionBodySchema,
  startGameBodySchema,
  updateConfigBodySchema,
} from '@lejv-party/validation';

import { RoomExceptionFilter } from './room.exception-filter.js';
import { RoomOrchestratorService } from './room-orchestrator.service.js';
import { SseEventBusService } from './sse-event-bus.service.js';

@Controller('room')
@UseFilters(RoomExceptionFilter)
export class RoomController {
  constructor(
    private readonly orchestrator: RoomOrchestratorService,
    private readonly sse: SseEventBusService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRoom(@Body() body: unknown) {
    const parsed = createRoomBodySchema.parse(body);
    return this.orchestrator.createRoom(parsed.nickname);
  }

  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Body() body: unknown) {
    const parsed = joinRoomBodySchema.parse(body);
    return this.orchestrator.joinRoom(id, parsed.nickname);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leaveRoom(@Param('id') id: string, @Body() body: unknown) {
    const parsed = leaveRoomBodySchema.parse(body);
    this.orchestrator.leaveRoom(id, parsed.playerId);
  }

  @Patch(':id/config')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateConfig(@Param('id') id: string, @Body() body: unknown) {
    const parsed = updateConfigBodySchema.parse(body);
    this.orchestrator.updateConfig(id, parsed.actorId, parsed.patch);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.NO_CONTENT)
  startGame(@Param('id') id: string, @Body() body: unknown) {
    const parsed = startGameBodySchema.parse(body);
    this.orchestrator.startGame(id, parsed.actorId);
  }

  @Post(':id/answer')
  submitAnswer(@Param('id') id: string, @Body() body: unknown) {
    const parsed = answerBodySchema.parse(body);
    return this.orchestrator.submitAnswer(id, parsed.playerId, parsed.answer);
  }

  @Post(':id/skip')
  @HttpCode(HttpStatus.NO_CONTENT)
  skipQuestion(@Param('id') id: string, @Body() body: unknown) {
    const parsed = skipQuestionBodySchema.parse(body);
    this.orchestrator.skipQuestion(id, parsed.actorId);
  }

  @Get(':id/stream')
  stream(
    @Param('id') id: string,
    @Query('p') playerId: string,
    @Res() res: Response,
  ): void {
    if (!playerId) {
      res.status(400).send('missing p');
      return;
    }
    if (!this.orchestrator.getPublicState(id)) {
      res.status(404).send('room not found');
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let closed = false;
    let unsubscribe: (() => void) | null = null;

    const writer = {
      write(chunk: string) {
        if (closed) return;
        try {
          res.write(chunk);
        } catch {
          closed = true;
        }
      },
      close() {
        if (closed) return;
        closed = true;
        try {
          res.end();
        } catch {
          // client may have aborted
        }
      },
    };

    unsubscribe = this.sse.subscribe(id, writer);
    this.orchestrator.markConnection(id, playerId, true);

    const snapshot = this.orchestrator.getPublicState(id);
    if (snapshot) {
      writer.write(
        `data: ${JSON.stringify({ type: 'room.snapshot', state: snapshot })}\n\n`,
      );
    } else {
      writer.close();
      return;
    }

    res.on('close', () => {
      unsubscribe?.();
      unsubscribe = null;
      this.orchestrator.markConnection(id, playerId, false);
    });
  }
}
