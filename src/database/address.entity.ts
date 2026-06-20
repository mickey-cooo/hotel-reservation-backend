import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
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

  @OneToMany(() => UserEntity, (user) => user.address)
  users?: UserEntity[];

  @OneToMany(() => HotelEntity, (hotel) => hotel.address)
  hotels?: HotelEntity[];
}
