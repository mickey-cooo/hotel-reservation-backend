import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogLevel } from '../enum/common.status';

@Injectable()
export class LoggerService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  info(payload: any) {
    this.eventEmitter.emit('application.log', {
      level: LogLevel.INFO,
      ...payload,
    });
  }

  warn(payload: any) {
    this.eventEmitter.emit('application.log', {
      level: LogLevel.WARN,
      ...payload,
    });
  }

  debug(payload: any) {
    this.eventEmitter.emit('application.log', {
      level: LogLevel.DEBUG,
      ...payload,
    });
  }

  error(payload: any) {
    this.eventEmitter.emit('application.log', {
      level: LogLevel.ERROR,
      ...payload,
    });
  }
}
