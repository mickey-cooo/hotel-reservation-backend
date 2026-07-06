import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentLogEntity } from '../database/payment-log.entity';
import { CreatePaymentLogBodyDto } from './dto/create-payment-log.dto';
import { UpdatePaymentLogBodyDto } from './dto/update-payment-log.dto';
import {
  ListParamsPaymentLogDto,
  ParamPaymentLogDto,
} from './dto/params.payment-log.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class PaymentLogService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PaymentLogEntity)
    private readonly paymentLogRepository: Repository<PaymentLogEntity>,
    private readonly loggerService: LoggerService,
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
      this.loggerService.error({
        service: PaymentLogService.name,
        event: 'create',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findAll(body: ListParamsPaymentLogDto) {
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
      this.loggerService.error({
        service: PaymentLogService.name,
        event: 'findAll',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async findById(param: ParamPaymentLogDto) {
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
      this.loggerService.error({
        service: PaymentLogService.name,
        event: 'findById',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async update(param: ParamPaymentLogDto, body: UpdatePaymentLogBodyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .where('pl.id = :id', { id: param.id })
        .getOne();

      if (!existing) {
        throw new BadRequestException('Payment log not found');
      }

      const result = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .update(PaymentLogEntity)
        .set({ ...body })
        .where('id = :id', { id: param.id })
        .execute();

      if (!result?.affected) {
        throw new BadRequestException('Failed to update payment log');
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: PaymentLogService.name,
        event: 'update',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(param: ParamPaymentLogDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existing = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .where('pl.id = :id', { id: param.id })
        .getOne();

      if (!existing) {
        throw new BadRequestException('Payment log not found');
      }

      const result = await this.paymentLogRepository
        .createQueryBuilder('pl')
        .update(PaymentLogEntity)
        .set({ deletedAt: new Date() })
        .where('id = :id', { id: param.id })
        .execute();

      if (!result?.affected) {
        throw new BadRequestException('Failed to delete payment log');
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.loggerService.error({
        service: PaymentLogService.name,
        event: 'delete',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
