import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { CardEntity } from '../database/card.entity';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { UserEntity } from '../database/user.entity';
import { AppLogModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardEntity,
      UserEntity,
      BookingEntity,
      PaymentLogEntity,
    ]),
    AppLogModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
