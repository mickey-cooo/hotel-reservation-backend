import { Module } from '@nestjs/common';
import { HotelBookingService } from './hotel-booking.service';
import { HotelBookingController } from './hotel-booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelEntity } from '../database/hotel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, HotelRoomEntity, HotelEntity]),
  ],
  controllers: [HotelBookingController],
  providers: [HotelBookingService],
})
export class HotelBookingModule {}
