import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';

@Entity('order')
export class OrderEntity extends TemplateEntity {
  @Column({
    type: 'enum',
    enum: PaymentTransactionStatus,
    default: PaymentTransactionStatus.PENDING,
  })
  status: PaymentTransactionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
