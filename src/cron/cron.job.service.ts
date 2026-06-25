import { Injectable } from '@nestjs/common';
import { BookingEntity } from '../database/booking.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelRoomStatus } from '../enum/hotel-room.status';

@Injectable()
export class CronJobService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
  ) {}

  async checkExpirePayment() {
    const expiredBooking = await this.bookingRepository
      .createQueryBuilder()
      .update(BookingEntity)
      .set({ status: HotelBookingStatus.EXPIRED })
      .where('status = :status', {
        status: HotelBookingStatus.AWAITING_PAYMENT,
      })
      .andWhere('expired_date < :now', { now: new Date() })
      .returning('*')
      .execute();

    if (expiredBooking) {
      await this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({ status: HotelRoomStatus.AVAILABLE })
        .where('id = :id', { id: expiredBooking.raw.room_id })
        .execute();
    }
  }
}
