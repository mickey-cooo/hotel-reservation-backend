import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { DistrictEntity } from './district.entity';
import { AmphurEntity } from './amhur.entity';

@Entity('geography')
export class GeographyEntity {
  @PrimaryGeneratedColumn('increment')
  geo_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  geo_name: string;

  @OneToMany(() => ProvinceEntity, (province) => province.geography)
  provinces?: ProvinceEntity[];

  @OneToMany(() => DistrictEntity, (district) => district.geography)
  districts?: DistrictEntity[];

  @OneToMany(() => AmphurEntity, (amphur) => amphur.geography)
  amphurs?: AmphurEntity[];
}
