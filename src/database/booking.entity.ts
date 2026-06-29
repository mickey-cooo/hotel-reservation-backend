import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { PaymentMethod, PaymentStatus } from '../enum/common.status';
import { UserEntity } from './user.entity';
import { HotelRoomEntity } from './hotel-room.entity';

@Entity('booking')
export class BookingEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  bookingCode: string;

  @Column({ type: 'timestamptz', nullable: true })
  bookingDate: Date;

  @Column({ type: 'integer', nullable: true })
  guestCount: number;

  @Column({ type: 'integer', nullable: true })
  stayPeriod: number;

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

  @Column({ type: 'timestamptz', nullable: true })
  expiredDate: Date;

  @ManyToOne(() => UserEntity, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => HotelRoomEntity, (hotelRoom) => hotelRoom.bookings)
  @JoinColumn({ name: 'hotel_room_id' })
  hotelRoom?: HotelRoomEntity;
}
