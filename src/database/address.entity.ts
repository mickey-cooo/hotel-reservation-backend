import { Column, Entity, OneToOne } from 'typeorm';
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

  @Column({ type: 'varchar', nullable: true })
  detail: string;

  @OneToOne(() => UserEntity, (user) => user.address)
  user?: UserEntity;

  @OneToOne(() => HotelEntity, (hotel) => hotel.address)
  hotel?: HotelEntity;
}
