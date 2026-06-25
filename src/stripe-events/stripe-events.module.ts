import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { OrderEntity } from '../database/order.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { StripeEventEntity } from '../database/stripe-event.entity';
import { StripeModule } from '../stripe/stripe.module';
import { StripeEventsController } from './stripe-events.controller';
import { StripeEventsService } from './stripe-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StripeEventEntity,
      PaymentTransactionEntity,
      OrderEntity,
      BookingEntity,
    ]),
    StripeModule,
  ],
  controllers: [StripeEventsController],
  providers: [StripeEventsService],
})
export class StripeEventsModule {}
