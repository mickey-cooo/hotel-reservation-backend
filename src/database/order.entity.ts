import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { BookingEntity } from './booking.entity';

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

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking?: BookingEntity;
}
