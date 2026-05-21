import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../database/payment.entity';
import { UserEntity } from '../database/user.entity';
import { CommonStatus } from '../enum/common.status';
import { CreatePaymentBodyDto } from './dto/create-payment.dto';
import { UpdatePaymentBodyDto } from './dto/update-payment.dto';
import { PaymentResponse } from './interface/payment.interface';
import {
  ParamPaymentDto,
  ParamPaymentQueryDto,
} from './dto/payment-params.dto';

@Injectable()
export class PaymentService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(body: CreatePaymentBodyDto) {
    try {
      const user = await this.findActiveUser(body.user_id ?? '');
      const cardNumberHash = await this.hashSecret(body.cardNumber);
      const cardCvvHash = await this.hashSecret(body.cardCvv);

      const createdPayment = await this.paymentRepository
        .createQueryBuilder()
        .insert()
        .into(PaymentEntity)
        .values({
          cardNumber: cardNumberHash,
          cardHolderName: body.cardHolderName,
          cardExpiryMonth: body.cardExpiryMonth,
          cardExpiryYear: body.cardExpiryYear,
          cardCvv: cardCvvHash,
          status: CommonStatus.ACTIVE,
          user: { id: user?.id },
        })
        .returning([
          'id',
          'cardHolderName',
          'cardExpiryMonth',
          'cardExpiryYear',
          'status',
          'createdAt',
          'updatedAt',
        ])
        .execute();

      if (!createdPayment?.raw?.length) {
        throw new BadRequestException('Failed to create payment card');
      }

      return createdPayment.raw[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(params: ParamPaymentQueryDto) {
    try {
      const queryBuilder = this.paymentRepository
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.user', 'u')
        .select([
          'p.id as "id"',
          'p.cardHolderName as "cardHolderName"',
          'p.cardExpiryMonth as "cardExpiryMonth"',
          'p.cardExpiryYear as "cardExpiryYear"',
          'p.status as "status"',
          'p.createdAt as "createdAt"',
          'p.updatedAt as "updatedAt"',
          'u.id as "user_id"',
        ])
        .where('p.status = :status', { status: CommonStatus.ACTIVE });

      if (params.user_id) {
        queryBuilder.andWhere('u.id = :user_id', { user_id: params.user_id });
      }

      const payments = await queryBuilder
        .orderBy('p.createdAt', 'DESC')
        .getRawMany();

      return payments;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(param: ParamPaymentDto) {
    try {
      const payment = await this.findActivePayment(param.id);

      if (!payment) {
        throw new NotFoundException('Payment card not found');
      }

      return payment;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(param: ParamPaymentDto, body: UpdatePaymentBodyDto) {
    try {
      const currentPayment = await this.findActivePayment(param.id);
      const user_id = body.user_id;
      const user = await this.findActiveUser(user_id ?? '');
      const cardNumberHash = body.cardNumber
        ? await this.hashSecret(body.cardNumber)
        : undefined;
      const cardCvvHash = body.cardCvv
        ? await this.hashSecret(body.cardCvv)
        : undefined;

      const updatedPayment = await this.paymentRepository
        .createQueryBuilder()
        .update(PaymentEntity)
        .set({
          cardNumber: cardNumberHash,
          cardHolderName: body.cardHolderName ?? currentPayment.cardHolderName,
          cardExpiryMonth:
            body.cardExpiryMonth ?? currentPayment.cardExpiryMonth,
          cardExpiryYear: body.cardExpiryYear ?? currentPayment.cardExpiryYear,
          cardCvv: cardCvvHash,
          user: { id: user.id },
        })
        .where('id = :id', { id: currentPayment.id })
        .returning([
          'id',
          'cardHolderName',
          'cardExpiryMonth',
          'cardExpiryYear',
          'status',
          'createdAt',
          'updatedAt',
        ])
        .execute();

      if (!updatedPayment?.raw?.length) {
        throw new BadRequestException('Failed to update payment card');
      }

      return updatedPayment.raw[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  async delete(param: ParamPaymentDto) {
    try {
      const payment = await this.findActivePayment(param.id);

      const deletedPayment = await this.paymentRepository
        .createQueryBuilder()
        .update(PaymentEntity)
        .set({
          status: CommonStatus.DELETED,
        })
        .where('id = :id', { id: payment.id })
        .returning([
          'id',
          'cardHolderName',
          'cardExpiryMonth',
          'cardExpiryYear',
          'status',
          'createdAt',
          'updatedAt',
        ])
        .execute();

      if (!deletedPayment?.raw?.length) {
        throw new BadRequestException('Failed to delete payment card');
      }

      return deletedPayment.raw[0];
    } catch (error) {
      throw new Error(error);
    }
  }

  private async findActiveUser(user_id: string) {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .select(['u.id as "id"', 'u.status as "status"'])
      .where('u.id = :user_id', { user_id })
      .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
      .getRawOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async findActivePayment(id: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.user', 'u')
      .select([
        'p.id as "id"',
        'p.cardHolderName as "cardHolderName"',
        'p.cardExpiryMonth as "cardExpiryMonth"',
        'p.cardExpiryYear as "cardExpiryYear"',
        'p.status as "status"',
        'p.createdAt as "createdAt"',
        'p.updatedAt as "updatedAt"',
        'u.id as "user_id"',
      ])
      .where('p.id = :id', { id })
      .andWhere('p.status = :status', { status: CommonStatus.ACTIVE })
      .getRawOne();

    if (!payment) {
      throw new NotFoundException('Payment card not found');
    }

    return payment;
  }

  private async hashSecret(value: string) {
    return await bcrypt.hash(value, this.saltRounds);
  }
}
