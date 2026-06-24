import { Module } from '@nestjs/common';
import { HotelReviewService } from './hotel-review.service';
import { HotelReviewController } from './hotel-review.controller';
import { HotelReviewEntity } from '../database/hotel-review.entity';
import { BookingEntity } from '../database/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [TypeOrmModule.forFeature([HotelReviewEntity, BookingEntity]), HotelModule],
  controllers: [HotelReviewController],
  providers: [HotelReviewService],
})
export class HotelReviewModule {}
