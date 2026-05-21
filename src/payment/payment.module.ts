import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../database/payment.entity';
import { UserEntity } from '../database/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, UserEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
