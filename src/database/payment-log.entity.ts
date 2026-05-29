import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('payment_log')
export class PaymentLogEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  log: string;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', nullable: true })
  hotelId: string;

  @Column({ type: 'varchar', nullable: true })
  hotelRoomId: string;

  @Column({ type: 'varchar', nullable: true })
  hotelBookingId: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
