import { Test, TestingModule } from '@nestjs/testing';
import { HotelRoomController } from './hotel-room.controller';
import { HotelRoomService } from './hotel-room.service';

describe('HotelRoomController', () => {
  let controller: HotelRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelRoomController],
      providers: [HotelRoomService],
    }).compile();

    controller = module.get<HotelRoomController>(HotelRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
