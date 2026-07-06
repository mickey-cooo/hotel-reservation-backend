import { DataSource, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../database/user.entity';
import { CreateBodyUserDto } from './dto/create-user.dto';
import { CommonStatus, ResetPasswordStatus } from '../enum/common.status';
import { BodyUserIdsDto, ParamUserDto } from './dto/user-param.dto';
import { UpdateBodyUserDto } from './dto/update-user.dto';
import { AddressEntity } from '../database/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  LoginBodyDto,
  RegisterBodyDto,
  VerifyOtpBodyDto,
} from './dto/authenticate.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  ResetPasswordBodyDto,
  SendMailResetPasswordBodyDto,
} from './dto/reset-password.dto';
import { ResetPasswordEntity } from '../database/reset-password.entity';
import { MailService } from '../mail/mail.service';
import { v4 as uuidV4 } from 'uuid';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(ResetPasswordEntity)
    private readonly resetPasswordRepository: Repository<ResetPasswordEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
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
      this.loggerService.error({
        service: UserService.name,
        event: 'createUser',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: UserService.name,
        event: 'findAllUser',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: UserService.name,
        event: 'findOneUser',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: UserService.name,
        event: 'updateUser',
        payload: { message: error.message, stack: error.stack },
      });
      await queryRunner.rollbackTransaction();
      throw error;
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
      this.loggerService.error({
        service: UserService.name,
        event: 'deleteUser',
        payload: { message: error.message, stack: error.stack },
      });
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async register(body: RegisterBodyDto) {
    try {
      const emailExists = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status != :status', { status: CommonStatus.DELETED })
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
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          email: body.email,
          password: hashedPassword,
          otpCode: otp,
          otpExpiresAt,
          status: CommonStatus.INACTIVE,
        })
        .returning('*')
        .execute();

      if (!newUser) {
        throw new BadRequestException('Failed to create user');
      }

      await this.mailService.sendOtp(body.email, otp);

      return {
        message: 'User registered successfully. Please verify your email.',
        data: null,
      };
    } catch (error) {
      this.loggerService.error({
        service: UserService.name,
        event: 'register',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async verifyOtp(body: VerifyOtpBodyDto) {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('u.status = :status', { status: CommonStatus.INACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found or already verified');
      }

      if (user.otpCode !== body.otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (user.otpExpiresAt < new Date()) {
        throw new BadRequestException('OTP expired');
      }

      await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          status: CommonStatus.ACTIVE,
          otpCode: () => 'NULL',
          otpExpiresAt: () => 'NULL',
        })
        .where('id = :id', { id: user.id })
        .execute();

      return {
        message: 'Email verified successfully',
        data: null,
      };
    } catch (error) {
      this.loggerService.error({
        service: UserService.name,
        event: 'verifyOtp',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
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
      this.loggerService.error({
        service: UserService.name,
        event: 'login',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async resetPassword(body: ResetPasswordBodyDto, token: string) {
    try {
      const getResetPasswordToken = await this.resetPasswordRepository
        .createQueryBuilder('r')
        .where('r.resetPasswordToken = :resetPasswordToken', {
          resetPasswordToken: token,
        })
        .andWhere('r.status = :status', { status: ResetPasswordStatus.PENDING })
        .getOne();

      if (!getResetPasswordToken) {
        throw new NotFoundException('Reset password token not found');
      }

      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.email = :email', { email: body.email })
        .andWhere('status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.otpCode !== body.otpCode) {
        throw new BadRequestException('Invalid OTP');
      }

      if (user.otpExpiresAt < new Date()) {
        throw new BadRequestException('OTP expired');
      }

      if (body.newPassword !== body.confirmNewPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      const updatedUser = await this.userRepository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          password: hashedPassword,
          otpCode: () => 'NULL',
          otpExpiresAt: () => 'NULL',
        })
        .where('id = :id', { id: user.id })
        .returning('*')
        .execute();

      if (!updatedUser) {
        throw new BadRequestException('Failed to update user');
      }

      return {
        message: 'Password reset successfully',
        data: null,
      };
    } catch (error) {
      this.loggerService.error({
        service: UserService.name,
        event: 'resetPassword',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }

  async sendMailResetPassword(body: SendMailResetPasswordBodyDto) {
    try {
      const userEmail = await this.userRepository
        .createQueryBuilder('rp')
        .where('rp.email = :email', { email: body.email })
        .andWhere('rp.status = :status', { status: CommonStatus.ACTIVE })
        .getOne();

      if (!userEmail) {
        throw new NotFoundException('User not found');
      }

      const generatedToken = uuidV4();
      const newResetPassword = new ResetPasswordEntity();
      newResetPassword.resetPasswordToken = generatedToken;

      newResetPassword.expireAt = new Date(Date.now() + 60 * 60 * 1000);
      newResetPassword.user = userEmail;

      await this.resetPasswordRepository.save(newResetPassword);

      await this.mailService.sendResetPasswordMail(
        body.email,
        `${process.env.FRONTEND_URL}/reset-password?token=${generatedToken}`,
      );

      return {
        message: 'Reset password link sent successfully',
        data: null,
      };
    } catch (error) {
      this.loggerService.error({
        service: UserService.name,
        event: 'sendMailResetPassword',
        payload: { message: error.message, stack: error.stack },
      });
      throw error;
    }
  }
}
