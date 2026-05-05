import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelEntity } from '../database/hotel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { AddressModule } from '../address/address.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([HotelEntity, HotelRoomEntity]),
    HotelRoomModule,
    AddressModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
