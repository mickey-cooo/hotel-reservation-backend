import { Module } from '@nestjs/common';
import { PaymentLogService } from './payment-log.service';
import { PaymentLogController } from './payment-log.controller';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentLogEntity])],
  controllers: [PaymentLogController],
  providers: [PaymentLogService],
})
export class PaymentLogModule {}
