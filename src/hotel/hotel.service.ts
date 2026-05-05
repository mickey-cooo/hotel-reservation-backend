import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelEntity } from '../database/hotel.entity';
import { Repository } from 'typeorm';
import { AddressEntity } from '../database/address.entity';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { CommonStatus } from '../enum/common.status';
import { ParamHotelDto } from './dto/hotel-params.dto';
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
          address: {
            country: body.addressDetail.country,
            province: body.addressDetail.province,
            district: body.addressDetail.district,
            subDistrict: body.addressDetail.subDistrict,
            postalCode: body.addressDetail.postalCode,
            detail: body.addressDetail.detail,
          },
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

  async findOneHotel(param: ParamHotelDto) {
    try {
      const currentHotel = await this.hotelRepository
        .createQueryBuilder('h')
        .where('h.id = :id', { id: param.id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .leftJoinAndSelect('h.rooms', 'r')
        .select([
          'h.id as "id"',
          'h.name as "name"',
          'h.description as "description"',
          'h.image as "image"',
          'h.phoneNumber as "phoneNumber"',
          'h.email as "email"',
          'h.website as "website"',
          'h.status as "status"',
          'r.id as "roomId"',
          'r.name as "roomName"',
          'r.description as "roomDescription"',
          'r.image as "roomImage"',
          'r.price as "roomPrice"',
          'r.capacity as "roomCapacity"',
          'r.policies as "roomPolicies"',
          'r.amenities as "roomAmenities"',
          'r.type as "roomType"',
        ])
        .getOne();

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      return {
        message: 'Hotel found successfully',
        data: currentHotel,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
