import { Module } from '@nestjs/common';
import { PaymentLogService } from './payment-log.service';
import { PaymentLogController } from './payment-log.controller';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLogModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLogEntity]), AppLogModule],
  controllers: [PaymentLogController],
  providers: [PaymentLogService],
})
export class PaymentLogModule {}
