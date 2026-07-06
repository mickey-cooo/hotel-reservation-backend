import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateManyHotelRoomBodyDto } from './dto/create-hotel-room.dto';
import { HotelEntity } from '../database/hotel.entity';
import { CommonStatus } from '../enum/common.status';
import {
  HotelRoomBodyParamsDto,
  HotelRoomParamDto,
} from './dto/hotel-room-params.dto';
import { UpdateHotelRoomBodyDto } from './dto/update-hotel-room.dto';
import { HotelRoomStatus } from '../enum/hotel-room.status';
import { HotelRoomDataInterface } from './interface/hotel-room.interface';
import { BookingEntity } from '../database/booking.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { HotelRoomQueryParamsDto } from './dto/hotel-room-query.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HotelRoomService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly loggerService: LoggerService,
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

      // const createdHotelRooms = await this.hotelRoomRepository
      //   .createQueryBuilder()
      //   .insert()
      //   .into(HotelRoomEntity)
      //   .values(
      //     body.rooms.map((item) => ({
      //       ...item,
      //       hotel,
      //     })),
      //   )
      //   .returning('*')
      //   .execute();
      const hotelRoomData = body.rooms.map((item) => ({
        ...item,
        hotel,
      }));
      const createdHotelRooms =
        await this.hotelRoomRepository.save(hotelRoomData);

      if (!createdHotelRooms) {
        throw new BadRequestException('Failed to create hotel room');
      }

      return createdHotelRooms;
    } catch (error) {
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'createHotelRoom',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findAllHotelRooms(
    param: HotelRoomBodyParamsDto,
    query: HotelRoomQueryParamsDto,
  ): Promise<HotelRoomDataInterface[]> {
    try {
      if (query.hotel_id?.length) {
        const hotel = await this.hotelRepository
          .createQueryBuilder('h')
          .where('h.id IN (:...id)', { id: query.hotel_id })
          .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
          .getMany();

        if (!hotel.length) {
          throw new NotFoundException('Hotel not found');
        }
      }

      if (query.checkInDate && query.checkOutDate) {
        const hotelRooms = await this.hotelRoomRepository
          .createQueryBuilder('hr')
          .leftJoinAndSelect('hr.hotel', 'h')
          .where('hr.deletedAt IS NULL')
          .andWhere('hr.status = :status', {
            status: HotelRoomStatus.AVAILABLE,
          })
          .getMany();

        if (!hotelRooms.length) return [];
      }

      if (query.guestNumber) {
        const hotelRoom = await this.hotelRoomRepository
          .createQueryBuilder('hr')
          .where('hr.capacity >= :capacity', { capacity: query.guestNumber })
          .andWhere('hr.deletedAt IS NULL')
          .andWhere('hr.status = :status', {
            status: HotelRoomStatus.AVAILABLE,
          })
          .getMany();

        if (!hotelRoom.length) return [];

        param.ids = hotelRoom.map((item) => item.id);
      }

      if (query.roomCount) {
        const hotelRoom = await this.hotelRoomRepository
          .createQueryBuilder('hr')
          .where('hr.rooms >= :rooms', { rooms: query.roomCount })
          .andWhere('hr.deletedAt IS NULL')
          .andWhere('hr.status = :status', {
            status: HotelRoomStatus.AVAILABLE,
          })
          .getMany();

        if (!hotelRoom.length) return [];

        param.ids = hotelRoom.map((item) => item.id);
      }

      const hotelRooms = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .leftJoinAndSelect('hr.hotel', 'h')
        .whereInIds(param.ids)
        .andWhere('hr.status = :status', {
          status: HotelRoomStatus.AVAILABLE,
        })
        .andWhere('hr.deletedAt IS NULL')
        .getMany();

      if (!hotelRooms.length) {
        return [];
      }

      const activeBookings = await this.bookingRepository
        .createQueryBuilder('hb')
        .select('hb.hotel_room_id', 'hotelRoomId')
        .where('hb.hotel_room_id IN (:...ids)', {
          ids: hotelRooms.map((item) => item.id),
        })
        .andWhere('hb.status IN (:...status)', {
          status: [
            HotelBookingStatus.BOOKED,
            HotelBookingStatus.AWAITING_PAYMENT,
            HotelBookingStatus.AWAITING_CONFIRMATION,
            HotelBookingStatus.CONFIRMED,
          ],
        })
        .getRawMany();

      const bookedRoomIds = new Set(activeBookings.map((b) => b.hotelRoomId));

      return hotelRooms
        .filter((room) => !bookedRoomIds.has(room.id))
        .map((room) => ({
          id: room.id,
          hotel_id: room.hotel?.id || '',
          name: room.name,
          description: room.description,
          image: room.image,
          price: room.price,
          capacity: room.capacity,
          status: room.status,
          policies: room.policies,
          amenities: room.amenities,
          type: room.type,
        }));
    } catch (error) {
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'findAllHotelRooms',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'findOneHotelRoom',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async updateHotelRoom(
    param: HotelRoomParamDto,
    body: UpdateHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      await queryRunner.startTransaction();
      const updatedHotelRoom = await this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({
          ...body,
        })
        .where('id = :id', { id: hotelRoom.id })
        .returning([
          'id',
          'name',
          'description',
          'image',
          'price',
          'capacity',
          'policies',
          'amenities',
          'type',
          'status',
          'hotel_id',
        ])
        .execute();

      if (!updatedHotelRoom) {
        throw new BadRequestException('Failed to update hotel room');
      }

      await queryRunner.commitTransaction();

      return updatedHotelRoom.raw;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'updateHotelRoom',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteHotelRoom(param: HotelRoomParamDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
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
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'deleteHotelRoom',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
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
      this.loggerService.error({
        service: HotelRoomService.name,
        event: 'hotelRoomAvailability',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }
}
