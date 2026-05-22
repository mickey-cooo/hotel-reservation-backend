import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { AddressEntity } from './address.entity';
import { HotelRoomEntity } from './hotel-room.entity';
import { HotelReviewEntity } from './hotel-review.entity';
import { BookingEntity } from './booking.entity';
import { CommonStatus } from '../enum/common.status';

@Entity('hotel')
export class HotelEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @Column({ type: 'enum', enum: CommonStatus, nullable: true })
  status: CommonStatus;

  @OneToOne(() => AddressEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address?: AddressEntity;

  @OneToMany(() => HotelRoomEntity, (room) => room.hotel)
  rooms?: HotelRoomEntity[];

  @OneToMany(() => HotelReviewEntity, (review) => review.hotel)
  reviews?: HotelReviewEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.hotel)
  bookings?: BookingEntity[];
}
