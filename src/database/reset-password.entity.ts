import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { ResetPasswordStatus } from '../enum/common.status';
import { UserEntity } from './user.entity';

@Entity('reset-password')
export class ResetPasswordEntity extends TemplateEntity {
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'otp_code',
  })
  otpCode: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'otp_expires_at',
  })
  otpExpiresAt: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'reset_password_token',
  })
  resetPasswordToken: string;

  @Column({
    type: 'timestamp',
  })
  expireAt: Date;

  @Column({
    type: 'enum',
    enum: ResetPasswordStatus,
    default: ResetPasswordStatus.PENDING,
  })
  status: ResetPasswordStatus;

  @ManyToOne(() => UserEntity, (user) => user.resetPasswords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}
