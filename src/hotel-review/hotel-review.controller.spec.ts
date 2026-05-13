import { Test, TestingModule } from '@nestjs/testing';
import { HotelReviewController } from './hotel-review.controller';
import { HotelReviewService } from './hotel-review.service';

describe('HotelReviewController', () => {
  let controller: HotelReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelReviewController],
      providers: [HotelReviewService],
    }).compile();

    controller = module.get<HotelReviewController>(HotelReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
