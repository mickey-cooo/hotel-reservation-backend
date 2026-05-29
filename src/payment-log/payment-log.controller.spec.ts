import { Test, TestingModule } from '@nestjs/testing';
import { PaymentLogController } from './payment-log.controller';
import { PaymentLogService } from './payment-log.service';

describe('PaymentLogController', () => {
  let controller: PaymentLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentLogController],
      providers: [PaymentLogService],
    }).compile();

    controller = module.get<PaymentLogController>(PaymentLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
