import { Test, TestingModule } from '@nestjs/testing';
import { HotelReviewService } from './hotel-review.service';

describe('HotelReviewService', () => {
  let service: HotelReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HotelReviewService],
    }).compile();

    service = module.get<HotelReviewService>(HotelReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
