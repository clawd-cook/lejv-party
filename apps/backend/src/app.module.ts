import { Module, type DynamicModule, type Type } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RoomModule } from './room/room.module.js';

const observeAppKey = process.env.NEST_OBSERVE_APP_KEY;
const observeAppSecret = process.env.NEST_OBSERVE_APP_SECRET;
const observeEnabled = Boolean(observeAppKey && observeAppSecret);

const observe = observeEnabled ? createObserveModule() : undefined;

export const ObserveInstrument = observe?.ObserveInstrument;

const observeImports: Array<DynamicModule | Type<unknown>> = observe
  ? [
      observe.ObserveModule.forRoot({
        appKey: observeAppKey!,
        appSecret: observeAppSecret!,
        serviceId: 'backend',
      }),
    ]
  : [];

@Module({
  imports: [...observeImports, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
