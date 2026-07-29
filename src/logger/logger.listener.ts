import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { LoggerEntity } from '../database/logger.entity';
import { LoggerPayloadDto } from './dto/logger.dto';
import { LogLevel } from '../enum/common.status';

@Injectable()
export class LoggerListener {
  private readonly logger = new Logger(LoggerListener.name);

  constructor(
    @InjectRepository(LoggerEntity)
    private readonly loggerRepository: Repository<LoggerEntity>,
  ) {}

  @OnEvent('application.log')
  async handleLog(payload: LoggerPayloadDto) {
    this.printToTerminal(payload);
    await this.loggerRepository.insert(payload);
  }

  private printToTerminal(payload: LoggerPayloadDto) {
    const context = payload.service ?? payload.event ?? 'App';
    const message = payload.payload?.message ?? '';

    switch (payload.level) {
      case LogLevel.ERROR:
        this.logger.error(message, payload.payload?.stack, context);
        break;
      case LogLevel.WARN:
        this.logger.warn(message, context);
        break;
      case LogLevel.DEBUG:
        this.logger.debug(message, context);
        break;
      default:
        this.logger.log(message, context);
    }
  }
}
