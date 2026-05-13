import { Module } from '@nestjs/common';
import { HotelReviewService } from './hotel-review.service';
import { HotelReviewController } from './hotel-review.controller';

@Module({
  controllers: [HotelReviewController],
  providers: [HotelReviewService],
})
export class HotelReviewModule {}
