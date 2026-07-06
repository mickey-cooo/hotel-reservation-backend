import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { CommonStatus } from '../enum/common.status';
import { UserEntity } from './user.entity';
import { PaymentTransactionEntity } from './payment-transaction.entity';

@Entity('card')
export class CardEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  cardNumber: string;

  @Column({ type: 'varchar', nullable: true })
  cardHolderName: string;

  @Column({ type: 'varchar', nullable: true })
  cardExpiryMonth: string;

  @Column({ type: 'varchar', nullable: true })
  cardExpiryYear: string;

  @Column({ type: 'varchar', nullable: true })
  cardCvv: string;

  @Column({ type: 'enum', enum: CommonStatus, nullable: true })
  status: CommonStatus;

  @ManyToOne(() => UserEntity, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(
    () => PaymentTransactionEntity,
    (paymentTransaction) => paymentTransaction.card,
  )
  paymentTransactions: PaymentTransactionEntity[];
}
