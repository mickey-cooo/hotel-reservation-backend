import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelEntity } from '../database/hotel.entity';
import { Repository } from 'typeorm';
import { AddressEntity } from '../database/address.entity';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { CommonStatus } from '../enum/common.status';
@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    private readonly hotelRoomService: HotelRoomService,
  ) {}

  async createHotel(body: CreateHotelBodyDto) {
    try {
      const hotelRooms = await this.hotelRepository
        .createQueryBuilder('h')
        .leftJoinAndSelect('h.rooms', 'r')
        .where('h.name = :name', { name: body.name })
        .getOne();

      if (hotelRooms) {
        throw new BadRequestException('Hotel already exists');
      }

      const createdHotel = await this.hotelRepository
        .createQueryBuilder()
        .insert()
        .values({
          ...body,
          status: CommonStatus.ACTIVE,
        })
        .execute();

      if (!createdHotel) {
        throw new BadRequestException('Failed to create hotel');
      }

      if (createdHotel.raw[0]?.id) {
        const createdHotelRooms = await this.hotelRoomService.createHotelRoom({
          rooms: body.rooms.map((item) => ({
            ...item,
            hotel_id: createdHotel.raw[0].id,
          })),
        });

        if (!createdHotelRooms?.length) {
          throw new BadRequestException('Failed to create hotel rooms');
        }

        return {
          message: 'Hotel created successfully',
          data: {
            hotel: createdHotel,
            rooms: createdHotelRooms,
          },
        };
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
