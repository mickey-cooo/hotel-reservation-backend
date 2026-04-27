import { Controller, Post, Body } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateBodyRoleDto } from './dto/create-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() body: CreateBodyRoleDto) {
    return await this.roleService.createRole(body);
  }
}
