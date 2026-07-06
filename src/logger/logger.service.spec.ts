import { Test, TestingModule } from '@nestjs/testing';
import { LoggerListener } from './logger.listener';

describe('LoggerService', () => {
  let service: LoggerListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerListener],
    }).compile();

    service = module.get<LoggerListener>(LoggerListener);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
