import { Column, DeleteDateColumn, Entity, OneToOne } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';
import { HotelEntity } from './hotel.entity';

@Entity('address')
export class AddressEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  province: string;

  @Column({ type: 'varchar', nullable: true })
  district: string;

  @Column({ type: 'varchar', nullable: true })
  subDistrict: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string;

  @Column({ type: 'jsonb', nullable: true })
  detail?: string;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToOne(() => UserEntity, (user) => user.address)
  user?: UserEntity;

  @OneToOne(() => HotelEntity, (hotel) => hotel.address)
  hotel?: HotelEntity;
}
