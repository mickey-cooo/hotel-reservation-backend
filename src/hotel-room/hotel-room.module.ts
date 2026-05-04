import { Module } from '@nestjs/common';
import { HotelRoomService } from './hotel-room.service';
import { HotelRoomController } from './hotel-room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomEntity } from 'src/database/hotel-room.entity';
import { HotelEntity } from 'src/database/hotel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelRoomEntity, HotelEntity])],
  controllers: [HotelRoomController],
  providers: [HotelRoomService],
  exports: [HotelRoomService],
})
export class HotelRoomModule {}
