import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateBodyRoleDto } from './dto/create-role.dto';
import { BodyRoleIdsDto, RoleParamDto } from './dto/role-param.dto';
import { UpdateBodyRoleDto } from './dto/update-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('/create')
  async createRole(@Body() body: CreateBodyRoleDto) {
    return await this.roleService.createRole(body);
  }

  @Get('/list')
  async findAllRoles(@Body() body: BodyRoleIdsDto) {
    return await this.roleService.findAllRoles(body);
  }

  @Get('/:id')
  async findOneRole(@Param() param: RoleParamDto) {
    return await this.roleService.findOneRole(param);
  }

  @Patch('update/:id')
  async updateRole(
    @Param() param: RoleParamDto,
    @Body() body: UpdateBodyRoleDto,
  ) {
    return await this.roleService.updateRole(param, body);
  }

  @Delete('delete/:id')
  async deleteRole(@Param() param: RoleParamDto) {
    return await this.roleService.deleteRole(param);
  }
}
