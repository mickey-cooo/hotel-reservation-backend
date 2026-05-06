import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AmphurEntity } from './amhur.entity';
import { GeographyEntity } from './geography.entity';
import { DistrictEntity } from './district.entity';

@Entity('province')
export class ProvinceEntity {
  @PrimaryGeneratedColumn('increment')
  province_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  province_code: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  province_name: string;

  @ManyToOne(() => GeographyEntity, (geography) => geography.provinces)
  @JoinColumn({ name: 'geo_id' })
  geography?: GeographyEntity;

  @OneToMany(() => AmphurEntity, (amphur) => amphur.province)
  amphurs?: AmphurEntity[];

  @OneToMany(() => DistrictEntity, (district) => district.province)
  districts?: DistrictEntity[];
}
