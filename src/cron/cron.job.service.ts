import { Injectable } from '@nestjs/common';
import { BookingEntity } from '../database/booking.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CronJobService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  async checkExpirePayment() {
    await this.bookingRepository
      .createQueryBuilder()
      .update(BookingEntity)
      .set({ status: HotelBookingStatus.EXPIRED })
      .where('status = :status', {
        status: HotelBookingStatus.AWAITING_PAYMENT,
      })
      .andWhere('expired_date < :now', { now: new Date() })
      .execute();
  }
}
