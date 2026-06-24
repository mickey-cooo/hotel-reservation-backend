import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';

@Entity('payment_transaction')
export class PaymentTransactionEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'varchar', unique: true })
  stripeSessionId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentTransactionStatus,
    default: PaymentTransactionStatus.PENDING,
  })
  status: PaymentTransactionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
