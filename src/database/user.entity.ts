import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { AddressEntity } from './address.entity';
import { CommonStatus } from '../enum/common.status';
import { RoleEntity } from './role.entity';
import { HotelReviewEntity } from './hotel-review.entity';
import { BookingEntity } from './booking.entity';
import { PaymentEntity } from './payment.entity';
import { ResetPasswordEntity } from './reset-password.entity';

export interface UserNameType {
  th: string;
  en: string;
}

@Entity('user')
export class UserEntity extends TemplateEntity {
  @Column({ type: 'jsonb', nullable: true })
  firstName: UserNameType;

  @Column({ type: 'jsonb', nullable: true })
  lastName: UserNameType;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  otpCode: string;

  @Column({ type: 'timestamptz', nullable: true })
  otpExpiresAt: Date;

  @Column({ type: 'enum', enum: CommonStatus })
  status: CommonStatus;

  @ManyToOne(() => AddressEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address?: AddressEntity;

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @OneToMany(() => HotelReviewEntity, (review) => review.user)
  reviews?: HotelReviewEntity[];

  @OneToMany(() => BookingEntity, (booking) => booking.user)
  bookings?: BookingEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user)
  payments?: PaymentEntity[];

  @OneToMany(() => ResetPasswordEntity, (resetPassword) => resetPassword.user)
  resetPasswords?: ResetPasswordEntity[];
}
