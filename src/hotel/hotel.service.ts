import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelEntity } from '../database/hotel.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { HotelRoomService } from '../hotel-room/hotel-room.service';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelReviewEntity } from '../database/hotel-review.entity';
import { CommonStatus } from '../enum/common.status';
import { ParamHotelDto, QueryHotelDto } from './dto/hotel-params.dto';
import { HotelRoomStatus } from '../enum/hotel-room.status';
import { AddressService } from '../address/address.service';
import { AddressInterface } from '../address/interface/address.interface';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';
import { HotelRoomDataInterface } from '../hotel-room/interface/hotel-room.interface';
import { PaginationService } from '../pagination/pagination.service';
import { LoggerService } from '../logger/logger.service';
import {
  parseAmenitiesFilter,
  excludeRoomsWithOverlappingBooking,
} from '../helper/room-availability.helper';
import { PaginatedResult } from '../pagination/interface/pagination.interface';

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
    } catch (error: any) {
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
    } catch (error: any) {
      this.loggerService.error({
        service: HotelService.name,
        event: 'findOneHotel',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  private applyHotelSearchFilters(
    qb: SelectQueryBuilder<HotelEntity>,
    query: QueryHotelDto,
  ): void {
    qb.andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
      .andWhere('r.deletedAt IS NULL')
      .andWhere('a.deletedAt IS NULL');

    if (query.ids?.length) {
      qb.andWhere('h.id IN (:...filterIds)', { filterIds: query.ids });
    }

    if (query.category) {
      qb.andWhere('h.category = :category', { category: query.category });
    }

    if (query.price) {
      qb.andWhere('r.price <= :price', { price: query.price });
    }

    if (query.rating) {
      qb.andWhere(
        (sub) => {
          const subQuery = sub
            .subQuery()
            .select('review.hotel')
            .from(HotelReviewEntity, 'review')
            .where('review.deletedAt IS NULL')
            .groupBy('review.hotel')
            .having('AVG(review.rating) >= :rating')
            .getQuery();
          return `h.id IN ${subQuery}`;
        },
        { rating: query.rating },
      );
    }

    if (query.amenities) {
      qb.andWhere('r.amenities::text[] @> :amenities::text[]', {
        amenities: parseAmenitiesFilter(query.amenities),
      });
    }

    if (query.name) {
      qb.andWhere('h.name LIKE :name', { name: `%${query.name}%` });
    }

    if (query.guests?.length) {
      const guestCapacity = query.guests.reduce(
        (sum, guest) => sum + guest.count,
        0,
      );
      qb.andWhere('r.capacity >= :guestCapacity', { guestCapacity });
    }

    if (query.rooms) {
      qb.andWhere(
        (sub) => {
          const subQuery = sub
            .subQuery()
            .select('COUNT(*)')
            .from(HotelRoomEntity, 'hr2')
            .where('hr2.hotel = h.id')
            .andWhere('hr2.deletedAt IS NULL')
            .andWhere('hr2.status = :roomAvailableStatus')
            .getQuery();
          return `(${subQuery}) >= :roomsCount`;
        },
        {
          roomAvailableStatus: HotelRoomStatus.AVAILABLE,
          roomsCount: query.rooms,
        },
      );
    }

    if (query.checkInDate && query.checkOutDate) {
      qb.andWhere('r.status = :roomStatus', {
        roomStatus: HotelRoomStatus.AVAILABLE,
      });
      excludeRoomsWithOverlappingBooking(qb, 'r', {
        checkInDate: query.checkInDate,
        checkOutDate: query.checkOutDate,
      });
    }
  }

  async findAllHotel(
    query: QueryHotelDto,
  ): Promise<PaginatedResult<HotelEntity>> {
    try {
      const idQuery = this.hotelRepository
        .createQueryBuilder('h')
        .leftJoin('h.rooms', 'r')
        .leftJoin('h.address', 'a')
        .distinct(true)
        .orderBy('h.createdAt', 'DESC');
      this.applyHotelSearchFilters(idQuery, query);

      const page = await this.paginationService.paginate(query, idQuery);

      const pageIds = page.data.map((item) => item.id);
      if (!pageIds.length) {
        return { ...page, data: [] };
      }

      // Re-hydrate with full relations, reapplying the same filters so
      // `rooms` only contains the rooms that actually matched the search
      // instead of every room the hotel has.
      const hydrationQuery = this.hotelRepository
        .createQueryBuilder('h')
        .leftJoinAndSelect('h.rooms', 'r')
        .leftJoinAndSelect('h.address', 'a')
        .andWhere('h.id IN (:...pageIds)', { pageIds });
      this.applyHotelSearchFilters(hydrationQuery, query);

      const hotels = await hydrationQuery.getMany();
      const hotelById = new Map(hotels.map((item) => [item.id, item]));

      return {
        ...page,
        data: pageIds
          .map((id) => hotelById.get(id))
          .filter((item): item is HotelEntity => !!item),
      };
    } catch (error: any) {
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
          category: body.category,
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
          'category',
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
    } catch (error: any) {
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
    } catch (error: any) {
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
