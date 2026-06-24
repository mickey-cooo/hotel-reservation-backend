import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelEntity } from '../database/hotel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { AddressModule } from '../address/address.module';
import { PaginationModule } from '../pagination/pagination.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([HotelEntity, HotelRoomEntity]),
    HotelRoomModule,
    AddressModule,
    PaginationModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
