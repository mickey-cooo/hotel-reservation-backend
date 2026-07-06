import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { LoggerEntity } from '../database/logger.entity';
import { LoggerPayloadDto } from './dto/logger.dto';

@Injectable()
export class LoggerListener {
  constructor(
    @InjectRepository(LoggerEntity)
    private readonly loggerRepository: Repository<LoggerEntity>,
  ) {}

  @OnEvent('application.log')
  async handleLog(payload: LoggerPayloadDto) {
    await this.loggerRepository.insert(payload);
  }
}
