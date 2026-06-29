import { Module } from '@nestjs/common';
import { HotelRoomService } from './hotel-room.service';
import { HotelRoomController } from './hotel-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelEntity } from '../database/hotel.entity';
import { BookingEntity } from '../database/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HotelRoomEntity, HotelEntity, BookingEntity]),
  ],
  controllers: [HotelRoomController],
  providers: [HotelRoomService],
  exports: [HotelRoomService],
})
export class HotelRoomModule {}
