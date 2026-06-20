import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHotelBookingBodyDto } from './dto/create-hotel-booking.dto';
import { DataSource, Repository } from 'typeorm';
import { BookingEntity } from '../database/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelEntity } from '../database/hotel.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { CommonStatus, PaymentStatus } from '../enum/common.status';
import { HotelRoomStatus } from '../enum/hotel-room.status';
import {
  AvailableHotelBookingParamsDto,
  HotelBookingParamsDto,
} from './dto/hotel-booking-params.dto';
import { UpdateHotelBookingBodyDto } from './dto/update-hotel-booking.dto';
import { HotelBookingStatus } from '../enum/hotel.booking.status';

@Injectable()
export class HotelBookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly hotelBookingRepository: Repository<BookingEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createHotelBooking(body: CreateHotelBookingBodyDto, user_id: string) {
    try {
      const hotel = await this.hotelRepository
        .createQueryBuilder('h')
        .where('h.id = :id', { id: body.hotel_id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .innerJoinAndSelect('h.rooms', 'r')
        .andWhere('r.id = :room_id', { room_id: body.room_id })
        .andWhere('r.status = :status', { status: HotelRoomStatus.AVAILABLE })
        .andWhere('r.deletedAt IS NULL')
        .andWhere('r.capacity >= :guest_count', {
          guest_count: body.guestCount,
        })
        .getOne();

      if (!hotel) {
        throw new NotFoundException('Hotel or room not available');
      }

      const generatedBookingCode = await this.generateBookingCode();
      const totalPrice = await this.calculateTotalPrice(
        body.room_id,
        body.guestCount,
        body.stayPeriod,
      );

      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .insert()
        .values({
          hotel: { id: hotel.id },
          hotelRoom: { id: body.room_id },
          bookingCode: generatedBookingCode,
          totalPrice: totalPrice,
          checkInDate: body.checkInDate,
          checkOutDate: body.checkOutDate,
          guestCount: body.guestCount,
          stayPeriod: body.stayPeriod,
          paymentMethod: body.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          user: { id: user_id },
        })
        .execute();

      if (!hotelBooking) {
        throw new BadRequestException('Failed to create hotel booking');
      }

      return hotelBooking.raw;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllHotelBooking(params: HotelBookingParamsDto, user_id: string) {
    try {
      const hotelBookings = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: params.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .getMany();

      if (!hotelBookings) {
        throw new NotFoundException('Hotel bookings not found');
      }

      return hotelBookings;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneHotelBooking(param: HotelBookingParamsDto, user_id: string) {
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .getOne();

      if (!hotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      return hotelBooking;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateHotelBooking(
    param: HotelBookingParamsDto,
    body: UpdateHotelBookingBodyDto,
    user_id: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .getOne();

      if (!currentHotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      const updatedHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ ...body })
        .where('id = :id', { id: currentHotelBooking.id })
        .returning('*')
        .execute();

      if (!updatedHotelBooking) {
        throw new BadRequestException('Failed to update hotel booking');
      }

      await queryRunner.commitTransaction();

      return updatedHotelBooking.raw;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async cancelHotelBooking(param: HotelBookingParamsDto, user_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .getOne();

      if (!hotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      const cancelledHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.CANCELLED })
        .where('id = :id', { id: hotelBooking.id })
        .returning([
          'id',
          'status',
          'bookingCode',
          'bookingDate',
          'guestCount',
          'stayPeriod',
          'totalPrice',
          'checkInDate',
          'checkOutDate',
          'paymentMethod',
          'paymentStatus',
          'paymentDate',
          'paymentTransactionId',
          'paymentAmount',
          'expiredDate',
        ])
        .execute();

      if (!cancelledHotelBooking) {
        throw new BadRequestException('Failed to cancel hotel booking');
      }

      await queryRunner.commitTransaction();

      return cancelledHotelBooking.raw;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async completeHotelBooking(param: HotelBookingParamsDto, user_id: string) {
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .getOne();

      if (!hotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      const completedHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.COMPLETED })
        .where('id = :id', { id: hotelBooking.id })
        .returning('*')
        .execute();

      if (!completedHotelBooking) {
        throw new BadRequestException('Failed to complete hotel booking');
      }

      return completedHotelBooking.raw;
    } catch (error) {
      throw new Error(error);
    }
  }

  async availableHotelBooking(param: AvailableHotelBookingParamsDto) {
    try {
      const hotelRoomAvailability = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .innerJoinAndSelect('hr.hotel', 'h')
        .innerJoinAndSelect('h.rooms', 'r')
        .where('hr.id = :id', { id: param.room_id })
        .andWhere('hr.deletedAt IS NULL')
        .andWhere('hr.status = :status', { status: HotelRoomStatus.AVAILABLE })
        .andWhere('h.id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('h.status = :status', { status: CommonStatus.ACTIVE })
        .getRawOne();

      if (!hotelRoomAvailability) {
        throw new NotFoundException('Hotel room not found');
      }

      return hotelRoomAvailability;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async generateBookingCode() {
    try {
      const bookingCode = await this.hotelBookingRepository
        .createQueryBuilder()
        .select('bookingCode')
        .orderBy('bookingCode', 'DESC')
        .getOne();

      if (!bookingCode) {
        return 'HB00001';
      }

      const lastBookingCode = bookingCode.bookingCode;

      const lastBookingCodeNumber = lastBookingCode.replace('HB', '');

      const nextBookingCodeNumber = parseInt(lastBookingCodeNumber) + 1;

      return `HB${nextBookingCodeNumber.toString().padStart(5, '0')}`;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async calculateTotalPrice(
    hotelRoomId: string,
    guestCount: number,
    stayPeriod: number,
  ) {
    try {
      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: hotelRoomId })
        .andWhere('hr.deletedAt IS NULL')
        .andWhere('hr.status = :status', { status: HotelRoomStatus.AVAILABLE })
        .getOne();

      if (!hotelRoom) {
        throw new NotFoundException('Hotel room not found');
      }

      let totalPrice = hotelRoom.price * stayPeriod;

      if (guestCount > hotelRoom.capacity) {
        const additionalGuests = guestCount - hotelRoom.capacity;
        const additionalPrice = totalPrice * additionalGuests * 0.5;
        totalPrice += additionalPrice;
      }

      return totalPrice;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async generateTransactionId() {
    try {
      const transactionId = await this.hotelBookingRepository
        .createQueryBuilder()
        .select('transactionId')
        .orderBy('transactionId', 'DESC')
        .getOne();

      if (!transactionId) {
        return 'TXN00001';
      }

      const lastTransactionId = transactionId.paymentTransactionId;

      const lastTransactionIdNumber = lastTransactionId.replace('TXN', '');

      const nextTransactionIdNumber = parseInt(lastTransactionIdNumber) + 1;

      return `TXN${nextTransactionIdNumber.toString().padStart(5, '0')}`;
    } catch (error) {
      throw new Error(error);
    }
  }
}
