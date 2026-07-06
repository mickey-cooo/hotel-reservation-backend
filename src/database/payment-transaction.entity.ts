import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { CardEntity } from './card.entity';

@Entity('payment_transaction')
export class PaymentTransactionEntity extends TemplateEntity {
  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', unique: true })
  stripeSessionId: string;

  @Column({ type: 'varchar', nullable: true })
  paymentIntentId: string | null;

  @Column({ type: 'varchar', nullable: true })
  stripeRefundId: string | null;

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

  @ManyToOne(() => CardEntity, (card) => card.paymentTransactions)
  @JoinColumn({ name: 'card_id' })
  card: CardEntity;
}
