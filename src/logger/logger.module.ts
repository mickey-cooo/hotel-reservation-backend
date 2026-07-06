import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerListener } from './logger.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerEntity } from '../database/logger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoggerEntity])],
  providers: [LoggerService, LoggerListener],
  exports: [LoggerService],
})
export class AppLogModule {}
