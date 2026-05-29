import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { CreatePaymentLogBodyDto } from './dto/create-payment-log.dto';
import { UpdatePaymentLogBodyDto } from './dto/update-payment-log.dto';

@Injectable()
export class PaymentLogService {
  constructor(
    @InjectRepository(PaymentLogEntity)
    private readonly paymentLogRepository: Repository<PaymentLogEntity>,
  ) {}

  async create(body: CreatePaymentLogBodyDto, user_id: string) {
    try {
      const paymentLog = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .insert()
        .into(PaymentLogEntity)
        .values({ ...body, userId: user_id })
        .execute();

      if (!paymentLog?.raw?.affected) {
        throw new BadRequestException('Failed to create payment log');
      }

      return paymentLog;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(body: any) {
    try {
      const paymentLogs = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .whereInIds(body.ids)
        .getMany();

      if (!paymentLogs) {
        throw new BadRequestException('Payment log not found');
      }
      return paymentLogs;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findById(param: any) {
    try {
      const paymentLog = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .where('pl.id = :id', { id: param.id })
        .getOne();
      if (!paymentLog) {
        throw new BadRequestException('Payment log not found');
      }
      return paymentLog;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, body: UpdatePaymentLogBodyDto) {
    try {
      const existing = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .where('pl.id = :id', { id })
        .getOne();

      if (!existing) {
        throw new BadRequestException('Payment log not found');
      }

      const result = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .update(PaymentLogEntity)
        .set({ ...body })
        .where('id = :id', { id })
        .execute();

      if (!result?.affected) {
        throw new BadRequestException('Failed to update payment log');
      }

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }

  async softDelete(id: string) {
    try {
      const existing = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .where('pl.id = :id', { id })
        .getOne();

      if (!existing) {
        throw new BadRequestException('Payment log not found');
      }

      const result = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .update(PaymentLogEntity)
        .set({ deletedAt: new Date() })
        .where('id = :id', { id })
        .execute();

      if (!result?.affected) {
        throw new BadRequestException('Failed to delete payment log');
      }

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}
