import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('country')
export class CountryEntity extends TemplateEntity {
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
}
