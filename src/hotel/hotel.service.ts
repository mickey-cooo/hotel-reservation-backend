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
import { AddressService } from '../address/address.service';
import { AddressInterface } from '../address/interface/address.interface';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';
import { HotelRoomDataInterface } from '../hotel-room/interface/hotel-room.interface';
import { PaginationQueryDto } from '../pagination/dto/pagination.dto';
import { PaginationService } from '../pagination/pagination.service';
import { LoggerService } from '../logger/logger.service';

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
    private readonly paginationService: PaginationService,
    private readonly loggerService: LoggerService,
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

      if (body.addressDetail) {
        const createdAddress = await this.addressService.createAddress(
          body.addressDetail,
        );
        if (!createdAddress) {
          throw new BadRequestException('Failed to create address');
        }

        const updatedHotelAddress = await this.hotelRepository
          .createQueryBuilder()
          .update(HotelEntity)
          .set({
            address: { id: createdAddress.data.id },
          })
          .where('id = :id', { id: createdHotel.raw[0].id })
          .returning('*')
          .execute();

        if (!updatedHotelAddress) {
          throw new BadRequestException('Failed to update hotel address');
        }
      }

      if (body.rooms.length) {
        const createdHotelRooms = await this.hotelRoomService.createHotelRoom({
          rooms: body.rooms.map((item) => ({
            ...item,
            hotel_id: createdHotel.raw[0].id,
          })),
        });

        if (!createdHotelRooms?.length) {
          return [];
        }
      }

      return {
        message: 'Hotel created successfully',
        data: {
          hotel: createdHotel,
        },
      };
    } catch (error) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'createHotel',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findOneHotel(param: ParamHotelDto) {
    try {
      const currentHotel = await this.hotelRepository
        .createQueryBuilder('h')
        .innerJoinAndSelect('h.rooms', 'r')
        .innerJoinAndSelect('h.address', 'a')
        .where('h.id = :id', { id: param.id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      return {
        message: 'Hotel found successfully',
        data: currentHotel,
      };
    } catch (error) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'findOneHotel',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findAllHotel(body: BodyHotelIdsDto, query: PaginationQueryDto) {
    try {
      const hotel = this.hotelRepository
        .createQueryBuilder('h')
        .innerJoinAndSelect('h.rooms', 'r')
        .innerJoinAndSelect('h.address', 'a')
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .andWhere('r.deletedAt IS NULL')
        .andWhere('a.deletedAt IS NULL');

      if (body.ids?.length) {
        hotel.andWhere('h.id IN (:...ids)', { ids: body.ids });
      }

      return await this.paginationService.paginate(query, hotel);
    } catch (error) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'findAllHotel',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
        .innerJoinAndSelect('h.address', 'a')
        .where('h.id = :id', { id: param.id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .andWhere('a.deletedAt IS NULL')
        .andWhere('r.deletedAt IS NULL')
        .getOne();

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      const existHotels = await this.hotelRepository
        .createQueryBuilder('h')
        .where('h.id != :id', { id: param.id })
        .andWhere('h.name = :name', { name: body.name })
        .getOne();

      if (existHotels) {
        throw new BadRequestException('Hotel name already exists');
      }

      const updatedHotel = await this.hotelRepository
        .createQueryBuilder()
        .update(HotelEntity)
        .set({
          name: body.name,
          description: body.description,
          image: body.image,
          phoneNumber: body.phoneNumber,
          email: body.email,
          website: body.website,
        })
        .where('id = :id', { id: currentHotel.id })
        .returning([
          'id',
          'name',
          'description',
          'image',
          'phoneNumber',
          'email',
          'website',
          'status',
        ])
        .execute();

      if (!updatedHotel) {
        throw new BadRequestException('Failed to update hotel');
      }

      let updatedHotelRooms: HotelRoomDataInterface[] | undefined;
      if (body.rooms?.length) {
        const currentRoomIds = new Set(
          currentHotel.rooms?.map((room) => room.id),
        );
        const hasInvalidRoom = body.rooms.some(
          (room) => !currentRoomIds.has(room.roomId),
        );

        if (hasInvalidRoom) {
          throw new BadRequestException('Some rooms do not exist in the hotel');
        }

        updatedHotelRooms = await Promise.all(
          body.rooms.map(({ roomId, ...roomBody }) =>
            this.hotelRoomService.updateHotelRoom({ id: roomId }, roomBody),
          ),
        );

        if (!updatedHotelRooms) {
          return [];
        }
      }

      let updatedAddress: AddressInterface | undefined;
      if (body.addressDetail) {
        if (!currentHotel.address?.id) {
          throw new BadRequestException('Address not found');
        }

        updatedAddress = await this.addressService.updateAddress(
          { id: currentHotel.address.id },
          body.addressDetail,
        );
        if (!updatedAddress) {
          throw new BadRequestException('Failed to update address');
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Hotel updated successfully',
        data: {
          hotel: updatedHotel.raw[0],
          address: updatedAddress,
          rooms: updatedHotelRooms,
        },
      };
    } catch (error) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'updateHotel',
        payload: { message: error.message, stack: error.stack },
      });
      await queryRunner.rollbackTransaction();
      throw error;
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
        .execute();

      if (!deletedHotel) {
        throw new BadRequestException('Failed to delete hotel');
      }

      const roomIds = currentHotel.rooms?.map((item) => item.id) ?? [];

      await Promise.all(
        roomIds.map((roomId) =>
          this.hotelRoomService.deleteHotelRoom({ id: roomId }),
        ),
      );

      await this.addressService.deleteAddress({
        id: currentHotel.address?.id ?? '',
      });

      return {
        message: 'Hotel deleted successfully',
        data: null,
      };
    } catch (error) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'deleteHotel',
        payload: { message: error.message, stack: error.stack },
      });
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
