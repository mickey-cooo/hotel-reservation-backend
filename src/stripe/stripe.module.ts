import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { OrderEntity } from '../database/order.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { StripeController } from './stripe.controller';
import { StripeProvider } from './stripe.provider';
import { StripeService } from './stripe.service';
import { AppLogModule } from '../logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransactionEntity,
      BookingEntity,
      OrderEntity,
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    AppLogModule,
  ],
  controllers: [StripeController],
  providers: [StripeProvider, StripeService],
  exports: ['STRIPE_CLIENT', StripeService],
})
export class StripeModule {}
