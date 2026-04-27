import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBodyUserDto } from './dto/create-user.dto';
import { BodyUserIdsDto, ParamUserDto } from './dto/user-param.dto';
import { UpdateBodyUserDto } from './dto/update-user.dto';
import { LoginBodyDto, RegisterBodyDto } from './dto/authenticate.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async register(@Body() body: RegisterBodyDto) {
    return this.userService.register(body);
  }

  @Post('/login')
  async login(@Body() body: LoginBodyDto) {
    return this.userService.login(body);
  }

  @Post('/create')
  async createUser(@Body() body: CreateBodyUserDto) {
    return this.userService.createUser(body);
  }

  @Get('/list')
  async findAllUser(@Body() body: BodyUserIdsDto) {
    return this.userService.findAllUser(body);
  }

  @Get('/:id')
  async findOneUser(@Param() param: ParamUserDto) {
    return this.userService.findOneUser(param);
  }

  @Patch('update/:id')
  async updateUser(
    @Param() param: ParamUserDto,
    @Body() body: UpdateBodyUserDto,
  ) {
    return this.userService.updateUser(param, body);
  }

  @Delete('delete/:id')
  async deleteUser(@Param() param: ParamUserDto) {
    return this.userService.deleteUser(param);
  }
}
