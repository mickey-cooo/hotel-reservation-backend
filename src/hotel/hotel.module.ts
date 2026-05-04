import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelEntity } from '../database/hotel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { AddressEntity } from '../database/address.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HotelEntity, AddressEntity, HotelRoomEntity]),
    HotelRoomModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
