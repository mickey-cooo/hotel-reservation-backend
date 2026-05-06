import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { DistrictEntity } from './district.entity';
import { GeographyEntity } from './geography.entity';

@Entity('amphur')
export class AmphurEntity {
  @PrimaryGeneratedColumn('increment')
  amphur_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  amphur_code: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  amphur_name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  postcode: string;

  @ManyToOne(() => GeographyEntity, (geography) => geography.amphurs)
  @JoinColumn({ name: 'geo_id' })
  geography?: GeographyEntity;

  @ManyToOne(() => ProvinceEntity, (province) => province.amphurs)
  @JoinColumn({ name: 'province_id' })
  province?: ProvinceEntity;

  @OneToMany(() => DistrictEntity, (district) => district.amphur)
  districts?: DistrictEntity[];
}
