import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelReviewEntity } from 'src/database/hotel-review.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateHotelReviewBodyDto } from './dto/create-hotel-review.dto';
import { HotelService } from '../hotel/hotel.service';
import {
  HotelReviewParamDto,
  HotelReviewParamsDto,
} from './dto/hotel-review-params.dto';
import { HotelReviewInterface } from './interface/hotel-review-interface';
import { UpdateHotelReviewBodyDto } from './dto/update-hotel-review.dto';

@Injectable()
export class HotelReviewService {
  constructor(
    @InjectRepository(HotelReviewEntity)
    private readonly hotelReviewRepository: Repository<HotelReviewEntity>,
    private readonly hotelService: HotelService,
    private readonly dataSource: DataSource,
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

      const newHotelReview = await this.hotelReviewRepository
        .createQueryBuilder()
        .insert()
        .values({
          hotel: { id: currentHotel.data.id },
          user: { id: userId },
          title: body.title,
          description: body.description,
          rating: body.rating,
          isAnonymous: body.isAnonymous,
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
      throw new Error(error);
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

      if (!hotelReviews) {
        throw new NotFoundException('Hotel reviews not found');
      }

      return hotelReviews;
    } catch (error) {
      throw new Error(error);
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
      throw new Error(error);
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

      return updatedHotelReview.raw ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteHotelReview(
    param: HotelReviewParamDto,
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

      return deletedHotelReview.raw ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
