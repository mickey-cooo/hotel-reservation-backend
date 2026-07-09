import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingEntity } from '../database/booking.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelRoomStatus } from '../enum/hotel-room.status';
import { PaymentStatus } from '../enum/common.status';
import { CardEntity } from '../database/card.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { LoggerEntity } from '../database/logger.entity';

@Injectable()
export class CronJobService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(PaymentTransactionEntity)
    private readonly paymentTransactionRepository: Repository<PaymentTransactionEntity>,
    @InjectRepository(LoggerEntity)
    private readonly logRepository: Repository<LoggerEntity>,
  ) {}

  async checkExpirePayment() {
    try {
      const expiredBooking = await this.bookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.EXPIRED })
        .where('status = :status', {
          status: HotelBookingStatus.AWAITING_PAYMENT,
        })
        .andWhere('expired_date < :now', { now: new Date() })
        .execute();

      if (expiredBooking.affected) {
        await this.hotelRoomRepository
          .createQueryBuilder()
          .update(HotelRoomEntity)
          .set({ status: HotelRoomStatus.AVAILABLE })
          .where('id = :id', { id: expiredBooking.raw.room_id })
          .execute();
      }
    } catch (error) {
      throw error;
    }
  }

  async refundPayment(transactionId: string) {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { paymentTransactionId: transactionId },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const updateBookingStatus = await this.bookingRepository
        .createQueryBuilder('b')
        .where('paymentTransactionId = :transactionId', {
          transactionId: transactionId,
        })
        .andWhere('b.paymentStatus = :paymentStatus', {
          paymentStatus: PaymentStatus.PENDING,
        })
        .andWhere('b.createdAt < :createdAt', {
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        })
        .update({
          paymentStatus: PaymentStatus.REFUNDED,
          status: HotelBookingStatus.CANCELLED,
        })
        .execute();

      if (updateBookingStatus) {
        await this.hotelRoomRepository
          .createQueryBuilder()
          .update(HotelRoomEntity)
          .set({ status: HotelRoomStatus.AVAILABLE })
          .where('id = :id', { id: booking.hotelRoom?.id })
          .execute();
      }

      const payment = await this.paymentTransactionRepository.findOne({
        where: { transactionId: booking.paymentTransactionId },
      });

      if (payment) {
        await this.paymentTransactionRepository.update(payment.transactionId, {
          status: PaymentTransactionStatus.REFUNDED,
        });
      }
      return updateBookingStatus;
    } catch (error) {
      throw error;
    }
  }

  async deleteLog() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const batchSize = 1000;
    let totalDeleted = 0;

    while (true) {
      const ids = await this.logRepository
        .createQueryBuilder('log')
        .select('log.id')
        .where('log.createdAt < :date', { date: oneWeekAgo })
        .limit(batchSize)
        .getMany();

      if (ids.length === 0) break;

      await this.logRepository
        .createQueryBuilder()
        .delete()
        .from(LoggerEntity)
        .whereInIds(ids.map((row) => row.id))
        .execute();

      totalDeleted += ids.length;
    }

    return totalDeleted;
  }
}
