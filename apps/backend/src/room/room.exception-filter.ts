import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { errorStatus } from '@lejv-party/domain';
import { ZodError } from 'zod';

import { RoomError } from './room.errors.js';

@Catch()
export class RoomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof RoomError) {
      const status = errorStatus(exception.code);
      res.status(status).json({
        error: exception.code,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof ZodError) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'INVALID_BODY',
        issues: exception.issues,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(body);
      return;
    }

    console.error('[api] unexpected error', exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'INTERNAL' });
  }
}
