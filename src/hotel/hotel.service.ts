import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelEntity } from '../database/hotel.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { CommonStatus } from '../enum/common.status';
import { BodyHotelIdsDto, ParamHotelDto } from './dto/hotel-params.dto';
import { AddressService } from 'src/address/address.service';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';
@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    private readonly hotelRoomService: HotelRoomService,
    private readonly addressService: AddressService,
    private readonly dataSource: DataSource,
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

  async findAllHotel(body: BodyHotelIdsDto) {
    try {
      const hotels = await this.hotelRepository
        .createQueryBuilder('h')
        .whereInIds(body.ids)
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getRawMany();

      if (!hotels) {
        throw new NotFoundException('Hotels not found');
      }

      return {
        message: 'Hotels found successfully',
        data: hotels,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateHotel(param: ParamHotelDto, body: UpdateHotelBodyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentHotel = await this.hotelRepository
        .createQueryBuilder('h')
        .innerJoinAndSelect('h.rooms', 'r')
        .where('h.id = :id', { id: param.id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      const updatedHotel = await this.hotelRepository
        .createQueryBuilder()
        .update(HotelEntity)
        .set({
          ...body,
          address: {
            country: body.addressDetail.country,
            province: body.addressDetail.province,
            district: body.addressDetail.district,
            subDistrict: body.addressDetail.subDistrict,
            postalCode: body.addressDetail.postalCode,
            detail: body.addressDetail.detail,
          },
        })
        .where('id = :id', { id: currentHotel.id })
        .returning('*')
        .execute();

      if (!updatedHotel) {
        throw new BadRequestException('Failed to update hotel');
      }

      if (body.rooms?.length) {
        const roomIds = currentHotel.rooms?.map((item) => item.id) ?? [];
        const updatedHotelRooms = await Promise.all(
          body.rooms.map((room, index) =>
            this.hotelRoomService.updateHotelRoom({ id: roomIds[index] }, room),
          ),
        );
        if (!updatedHotelRooms) {
          throw new BadRequestException('Failed to update hotel rooms');
        }

        return {
          message: 'Hotel updated successfully',
          data: {
            hotel: updatedHotel.raw[0],
            rooms: updatedHotelRooms,
          },
        };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteHotel(param: ParamHotelDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentHotel = await this.hotelRepository
        .createQueryBuilder('h')
        .where('h.id = :id', { id: param.id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      const deletedHotel = await this.hotelRepository
        .createQueryBuilder()
        .update(HotelEntity)
        .set({
          status: CommonStatus.DELETED,
        })
        .where('id = :id', { id: currentHotel.id })
        .returning('*')
        .execute();
      if (!deletedHotel) {
        throw new BadRequestException('Failed to delete hotel');
      }

      if (currentHotel.rooms?.length) {
        const roomIds = currentHotel.rooms?.map((item) => item.id) ?? [];

        const deletedHotelRooms = await Promise.all(
          roomIds.map((roomId) =>
            this.hotelRoomService.deleteHotelRoom({ id: roomId }),
          ),
        );

        if (!deletedHotelRooms) {
          throw new BadRequestException('Failed to delete hotel rooms');
        }

        return {
          message: 'Hotel deleted successfully',
          data: {
            hotel: deletedHotel.raw[0],
            rooms: deletedHotelRooms,
          },
        };
      }

      return {
        message: 'Hotel deleted successfully',
        data: null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
