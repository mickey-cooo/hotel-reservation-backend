import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressEntity } from '../database/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvinceEntity } from '../database/province.entity';
import { AmphurEntity } from '../database/amhur.entity';
import { DistrictEntity } from '../database/district.entity';
import { GeographyEntity } from '../database/geography.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      AddressEntity,
      ProvinceEntity,
      AmphurEntity,
      DistrictEntity,
      GeographyEntity,
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
