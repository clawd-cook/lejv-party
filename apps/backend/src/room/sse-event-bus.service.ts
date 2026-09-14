import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SSE_HEARTBEAT_INTERVAL_MS, type RoomEvent } from '@lejv-party/domain';

export type SseWriter = {
  write(chunk: string): void;
  close(): void;
};

@Injectable()
export class SseEventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SseEventBusService.name);
  private readonly subs = new Map<string, Set<SseWriter>>();
  private heartbeat: NodeJS.Timeout | null = null;

  private static readonly HEARTBEAT_LINE = ':ka\n\n';

  onModuleInit(): void {
    this.heartbeat = setInterval(() => {
      for (const [roomId, writers] of Array.from(this.subs.entries())) {
        this.broadcastRaw(roomId, writers, SseEventBusService.HEARTBEAT_LINE);
      }
    }, SSE_HEARTBEAT_INTERVAL_MS);
    this.heartbeat.unref();
  }

  onModuleDestroy(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
  }

  subscribe(roomId: string, writer: SseWriter): () => void {
    let set = this.subs.get(roomId);
    if (!set) {
      set = new Set<SseWriter>();
      this.subs.set(roomId, set);
    }
    set.add(writer);

    let unsubscribed = false;
    return () => {
      if (unsubscribed) return;
      unsubscribed = true;
      const current = this.subs.get(roomId);
      if (!current) return;
      current.delete(writer);
      if (current.size === 0) this.subs.delete(roomId);
    };
  }

  publish(roomId: string, event: RoomEvent): void {
    const writers = this.subs.get(roomId);
    if (!writers || writers.size === 0) return;
    const line = `data: ${JSON.stringify(event)}\n\n`;
    this.broadcastRaw(roomId, writers, line);
  }

  closeRoom(roomId: string): void {
    const writers = this.subs.get(roomId);
    if (!writers) return;
    for (const w of writers) {
      try {
        w.close();
      } catch {
        // idempotent close
      }
    }
    this.subs.delete(roomId);
  }

  private broadcastRaw(
    roomId: string,
    writers: Set<SseWriter>,
    line: string,
  ): void {
    let dead: SseWriter[] | null = null;
    for (const w of writers) {
      try {
        w.write(line);
      } catch (err) {
        this.logger.debug(`SSE writer dropped for room ${roomId}`, err);
        (dead ??= []).push(w);
      }
    }
    if (!dead) return;

    for (const w of dead) {
      writers.delete(w);
      try {
        w.close();
      } catch {
        // ignore
      }
    }
    if (writers.size === 0) this.subs.delete(roomId);
  }
}
