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
import { MailService } from '../mail/mail.service';
import { RefundBookingBodyDto } from './dto/refund-booking.dto';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { OrderEntity } from '../database/order.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { LoggerService } from '../logger/logger.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class HotelBookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly hotelBookingRepository: Repository<BookingEntity>,
    @InjectRepository(HotelRoomEntity)
    private readonly hotelRoomRepository: Repository<HotelRoomEntity>,
    @InjectRepository(HotelEntity)
    private readonly hotelRepository: Repository<HotelEntity>,
    @InjectRepository(PaymentLogEntity)
    private readonly paymentLogRepository: Repository<PaymentLogEntity>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
    private readonly stripeService: StripeService,
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
        .andWhere(
          `NOT EXISTS (
            SELECT 1 FROM booking b
            WHERE b.hotel_room_id = r.id
              AND b.status NOT IN (:...cancelledStatuses)
              AND b.check_in_date < :check_out_date
              AND b.check_out_date > :check_in_date
          )`,
          {
            cancelledStatuses: [HotelBookingStatus.CANCELLED],
            check_in_date: body.checkInDate,
            check_out_date: body.checkOutDate,
          },
        )
        .getOne();

      if (!hotel) {
        throw new NotFoundException('Hotel or room not available');
      }

      const generatedBookingCode = await this.generateBookingCode();
      const generatedTransactionId = await this.generateTransactionId();
      const totalPrice = await this.calculateTotalPrice(
        body.room_id,
        body.guestCount,
        body.stayPeriod,
      );

      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .insert()
        .values({
          hotelRoom: { id: body.room_id },
          bookingCode: generatedBookingCode,
          paymentTransactionId: generatedTransactionId,
          totalPrice: totalPrice,
          checkInDate: body.checkInDate,
          checkOutDate: body.checkOutDate,
          guestCount: body.guestCount,
          stayPeriod: body.stayPeriod,
          status: HotelBookingStatus.AWAITING_PAYMENT,
          paymentMethod: body.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          user: { id: user_id },
          expiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        .execute();

      if (!hotelBooking) {
        throw new BadRequestException('Failed to create hotel booking');
      }

      const hotelRoomStatus = await this.hotelRoomRepository
        .createQueryBuilder('hb')
        .update(HotelRoomEntity)
        .set({ status: HotelRoomStatus.UNAVAILABLE })
        .where('id = :id', { id: body.room_id })
        .returning('*')
        .execute();

      if (!hotelRoomStatus) {
        throw new BadRequestException('Failed to update hotel room status');
      }

      const link = `${process.env.FRONTEND_BASE_URL}/hotel-booking/detail/${hotelBooking.raw.bookingCode}`;

      await this.mailService.sendHotelBookingMail(
        hotelBooking.raw.email,
        link,
        hotelBooking.raw,
      );
      return hotelBooking.raw;
    } catch (error) {
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'createHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findAllHotelBooking(params: HotelBookingParamsDto, user_id: string) {
    try {
      const hotelBookings = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .innerJoinAndSelect('hb.hotelRoom', 'hr')
        .where('hr.hotel_id = :hotel_id', { hotel_id: params.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .getMany();

      if (!hotelBookings) {
        return [];
      }

      return hotelBookings;
    } catch (error) {
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'findAllHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findOneHotelBooking(param: HotelBookingParamsDto, user_id: string) {
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .innerJoin('hb.hotelRoom', 'hr')
        .where('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
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
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'findOneHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async updateHotelBooking(
    param: HotelBookingParamsDto,
    body: UpdateHotelBookingBodyDto,
    user_id: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const currentHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .innerJoin('hb.hotelRoom', 'hr')
        .where('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.user_id = :user_id', { user_id: user_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .getOne();

      if (!currentHotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      await queryRunner.startTransaction();
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
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'updateHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bookingConfirm(paymentTransactionId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.paymentTransactionId = :paymentTransactionId', {
          paymentTransactionId: paymentTransactionId,
        })
        .getOne();

      if (!hotelBooking) {
        throw new NotFoundException('Hotel booking not found');
      }

      await queryRunner.startTransaction();
      const updatedHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.CONFIRMED })
        .where('id = :id', { id: hotelBooking.id })
        .returning('*')
        .execute();

      if (!updatedHotelBooking) {
        throw new BadRequestException('Failed to update hotel booking');
      }

      await queryRunner.commitTransaction();

      return updatedHotelBooking.raw;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'bookingConfirm',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelHotelBooking(param: HotelBookingParamsDto, user_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
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

      await queryRunner.startTransaction();
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

      const hotelRoom = await this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({ status: HotelRoomStatus.AVAILABLE })
        .where('id = :id', { id: hotelBooking.hotelRoom?.id })
        .execute();

      if (!hotelRoom) {
        throw new BadRequestException('Failed to update hotel room status');
      }

      const link = `${process.env.FRONTEND_BASE_URL}/hotel-booking/detail/${cancelledHotelBooking.raw.bookingCode}`;
      await this.mailService.sendHotelBookingMail(
        cancelledHotelBooking.raw.user.email,
        link,
        cancelledHotelBooking.raw.bookingCode,
      );

      await queryRunner.commitTransaction();

      return cancelledHotelBooking.raw;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'cancelHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmHotelBooking(param: HotelBookingParamsDto) {
    try {
      const hotelBooking = await this.hotelBookingRepository
        .createQueryBuilder('hb')
        .where('hb.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hb.bookingCode = :bookingCode', {
          bookingCode: param.bookingCode,
        })
        .andWhere('hb.status = :status', {
          status: HotelBookingStatus.AWAITING_CONFIRMATION,
        })
        .getOne();

      if (!hotelBooking) {
        throw new NotFoundException('Hotel booking not found ');
      }

      const confirmedHotelBooking = await this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.CONFIRMED })
        .where('id = :id', { id: hotelBooking.id })
        .returning('*')
        .execute();

      if (!confirmedHotelBooking) {
        throw new BadRequestException('Failed to confirm hotel booking');
      }

      return confirmedHotelBooking.raw;
    } catch (error) {
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'confirmHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
        .andWhere('hb.paymentStatus = :paymentStatus', {
          paymentStatus: PaymentStatus.PAID,
        })
        .andWhere('hb.status = :status', {
          status: HotelBookingStatus.CONFIRMED,
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

      const link = `${process.env.FRONTEND_BASE_URL}/hotel-booking/detail/${completedHotelBooking.raw.bookingCode}`;
      await this.mailService.sendHotelBookingMail(
        completedHotelBooking.raw.user.email,
        link,
        completedHotelBooking.raw.bookingCode,
      );

      return completedHotelBooking.raw;
    } catch (error) {
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'completeHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async checkInBooking(param: HotelBookingParamsDto) {
    const booking = await this.hotelBookingRepository
      .createQueryBuilder('hb')
      .innerJoinAndSelect('hb.hotelRoom', 'hr')
      .where('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
      .andWhere('hb.bookingCode = :bookingCode', {
        bookingCode: param.bookingCode,
      })
      .andWhere('hb.status = :status', {
        status: HotelBookingStatus.CONFIRMED,
      })
      .getOne();

    if (!booking) {
      throw new NotFoundException(
        'Booking not found or not in CONFIRMED status',
      );
    }

    await Promise.all([
      this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.CHECKED_IN })
        .where('id = :id', { id: booking.id })
        .execute(),
      this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({ status: HotelRoomStatus.UNAVAILABLE })
        .where('id = :id', { id: booking.hotelRoom!.id })
        .execute(),
    ]);

    return {
      bookingCode: booking.bookingCode,
      status: HotelBookingStatus.CHECKED_IN,
    };
  }

  async checkOutBooking(param: HotelBookingParamsDto) {
    const booking = await this.hotelBookingRepository
      .createQueryBuilder('hb')
      .innerJoinAndSelect('hb.hotelRoom', 'hr')
      .where('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
      .andWhere('hb.bookingCode = :bookingCode', {
        bookingCode: param.bookingCode,
      })
      .andWhere('hb.status = :status', {
        status: HotelBookingStatus.CHECKED_IN,
      })
      .getOne();

    if (!booking) {
      throw new NotFoundException(
        'Booking not found or not in CHECKED_IN status',
      );
    }

    await Promise.all([
      this.hotelBookingRepository
        .createQueryBuilder()
        .update(BookingEntity)
        .set({ status: HotelBookingStatus.CHECKED_OUT })
        .where('id = :id', { id: booking.id })
        .execute(),
      this.hotelRoomRepository
        .createQueryBuilder()
        .update(HotelRoomEntity)
        .set({ status: HotelRoomStatus.AVAILABLE })
        .where('id = :id', { id: booking.hotelRoom!.id })
        .execute(),
    ]);

    return {
      bookingCode: booking.bookingCode,
      status: HotelBookingStatus.CHECKED_OUT,
    };
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
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'availableHotelBooking',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async cancelAndRefund(body: RefundBookingBodyDto, user_id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const booking = await queryRunner.manager
        .createQueryBuilder(BookingEntity, 'b')
        .leftJoinAndSelect('b.user', 'user')
        .leftJoinAndSelect('b.hotel', 'hotel')
        .leftJoinAndSelect('b.hotelRoom', 'hotelRoom')
        .where('b.id = :id', { id: body.bookingId })
        .andWhere('b.user_id = :userId', { userId: user_id })
        .getOne();

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      const cancellableStatuses = [
        HotelBookingStatus.BOOKED,
        HotelBookingStatus.AWAITING_PAYMENT,
        HotelBookingStatus.AWAITING_CONFIRMATION,
        HotelBookingStatus.CONFIRMED,
      ];

      if (!cancellableStatuses.includes(booking.status)) {
        throw new BadRequestException(
          `Booking with status "${booking.status}" cannot be cancelled`,
        );
      }

      if (booking.expiredDate && booking.expiredDate < new Date()) {
        throw new BadRequestException(
          `Booking "${booking.bookingCode}" is expired, cannot be cancelled`,
        );
      }

      const isRefundable = booking.paymentStatus === PaymentStatus.PAID;

      let stripeRefundId: string | null = null;
      let paymentTransaction: PaymentTransactionEntity | null = null;

      if (isRefundable) {
        const order = await queryRunner.manager
          .createQueryBuilder(OrderEntity, 'o')
          .where('o.booking_id = :bookingId', { bookingId: booking.id })
          .getOne();

        if (!order) {
          throw new NotFoundException(
            `Order not found for booking "${booking.bookingCode}"`,
          );
        }

        paymentTransaction = await queryRunner.manager
          .createQueryBuilder(PaymentTransactionEntity, 'pt')
          .where('pt.orderId = :orderId', { orderId: order.id })
          .andWhere('pt.status = :status', {
            status: PaymentTransactionStatus.PAID,
          })
          .getOne();

        if (!paymentTransaction?.paymentIntentId) {
          throw new NotFoundException(
            `Paid payment transaction not found for booking "${booking.bookingCode}"`,
          );
        }

        const refund = await this.stripeService.refundPaymentIntent({
          paymentIntentId: paymentTransaction.paymentIntentId,
          idempotencyKey: `refund_${booking.id}`,
        });
        stripeRefundId = refund.id;

        await queryRunner.manager
          .createQueryBuilder()
          .update(PaymentTransactionEntity)
          .set({
            status: PaymentTransactionStatus.REFUNDED,
            stripeRefundId,
          })
          .where('id = :id', { id: paymentTransaction.id })
          .execute();
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(BookingEntity)
        .set({
          status: HotelBookingStatus.CANCELLED,
          ...(isRefundable && { paymentStatus: PaymentStatus.REFUNDED }),
        })
        .where('id = :id', { id: booking.id })
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(PaymentLogEntity)
        .values({
          action: isRefundable ? 'refund' : 'cancel',
          transactionId: booking.paymentTransactionId,
          hotelRoomId: booking.hotelRoom?.id,
          hotelBookingId: booking.id,
          userId: user_id,
          log: JSON.stringify({
            reason: body.reason,
            previousStatus: booking.status,
            previousPaymentStatus: booking.paymentStatus,
            refundAmount: isRefundable ? booking.paymentAmount : 0,
            stripeRefundId,
          }),
        })
        .execute();

      await queryRunner.commitTransaction();

      const link = `${process.env.FRONTEND_BASE_URL}/hotel-booking/detail/${booking.bookingCode}`;
      const updatedBooking = {
        ...booking,
        status: HotelBookingStatus.CANCELLED,
        paymentStatus: isRefundable
          ? PaymentStatus.REFUNDED
          : booking.paymentStatus,
      } as BookingEntity;
      await this.mailService.sendHotelBookingMail(
        booking.user!.email,
        link,
        updatedBooking,
      );

      return {
        bookingId: booking.id,
        status: HotelBookingStatus.CANCELLED,
        paymentStatus: isRefundable
          ? PaymentStatus.REFUNDED
          : booking.paymentStatus,
        refundAmount: isRefundable ? booking.paymentAmount : 0,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'cancelAndRefund',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateBookingCode(): Promise<string> {
    const result = await this.hotelBookingRepository.query(
      `SELECT nextval('booking_code_seq') AS val`,
    );
    const num = parseInt(result[0].val, 10);
    return `HB${num.toString().padStart(5, '0')}`;
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
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'calculateTotalPrice',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: HotelBookingService.name,
        event: 'generateTransactionId',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }
}
