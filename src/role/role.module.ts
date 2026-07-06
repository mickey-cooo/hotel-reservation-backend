import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../database/role.entity';
import { AppLogModule } from '../logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity]), AppLogModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
