import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { Repository } from 'typeorm';
import {
  // CreateHotelRoomBodyDto,
  CreateManyHotelRoomBodyDto,
} from './dto/create-hotel-room.dto';
import { HotelEntity } from '../database/hotel.entity';
import { CommonStatus } from 'src/enum/common.status';
import {
  HotelRoomBodyParamsDto,
  HotelRoomParamDto,
} from './dto/hotel-room-params.dto';
import { UpdateHotelRoomBodyDto } from './dto/update-hotel-room.dto';
import { HotelRoomStatus } from 'src/enum/hotel-room.status';
import { HotelRoomDataInterface } from './interface/hotel-room.interface';

@Injectable()
export class HotelRoomService {
  constructor(
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
  ) {}

  async createHotelRoom(
    body: CreateManyHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface[]> {
    try {
      const hotelId = body.rooms[0]?.hotel_id;
      const hotel = await this.hotelRepository
        .createQueryBuilder('h')
        .where('h.id = :id', { id: hotelId })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

      const createdHotelRooms = await this.hotelRoomRepository
        .createQueryBuilder()
        .insert()
        .into(HotelRoomEntity)
        .values(
          body.rooms.map((item) => ({
            ...item,
            hotel,
          })),
        )
        .returning('*')
        .execute();

      if (!createdHotelRooms) {
        throw new BadRequestException('Failed to create hotel room');
      }

      return createdHotelRooms.raw;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllHotelRooms(
    param: HotelRoomBodyParamsDto,
  ): Promise<HotelRoomDataInterface[]> {
    try {
      const hotelRooms = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .whereInIds(param.ids)
        .andWhere('hr.deletedAt IS NULL')
        .getRawMany();

      if (!hotelRooms) {
        throw new NotFoundException('Hotel rooms not found');
      }

      return hotelRooms;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneHotelRoom(
    param: HotelRoomParamDto,
  ): Promise<HotelRoomDataInterface> {
    try {
      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      return {
        ...hotelRoom,
        hotel_id: hotelRoom.hotel?.id || '',
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateHotelRoom(
    param: HotelRoomParamDto,
    body: UpdateHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface> {
    try {
      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      const updatedHotelRoom = await this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({
          ...body,
        })
        .where('id = :id', { id: hotelRoom.id })
        .returning('*')
        .execute();

      if (!updatedHotelRoom) {
        throw new BadRequestException('Failed to update hotel room');
      }
      return {
        ...updatedHotelRoom.raw,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteHotelRoom(param: HotelRoomParamDto): Promise<void> {
    try {
      const currentHotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!currentHotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      const deletedHotelRoom = await this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({
          deletedAt: new Date(),
        })
        .where('id = :id', { id: currentHotelRoom.id })
        .returning('*')
        .execute();

      if (!deletedHotelRoom) {
        throw new BadRequestException('Failed to delete hotel room');
      }

      return;
    } catch (error) {
      throw new Error(error);
    }
  }

  async hotelRoomAvailability(
    param: HotelRoomParamDto,
  ): Promise<HotelRoomDataInterface> {
    try {
      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      if (hotelRoom.status !== HotelRoomStatus.AVAILABLE) {
        throw new BadRequestException('Hotel room is not available');
      }

      if (hotelRoom.capacity < 1) {
        throw new BadRequestException('Hotel room capacity is not available');
      }

      if (hotelRoom.price < 0) {
        throw new BadRequestException('Hotel room price is not available');
      }
      return {
        ...hotelRoom,
        hotel_id: hotelRoom.hotel?.id || '',
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
