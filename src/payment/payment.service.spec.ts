import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentEntity } from '../database/payment.entity';
import { UserEntity } from '../database/user.entity';
import { CommonStatus } from '../enum/common.status';

describe('PaymentService', () => {
  let service: PaymentService;
  const paymentQueryBuilder = {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    execute: jest.fn(),
  };
  const userQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };
  const paymentRepository = {
    createQueryBuilder: jest.fn(() => paymentQueryBuilder),
  };
  const userRepository = {
    createQueryBuilder: jest.fn(() => userQueryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: paymentRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // create payment test cases
  it('should hash card number and cvv before saving', async () => {
    const user = { id: 'user-id', status: CommonStatus.ACTIVE };
    const createdPayment = {
      raw: [
        {
          id: 'payment-id',
          cardHolderName: 'Mickey Mouse',
          cardExpiryMonth: '12',
          cardExpiryYear: '2030',
          status: CommonStatus.ACTIVE,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    };

    userQueryBuilder.getRawOne.mockResolvedValue(user);
    paymentQueryBuilder.execute.mockResolvedValue(createdPayment);

    const result = await service.create({
      user_id: 'user-id',
      cardNumber: '4111111111111111',
      cardHolderName: 'Mickey Mouse',
      cardExpiryMonth: '12',
      cardExpiryYear: '2030',
      cardCvv: '123',
    });

    expect(paymentQueryBuilder.values).toHaveBeenCalledWith(
      expect.objectContaining({
        cardNumber: expect.not.stringMatching('4111111111111111'),
        cardCvv: expect.not.stringMatching('123'),
      }),
    );
    expect(result).not.toHaveProperty('cardNumber');
    expect(result).not.toHaveProperty('cardCvv');
  });

  // find all payments test cases
  it('should find all payments', async () => {
    const payments = [
      {
        id: 'payment-id',
        cardHolderName: 'Mickey Mouse',
        cardExpiryMonth: '12',
        cardExpiryYear: '2030',
        status: CommonStatus.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        user_id: 'user-id',
      },
      {
        id: 'payment-id-2',
        cardHolderName: 'Donald Duck',
        cardExpiryMonth: '01',
        cardExpiryYear: '2025',
        status: CommonStatus.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ];

    paymentQueryBuilder.getRawMany.mockResolvedValue(payments);

    const result = await service.findAll({ user_id: 'user-id' });

    expect(paymentQueryBuilder.getRawMany).toHaveBeenCalledWith();
    expect(paymentQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'p.user',
      'u',
    );
    expect(paymentQueryBuilder.select).toHaveBeenCalledWith([
      'p.id as "id"',
      'p.cardHolderName as "cardHolderName"',
      'p.cardExpiryMonth as "cardExpiryMonth"',
      'p.cardExpiryYear as "cardExpiryYear"',
      'p.status as "status"',
      'p.createdAt as "createdAt"',
      'p.updatedAt as "updatedAt"',
      'u.id as "user_id"',
    ]);
    expect(paymentQueryBuilder.where).toHaveBeenCalledWith(
      'p.status = :status',
      {
        status: CommonStatus.ACTIVE,
      },
    );
    expect(paymentQueryBuilder.andWhere).toHaveBeenCalledWith(
      'u.id = :user_id',
      {
        user_id: 'user-id',
      },
    );
    expect(paymentQueryBuilder.orderBy).toHaveBeenCalledWith(
      'p.createdAt',
      'DESC',
    );
    expect(paymentQueryBuilder.getRawMany).toHaveBeenCalled();
    expect(result).toEqual(payments);
  });

  // find one payment test cases
  it('should find one payment', async () => {
    const payment = {
      id: 'payment-id',
      cardHolderName: 'Mickey Mouse',
      cardExpiryMonth: '12',
      cardExpiryYear: '2030',
      status: CommonStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      user_id: 'user-id',
    };

    paymentQueryBuilder.getRawOne.mockResolvedValue(payment);

    const result = await service.findOne({ id: 'payment-id' });

    expect(paymentQueryBuilder.getRawOne).toHaveBeenCalledWith();
    expect(paymentQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'p.user',
      'u',
    );
    expect(paymentQueryBuilder.select).toHaveBeenCalledWith([
      'p.id as "id"',
      'p.cardHolderName as "cardHolderName"',
      'p.cardExpiryMonth as "cardExpiryMonth"',
      'p.cardExpiryYear as "cardExpiryYear"',
      'p.status as "status"',
      'p.createdAt as "createdAt"',
      'p.updatedAt as "updatedAt"',
      'u.id as "user_id"',
    ]);
    expect(paymentQueryBuilder.where).toHaveBeenCalledWith('p.id = :id', {
      id: 'payment-id',
    });
    expect(paymentQueryBuilder.andWhere).toHaveBeenCalledWith(
      'p.status = :status',
      { status: CommonStatus.ACTIVE },
    );
    expect(paymentQueryBuilder.getRawOne).toHaveBeenCalled();
    expect(result).toEqual(payment);
  });

  // update payment test cases
  it('should update payment', async () => {
    const payment = {
      id: 'payment-id',
      cardHolderName: 'Mickey Mouse',
      cardExpiryMonth: '12',
      cardExpiryYear: '2030',
      status: CommonStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      user_id: 'user-id',
    };

    const user = { id: 'user-id', status: CommonStatus.ACTIVE };
    const updatedPayment = {
      raw: [
        {
          id: 'payment-id',
          cardHolderName: 'Donald Duck',
          cardExpiryMonth: '01',
          cardExpiryYear: '2029',
          status: CommonStatus.ACTIVE,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        },
      ],
    };

    paymentQueryBuilder.getRawOne.mockResolvedValue(payment);
    userQueryBuilder.getRawOne.mockResolvedValue(user);
    paymentQueryBuilder.execute.mockResolvedValue(updatedPayment);

    const result = await service.update(
      { id: 'payment-id' },
      {
        user_id: 'user-id',
        cardHolderName: 'Donald Duck',
        cardExpiryMonth: '01',
        cardExpiryYear: '2029',
      },
    );

    expect(paymentQueryBuilder.update).toHaveBeenCalledWith(PaymentEntity);
    expect(paymentQueryBuilder.set).toHaveBeenCalledWith({
      cardNumber: undefined,
      cardHolderName: 'Donald Duck',
      cardExpiryMonth: '01',
      cardExpiryYear: '2029',
      cardCvv: undefined,
      user: { id: 'user-id' },
    });
    expect(paymentQueryBuilder.where).toHaveBeenCalledWith('id = :id', {
      id: 'payment-id',
    });
    expect(paymentQueryBuilder.returning).toHaveBeenCalledWith([
      'id',
      'cardHolderName',
      'cardExpiryMonth',
      'cardExpiryYear',
      'status',
      'createdAt',
      'updatedAt',
    ]);
    expect(paymentQueryBuilder.execute).toHaveBeenCalled();
    expect(result).toEqual(updatedPayment.raw[0]);
  });

  // delete payment test cases
  it('should delete payment', async () => {
    const payment = {
      id: 'payment-id',
      cardHolderName: 'Mickey Mouse',
      cardExpiryMonth: '12',
      cardExpiryYear: '2030',
      status: CommonStatus.ACTIVE,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      user_id: 'user-id',
    };
    const deletedPayment = {
      raw: [
        {
          id: 'payment-id',
          cardHolderName: 'Mickey Mouse',
          cardExpiryMonth: '12',
          cardExpiryYear: '2030',
          status: CommonStatus.DELETED,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
    };
    paymentQueryBuilder.getRawOne.mockResolvedValue(payment);
    paymentQueryBuilder.execute.mockResolvedValue(deletedPayment);

    const result = await service.delete({ id: 'payment-id' });

    expect(paymentQueryBuilder.update).toHaveBeenCalledWith(PaymentEntity);
    expect(paymentQueryBuilder.set).toHaveBeenCalledWith({
      status: CommonStatus.DELETED,
    });
    expect(paymentQueryBuilder.where).toHaveBeenCalledWith('id = :id', {
      id: 'payment-id',
    });
    expect(paymentQueryBuilder.returning).toHaveBeenCalledWith([
      'id',
      'cardHolderName',
      'cardExpiryMonth',
      'cardExpiryYear',
      'status',
      'createdAt',
      'updatedAt',
    ]);
    expect(paymentQueryBuilder.execute).toHaveBeenCalled();
    expect(result).toEqual(deletedPayment.raw[0]);
  });
});
