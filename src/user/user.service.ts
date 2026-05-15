import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../database/user.entity';
import { CreateBodyUserDto } from './dto/create-user.dto';
import { CommonStatus } from 'src/enum/common.status';
import { BodyUserIdsDto, ParamUserDto } from './dto/user-param.dto';
import { UpdateBodyUserDto } from './dto/update-user.dto';
import { AddressEntity } from 'src/database/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginBodyDto, RegisterBodyDto } from './dto/authenticate.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(body: CreateBodyUserDto) {
    try {
      const createUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          address: body.addressDetail,
          status: CommonStatus.ACTIVE,
        })
        .execute();

      if (!createUser?.raw?.affected) {
        throw new BadRequestException('Failed to create user');
      }

      return {
        message: 'User created successfully',
        data: createUser,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAllUser(body: BodyUserIdsDto) {
    try {
      const currentUser = await this.userRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.address', 'a')
        .select([
          'u.id as "id"',
          'u.firstName as "firstName"',
          'u.lastName as "lastName"',
          'u.phoneNumber as "phoneNumber"',
          'u.email as "email"',
          'u.status as "status"',
          'a.country as "country"',
          'a.province as "province"',
          'a.district as "district"',
          'a.subDistrict as "subDistrict"',
          'a.postalCode as "postalCode"',
          'a.detail as "detail"',
        ])
        .whereInIds(body.ids)
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getRawMany();

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User found successfully',
        data: currentUser,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOneUser(param: ParamUserDto) {
    try {
      const currentUser = await this.userRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.address', 'a')
        .select([
          'u.id as "id"',
          'u.firstName as "firstName"',
          'u.lastName as "lastName"',
          'u.phoneNumber as "phoneNumber"',
          'u.email as "email"',
          'u.status as "status"',
          'a.country as "country"',
          'a.province as "province"',
          'a.district as "district"',
          'a.subDistrict as "subDistrict"',
          'a.postalCode as "postalCode"',
          'a.detail as "detail"',
        ])
        .where('u.id = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User found successfully',
        data: currentUser,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(
    param: ParamUserDto,
    body: UpdateBodyUserDto,
    userId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentUser = await this.userRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.address', 'a')
        .where('u.id = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where('id = :id', { id: currentUser?.id })
        .returning('*')
        .execute();

      if (!currentUser.address) {
        const createdAddress = await this.addressRepository
          .createQueryBuilder()
          .insert()
          .into(AddressEntity)
          .values({
            country: body.addressDetail.country,
            province: body.addressDetail.province,
            district: body.addressDetail.district,
            subDistrict: body.addressDetail.subDistrict,
            postalCode: body.addressDetail.postalCode,
            detail: body.addressDetail.detail,
          })
          .execute();

        if (!createdAddress) {
          throw new BadRequestException('Failed to create address');
        }

        await this.userRepository
          .createQueryBuilder()
          .update(UserEntity)
          .set({
            address: createdAddress.raw[0].id,
          })
          .where('id = :id', { id: currentUser?.id })
          .returning('*')
          .execute();
      } else {
        const updatedAddress = await this.addressRepository
          .createQueryBuilder()
          .update(AddressEntity)
          .set({
            country: body.addressDetail.country,
            province: body.addressDetail.province,
            district: body.addressDetail.district,
            subDistrict: body.addressDetail.subDistrict,
            postalCode: body.addressDetail.postalCode,
            detail: body.addressDetail.detail,
          })
          .where('id = :id', { id: currentUser.address.id })
          .returning('*')
          .execute();

        if (!updatedAddress) {
          throw new BadRequestException('Failed to update address');
        }

        await this.userRepository
          .createQueryBuilder()
          .update(UserEntity)
          .set({
            address: updatedAddress.raw[0].id,
          })
          .where('id = :id', { id: currentUser?.id })
          .returning('*')
          .execute();
      }

      if (!updatedUser) {
        throw new BadRequestException('Failed to update user');
      }

      return {
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(param: ParamUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentUser = await this.userRepository
        .createQueryBuilder('u')
        .where('u.id = :id', { id: param.id })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      const deletedUser = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          status: CommonStatus.DELETED,
        })
        .where('id = :id', { id: currentUser.id })
        .returning('*')
        .execute();

      if (!deletedUser) {
        throw new BadRequestException('Failed to delete user');
      }

      return {
        message: 'User deleted successfully',
        data: null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async register(body: RegisterBodyDto) {
    try {
      const emailExists = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (emailExists) {
        throw new BadRequestException('Email already exists');
      }

      if (body.password !== body.confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const newUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          email: body.email,
          password: hashedPassword,
          status: CommonStatus.ACTIVE,
        })
        .returning('*')
        .execute();

      if (!newUser) {
        throw new BadRequestException('Failed to create user');
      }

      return {
        message: 'User registered successfully',
        data: newUser,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async login(body: LoginBodyDto) {
    try {
      const userExists = await this.userRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('u.role', 'role')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const comparedPassword = await bcrypt.compare(
        body.password,
        userExists.password,
      );

      if (!comparedPassword) {
        throw new BadRequestException('Invalid password');
      }

      const role = userExists.role;
      const token = this.jwtService.sign({
        id: userExists.id,
        email: userExists.email,
        roles: role?.name ? [role.name] : [],
        roleId: role?.id,
      });

      return {
        message: 'User logged in successfully',
        accessToken: `Bearer ${token}`,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
