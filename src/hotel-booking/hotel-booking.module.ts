import { Module } from '@nestjs/common';
import { HotelBookingService } from './hotel-booking.service';
import { HotelBookingController } from './hotel-booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelEntity } from '../database/hotel.entity';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { MailModule } from '../mail/mail.module';
import { AppLogModule } from '../logger/logger.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      HotelRoomEntity,
      HotelEntity,
      PaymentLogEntity,
    ]),
    MailModule,
    AppLogModule,
    StripeModule,
  ],
  controllers: [HotelBookingController],
  providers: [HotelBookingService],
})
export class HotelBookingModule {}
