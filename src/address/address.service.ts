import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressEntity } from 'src/database/address.entity';
import { Repository } from 'typeorm';
import { CreateAddressBodyDto } from './dto/create-address.dto';
import {
  AddressBodyParamsDto,
  AddressParamDto,
} from './dto/address-params.dto';
import { AddressInterface } from './interface/address.interface';
import { UpdateAddressBodyDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
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
        data: createdAddress.raw,
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

  async updateAddress(
    param: AddressParamDto,
    body: UpdateAddressBodyDto,
  ): Promise<{
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
        .returning('*')
        .execute();

      if (!updatedAddress) {
        throw new BadRequestException('Failed to update address');
      }

      return {
        message: 'Address updated successfully',
        data: updatedAddress.raw,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteAddress(param: AddressParamDto): Promise<{
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

      return {
        message: 'Address deleted successfully',
        data: deletedAddress.raw,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
