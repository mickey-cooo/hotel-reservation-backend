import { Test, TestingModule } from '@nestjs/testing';
import { HotelBookingService } from './hotel-booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';
import { HotelEntity } from '../database/hotel.entity';
import { DataSource } from 'typeorm';

describe('HotelBookingService', () => {
  let service: HotelBookingService;
  const hotelBookingQueryBuilder = {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
  };

  const hotelQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
  };

  const hotelRoomQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
  };

  const hotelRepository = {
    createQueryBuilder: jest.fn(() => hotelQueryBuilder),
  };

  const hotelRoomRepository = {
    createQueryBuilder: jest.fn(() => hotelRoomQueryBuilder),
  };

  const hotelBookingRepository = {
    createQueryBuilder: jest.fn(() => hotelBookingQueryBuilder),
  };

  const dataSource = {
    createQueryRunner: jest.fn(() => hotelBookingQueryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelBookingService,
        {
          provide: getRepositoryToken(BookingEntity),
          useValue: hotelBookingRepository,
        },
        {
          provide: getRepositoryToken(HotelRoomEntity),
          useValue: hotelRoomRepository,
        },
        {
          provide: getRepositoryToken(HotelEntity),
          useValue: hotelRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get<HotelBookingService>(HotelBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // create hotel booking test cases
});
