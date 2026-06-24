import { Test, TestingModule } from '@nestjs/testing';
import { StripeEventsController } from './stripe-events.controller';
import { StripeEventsService } from './stripe-events.service';

describe('StripeEventsController', () => {
  let controller: StripeEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeEventsController],
      providers: [StripeEventsService],
    }).compile();

    controller = module.get<StripeEventsController>(StripeEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
