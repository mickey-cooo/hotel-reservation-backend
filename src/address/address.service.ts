import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/database/address.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAddressBodyDto } from './dto/create-address.dto';
import {
  AddressBodyParamsDto,
  AddressParamDto,
  AmphurParamDto,
  DistrictParamDto,
  GeographyBodyParamsDto,
  ProvinceParamDto,
} from './dto/address-params.dto';
import {
  AddressInterface,
  AmphurInterface,
  DistrictInterface,
  GeographyInterface,
  ProvinceInterface,
} from './interface/address.interface';
import { UpdateAddressBodyDto } from './dto/update-address.dto';
import { GeographyEntity } from '../database/geography.entity';
import { ProvinceEntity } from '../database/province.entity';
import { DistrictEntity } from '../database/district.entity';
import { AmphurEntity } from '../database/amhur.entity';

@Injectable()
export class AddressService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(GeographyEntity)
    private readonly geographyRepository: Repository<GeographyEntity>,
    @InjectRepository(ProvinceEntity)
    private readonly provinceRepository: Repository<ProvinceEntity>,
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(AmphurEntity)
    private readonly amphurRepository: Repository<AmphurEntity>,
  ) {}

  async createAddress(body: CreateAddressBodyDto): Promise<{
    message: string;
    data: AddressInterface;
  }> {
    try {
      const createdAddress = await this.addressRepository
        .createQueryBuilder()
        .insert()
        .into(AddressEntity)
        .values({
          country: body.country,
          province: body.province,
          district: body.district,
          subDistrict: body.subDistrict,
          postalCode: body.postalCode,
          detail: body.detail,
        })
        .execute();

      if (!createdAddress) {
        throw new BadRequestException('Failed to create address');
      }

      return {
        message: 'Address created successfully',
        data: createdAddress.raw[0],
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneAddress(param: AddressParamDto): Promise<{
    message: string;
    data: AddressInterface;
  }> {
    try {
      const currentAddress = await this.addressRepository
        .createQueryBuilder('a')
        .where('a.id = :id', { id: param.id })
        .getOne();

      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      return {
        message: 'Address found successfully',
        data: currentAddress,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllAddress(body: AddressBodyParamsDto): Promise<{
    message: string;
    data: AddressInterface[];
  }> {
    try {
      const currentAddress = await this.addressRepository
        .createQueryBuilder('a')
        .whereInIds(body.ids)
        .andWhere('a.deletedAt IS NULL')
        .getRawMany();

      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      return {
        message: 'Address found successfully',
        data: currentAddress,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllGeography(
    body: GeographyBodyParamsDto,
  ): Promise<GeographyInterface[]> {
    try {
      const currentGeography = await this.geographyRepository
        .createQueryBuilder('g')
        .whereInIds(body.geo_ids)
        .getRawMany();

      if (!currentGeography) {
        throw new NotFoundException('Geography not found');
      }

      return currentGeography;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneProvince(param: ProvinceParamDto): Promise<ProvinceInterface> {
    try {
      const currentProvince = await this.provinceRepository
        .createQueryBuilder('p')
        .where('p.province_id = :province_id', {
          province_id: param.id,
        })
        .innerJoinAndSelect('p.geography', 'g')
        .select([
          'p.province_id as "province_id"',
          'p.province_code as "province_code"',
          'p.province_name as "province_name"',
          'g.geo_id as "geo_id"',
          'g.geo_name as "geo_name"',
        ])
        .getOne();

      if (!currentProvince) {
        throw new NotFoundException('Province not found');
      }

      return currentProvince;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findDistrictByProvince(
    param: DistrictParamDto,
  ): Promise<DistrictInterface> {
    try {
      const currentDistrict = await this.districtRepository
        .createQueryBuilder('d')
        .where('d.district_id = :district_id', {
          district_id: param.district_id,
        })
        .andWhere('d.geo_id = :geo_id', { geo_id: param.geo_id })
        .andWhere('d.province_id = :province_id', {
          province_id: param.province_id,
        })
        .innerJoinAndSelect('d.province', 'p')
        .innerJoinAndSelect('d.geography', 'g')
        .select([
          'd.district_id as "district_id"',
          'd.district_code as "district_code"',
          'd.district_name as "district_name"',
          'p.province_id as "province_id"',
          'p.province_code as "province_code"',
          'p.province_name as "province_name"',
          'g.geo_id as "geo_id"',
          'g.geo_name as "geo_name"',
        ])
        .getOne();

      if (!currentDistrict) {
        throw new NotFoundException('District not found');
      }

      return currentDistrict;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAmphurByProvince(param: AmphurParamDto): Promise<AmphurInterface> {
    try {
      const currentAmphur = await this.amphurRepository
        .createQueryBuilder('a')
        .where('a.amphur_id = :amphur_id', { amphur_id: param.province_id })
        .innerJoinAndSelect('a.geography', 'g')
        .innerJoinAndSelect('a.province', 'p')
        .select([
          'a.amphur_id as "amphur_id"',
          'a.amphur_code as "amphur_code"',
          'a.amphur_name as "amphur_name"',
          'a.postcode as "postcode"',
          'p.province_id as "province_id"',
          'p.province_code as "province_code"',
          'p.province_name as "province_name"',
          'g.geo_id as "geo_id"',
          'g.geo_name as "geo_name"',
        ])
        .getOne();

      if (!currentAmphur) {
        throw new NotFoundException('Amphur not found');
      }

      return currentAmphur;
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateAddress(
    param: AddressParamDto,
    body: UpdateAddressBodyDto,
  ): Promise<AddressInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentAddress = await this.addressRepository
        .createQueryBuilder('a')
        .where('a.id = :id', { id: param.id })
        .getOne();

      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      const updatedAddress = await this.addressRepository
        .createQueryBuilder()
        .update(AddressEntity)
        .set({
          country: body.country,
          province: body.province,
          district: body.district,
          subDistrict: body.subDistrict,
          postalCode: body.postalCode,
          detail: body.detail,
        })
        .where('id = :id', { id: param.id })
        .returning([
          'id',
          'country',
          'province',
          'district',
          'subDistrict',
          'postalCode',
          'detail',
        ])
        .execute();

      if (!updatedAddress) {
        throw new BadRequestException('Failed to update address');
      }

      return updatedAddress.raw[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAddress(param: AddressParamDto): Promise<AddressInterface> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentAddress = await this.addressRepository
        .createQueryBuilder('a')
        .where('a.id = :id', { id: param.id })
        .getOne();

      if (!currentAddress) {
        throw new NotFoundException('Address not found');
      }

      const deletedAddress = await this.addressRepository
        .createQueryBuilder()
        .update(AddressEntity)
        .set({
          deletedAt: new Date(),
        })
        .where('id = :id', { id: param.id })
        .returning('*')
        .execute();

      if (!deletedAddress) {
        throw new BadRequestException('Failed to delete address');
      }

      return deletedAddress.raw ?? null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
