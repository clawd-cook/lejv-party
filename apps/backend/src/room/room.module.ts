import { Module } from '@nestjs/common';

import { QuestionEngineModule } from '../question-engine/question-engine.module.js';
import { InMemoryRoomStore } from './in-memory-room.store.js';
import { RoomController } from './room.controller.js';
import { RoomOrchestratorService } from './room-orchestrator.service.js';
import { SseEventBusService } from './sse-event-bus.service.js';

@Module({
  imports: [QuestionEngineModule],
  controllers: [RoomController],
  providers: [InMemoryRoomStore, SseEventBusService, RoomOrchestratorService],
})
export class RoomModule {}
