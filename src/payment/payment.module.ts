import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { PaymentEntity } from '../database/payment.entity';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { UserEntity } from '../database/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      UserEntity,
      BookingEntity,
      PaymentLogEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
