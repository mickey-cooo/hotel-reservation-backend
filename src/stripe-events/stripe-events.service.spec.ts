import { Test, TestingModule } from '@nestjs/testing';
import { StripeEventsService } from './stripe-events.service';

describe('StripeEventsService', () => {
  let service: StripeEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeEventsService],
    }).compile();

    service = module.get<StripeEventsService>(StripeEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
