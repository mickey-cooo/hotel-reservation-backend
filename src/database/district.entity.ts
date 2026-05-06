import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { AmphurEntity } from './amhur.entity';
import { GeographyEntity } from './geography.entity';

@Entity('district')
export class DistrictEntity {
  @PrimaryGeneratedColumn('increment')
  district_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  district_code: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  district_name: string;

  @ManyToOne(() => AmphurEntity, (amphur) => amphur.districts)
  @JoinColumn({ name: 'amphur_id' })
  amphur?: AmphurEntity;

  @ManyToOne(() => ProvinceEntity, (province) => province.districts)
  @JoinColumn({ name: 'province_id' })
  province?: ProvinceEntity;

  @ManyToOne(() => GeographyEntity, (geography) => geography.districts)
  @JoinColumn({ name: 'geo_id' })
  geography?: GeographyEntity;
}
