import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleEntity } from '../database/role.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBodyRoleDto } from './dto/create-role.dto';
import { BodyRoleIdsDto, RoleParamDto } from './dto/role-param.dto';
import { UpdateBodyRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async createRole(body: CreateBodyRoleDto) {
    try {
      const role = await this.roleRepository
        .createQueryBuilder()
        .insert()
        .into(RoleEntity)
        .values({
          name: body.name,
          description: body.description,
          priority: body.priority,
        })
        .returning('*')
        .execute();

      if (!role) {
        throw new BadRequestException('Failed to create role');
      }

      return {
        message: 'Role created successfully',
        data: role,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllRoles(body: BodyRoleIdsDto) {
    try {
      const roles = await this.roleRepository
        .createQueryBuilder('r')
        .whereInIds(body.ids)
        .andWhere('r.deletedAt IS NULL')
        .getRawMany();

      if (!roles) {
        throw new NotFoundException('Roles not found');
      }

      return {
        message: 'Roles found successfully',
        data: roles,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOneRole(param: RoleParamDto) {
    try {
      const currentRole = await this.roleRepository
        .createQueryBuilder('r')
        .where('r.id = :id', { id: param.id })
        .andWhere('r.deletedAt IS NULL')
        .getOne();

      if (!currentRole) {
        throw new NotFoundException('Role not found');
      }

      return {
        message: 'Role found successfully',
        data: currentRole,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRole(param: RoleParamDto, body: UpdateBodyRoleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentRole = await this.roleRepository
        .createQueryBuilder('r')
        .where('r.id = :id', { id: param.id })
        .andWhere('r.deletedAt IS NULL')
        .getOne();

      if (!currentRole) {
        throw new NotFoundException('Role not found');
      }

      const updatedRole = await this.roleRepository
        .createQueryBuilder()
        .update(RoleEntity)
        .set({
          name: body.name,
          description: body.description,
          priority: body.priority,
        })
        .where('id = :id', { id: currentRole.id })
        .returning('*')
        .execute();

      if (!updatedRole) {
        throw new BadRequestException('Failed to update role');
      }

      return {
        message: 'Role updated successfully',
        data: updatedRole,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRole(param: RoleParamDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const currentRole = await this.roleRepository
        .createQueryBuilder('r')
        .where('r.id = :id', { id: param.id })
        .andWhere('r.deletedAt IS NULL')
        .getOne();

      if (!currentRole) {
        throw new NotFoundException('Role not found');
      }

      const deletedRole = await this.roleRepository
        .createQueryBuilder()
        .update(RoleEntity)
        .set({
          deletedAt: new Date(),
        })
        .where('id = :id', { id: currentRole.id })
        .returning('*')
        .execute();

      if (!deletedRole) {
        throw new BadRequestException('Failed to delete role');
      }

      return {
        message: 'Role deleted successfully',
        data: null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
