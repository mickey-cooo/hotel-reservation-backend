import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelReviewEntity } from '../database/hotel-review.entity';
import { BookingEntity } from '../database/booking.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateHotelReviewBodyDto } from './dto/create-hotel-review.dto';
import { HotelService } from '../hotel/hotel.service';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import {
  HotelReviewParamDto,
  HotelReviewParamsDto,
} from './dto/hotel-review-params.dto';
import {
  HotelReviewInterface,
  ReplyHotelReviewInterface,
} from './interface/hotel-review-interface';
import { UpdateHotelReviewBodyDto } from './dto/update-hotel-review.dto';
import { ReplyHotelReviewBodyDto } from './dto/reply-hotel-review.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HotelReviewService {
  constructor(
    @InjectRepository(HotelReviewEntity)
    private readonly hotelReviewRepository: Repository<HotelReviewEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    private readonly hotelService: HotelService,
    private readonly dataSource: DataSource,
    private readonly loggerService: LoggerService,
  ) {}

  async createHotelReview(
    body: CreateHotelReviewBodyDto,
    userId: string,
  ): Promise<HotelReviewInterface> {
    try {
      const currentHotel = await this.hotelService.findOneHotel({
        id: body.hotel_id,
      });

      if (!currentHotel) {
        throw new NotFoundException('Hotel not found');
      }

      const completedBooking = await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.hotel_id = :hotel_id', { hotel_id: body.hotel_id })
        .andWhere('b.user_id = :user_id', { user_id: userId })
        .andWhere('b.status = :status', {
          status: HotelBookingStatus.COMPLETED,
        })
        .getOne();

      if (!completedBooking) {
        throw new BadRequestException(
          'You must have a completed booking to review this hotel',
        );
      }

      const newHotelReview = await this.hotelReviewRepository
        .createQueryBuilder()
        .insert()
        .values({
          hotel: { id: currentHotel.data.id },
          user: body.isAnonymous === true ? null : { id: userId },
          title: body.title,
          description: body.description,
          rating: body.rating,
          isAnonymous: body.isAnonymous,
          isReply: body.isReply,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning([
          'id',
          'title',
          'description',
          'rating',
          'isAnonymous',
          'reviewDate',
          'isReply',
          'reply',
        ])
        .execute();

      if (!newHotelReview) {
        throw new BadRequestException('Failed to create hotel review');
      }

      return newHotelReview.raw;
    } catch (error) {
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'createHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findAllHotelReview(
    body: HotelReviewParamsDto,
  ): Promise<HotelReviewInterface[]> {
    try {
      const hotelReviews = await this.hotelReviewRepository
        .createQueryBuilder('hr')
        .where('hr.hotel_id = :hotel_id', { hotel_id: body.hotel_id })
        .andWhere('hr.deletedAt IS NULL')
        .orderBy('hr.reviewDate', 'DESC')
        .select([
          'hr.id',
          'hr.title',
          'hr.description',
          'hr.rating',
          'hr.isAnonymous',
          'hr.reviewDate',
          'hr.isReply',
          'hr.reply',
          'hr.replyBy',
          'hr.replyDate',
        ])
        .getMany();

      if (!hotelReviews) return [];

      return hotelReviews;
    } catch (error) {
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'findAllHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findOneHotelReview(
    param: HotelReviewParamDto,
  ): Promise<HotelReviewInterface> {
    try {
      const hotelReview = await this.hotelReviewRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hr.deletedAt IS NULL')
        .select([
          'hr.id',
          'hr.title',
          'hr.description',
          'hr.rating',
          'hr.isAnonymous',
          'hr.reviewDate',
          'hr.isReply',
          'hr.reply',
          'hr.replyBy',
          'hr.replyDate',
        ])
        .getOne();

      if (!hotelReview) {
        throw new NotFoundException('Hotel review not found');
      }

      return hotelReview;
    } catch (error) {
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'findOneHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async updateHotelReview(
    param: HotelReviewParamDto,
    body: UpdateHotelReviewBodyDto,
    userId: string,
  ): Promise<HotelReviewInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hotelReview = await this.hotelReviewRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelReview) {
        throw new NotFoundException('Hotel review not found');
      }

      if (hotelReview.createdBy !== userId) {
        throw new BadRequestException(
          'You are not authorized to update this hotel review',
        );
      }

      const updatedHotelReview = await this.hotelReviewRepository
        .createQueryBuilder()
        .update(HotelReviewEntity)
        .set({ ...body, updatedBy: userId, updatedAt: new Date() })
        .where('id = :id', { id: hotelReview.id })
        .returning('*')
        .execute();

      if (!updatedHotelReview) {
        throw new BadRequestException('Failed to update hotel review');
      }

      await queryRunner.commitTransaction();

      return updatedHotelReview.raw ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'updateHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteHotelReview(
    param: HotelReviewParamDto,
    userId: string,
  ): Promise<HotelReviewInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const hotelReview = await this.hotelReviewRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: param.id })
        .andWhere('hr.hotel_id = :hotel_id', { hotel_id: param.hotel_id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelReview) {
        throw new NotFoundException('Hotel review not found');
      }

      if (hotelReview.createdBy !== userId) {
        throw new BadRequestException(
          'You are not authorized to delete this hotel review',
        );
      }

      const deletedHotelReview = await this.hotelReviewRepository
        .createQueryBuilder()
        .update(HotelReviewEntity)
        .set({
          deletedAt: new Date(),
        })
        .where('id = :id', { id: hotelReview.id })
        .returning('*')
        .execute();

      if (!deletedHotelReview) {
        throw new BadRequestException('Failed to delete hotel review');
      }
      await queryRunner.commitTransaction();

      return deletedHotelReview.raw ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'deleteHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async replyHotelReview(
    body: ReplyHotelReviewBodyDto,
    userId: string,
  ): Promise<ReplyHotelReviewInterface> {
    try {
      const hotelReview = await this.hotelReviewRepository
        .createQueryBuilder('hr')
        .where('hr.id = :id', { id: body.review_id })
        .andWhere('hr.hotel_id = :hotel_id', { hotel_id: body.hotel_id })
        .andWhere('hr.deletedAt IS NULL')
        .getOne();

      if (!hotelReview) {
        throw new NotFoundException('Hotel review not found');
      }

      const updatedHotelReview = await this.hotelReviewRepository
        .createQueryBuilder()
        .update(HotelReviewEntity)
        .set({ ...body, createdBy: userId, createdAt: new Date() })
        .where('id = :id', { id: hotelReview.id })
        .returning(['reviewDate', 'isReply', 'reply', 'replyBy', 'replyDate'])
        .execute();

      if (!updatedHotelReview) {
        throw new BadRequestException('Failed to reply hotel review');
      }

      return updatedHotelReview.raw;
    } catch (error) {
      this.loggerService.error({
        service: HotelReviewService.name,
        event: 'replyHotelReview',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }
}
