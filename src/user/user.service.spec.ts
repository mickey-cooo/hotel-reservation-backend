import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../database/user.entity';
import { AddressEntity } from '../database/address.entity';
import { JwtService } from '@nestjs/jwt';
import { CommonStatus } from '../enum/common.status';
import { NotFoundException } from '@nestjs/common';
import { CreateBodyUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;

  const userRepository = {
    createQueryBuilder: jest.fn(),
  };

  const addressRepository = {
    createQueryBuilder: jest.fn(),
  };

  const jwtService = {
    sign: jest.fn(),
  };

  const createUserBody: CreateBodyUserDto = {
    firstName: { th: 'จอห์น', en: 'John' },
    lastName: { th: 'โด', en: 'Doe' },
    phoneNumber: '1234567890',
    addressDetail: {
      country: 'United States',
      province: 'California',
      district: 'Los Angeles',
      subDistrict: 'West Los Angeles',
      postalCode: '90001',
      detail: '123 Main St',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        {
          provide: getRepositoryToken(AddressEntity),
          useValue: addressRepository,
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createUser: returns success message and data', async () => {
    const mockExecute = jest
      .fn()
      .mockResolvedValueOnce({ raw: { affected: 1 } });

    const queryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: mockExecute,
    };

    userRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

    const result = await service.createUser(createUserBody);

    expect(result.message).toBe('User created successfully');
    expect(result.data).toEqual({ raw: { affected: 1 } });
    expect(userRepository.createQueryBuilder).toHaveBeenCalledWith();
    expect(queryBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: createUserBody.firstName,
        lastName: createUserBody.lastName,
        phoneNumber: createUserBody.phoneNumber,
        address: createUserBody.addressDetail,
        status: CommonStatus.ACTIVE,
      }),
    );

    it('createUser: throws when insert did not affect rows', async () => {
      const queryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValueOnce({ raw: { affected: 0 } }),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.createUser(createUserBody)).rejects.toThrow(Error);
    });

    it('findOneUser: returns success message and data', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce({ id: 1, name: 'John Doe' }),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findOneUser({ id: '1' });

      expect(result.message).toBe('User found successfully');
      expect(result.data).toEqual({ id: 1, name: 'John Doe' });
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith();
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'u.address',
        'a',
      );
      expect(queryBuilder.select).toHaveBeenCalledWith([
        'u.id as "id"',
        'u.firstName as "firstName"',
        'u.lastName as "lastName"',
        'u.phoneNumber as "phoneNumber"',
        'u.email as "email"',
        'u.status as "status"',
        'a.country as "country"',
        'a.province as "province"',
        'a.district as "district"',
        'a.subDistrict as "subDistrict"',
        'a.postalCode as "postalCode"',
        'a.detail as "detail"',
      ]);
      expect(queryBuilder.where).toHaveBeenCalledWith('u.id = :id', {
        id: '1',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('u.status = :status', {
        status: CommonStatus.ACTIVE,
      });
      expect(queryBuilder.getOne).toHaveBeenCalled();
    });

    it('findOneUser: throws when user not found', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findOneUser({ id: '1' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('findOneUser: throws when user status is not active', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce({
          id: 1,
          name: 'John Doe',
          status: CommonStatus.INACTIVE,
        }),
      };

      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(service.findOneUser({ id: '1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
