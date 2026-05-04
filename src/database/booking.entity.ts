import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { PaymentMethod, PaymentStatus } from '../enum/common.status';
import { UserEntity } from './user.entity';
import { HotelEntity } from './hotel.entity';

@Entity('booking')
export class BookingEntity extends TemplateEntity {
  @Column({ type: 'integer', nullable: true })
  totalPrice: number;

  @Column({ type: 'enum', enum: HotelBookingStatus, nullable: true })
  status: HotelBookingStatus;

  @Column({ type: 'timestamptz', nullable: true })
  checkInDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutDate: Date;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
  paymentStatus: PaymentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paymentDate: Date;

  @Column({ type: 'varchar', nullable: true })
  paymentTransactionId: string;

  @Column({ type: 'integer', nullable: true })
  paymentAmount: number;

  @ManyToOne(() => UserEntity, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => HotelEntity, (hotel) => hotel.bookings)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;
}
