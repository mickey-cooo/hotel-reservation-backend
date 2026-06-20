import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateBodyUserDto } from './dto/create-user.dto';
import { BodyUserIdsDto, ParamUserDto } from './dto/user-param.dto';
import { UpdateBodyUserDto } from './dto/update-user.dto';
import {
  LoginBodyDto,
  RegisterBodyDto,
  VerifyOtpBodyDto,
} from './dto/authenticate.dto';
import { Token } from '../decorator/token.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { TokenPayload } from '../helper/app.const';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async register(@Body() body: RegisterBodyDto) {
    return this.userService.register(body);
  }

  @Post('/verify-otp')
  async verifyOtp(@Body() body: VerifyOtpBodyDto) {
    return this.userService.verifyOtp(body);
  }

  @Post('/login')
  async login(@Body() body: LoginBodyDto) {
    return this.userService.login(body);
  }

  @UseGuards(AuthGuard)
  @Post('/create')
  async createUser(@Body() body: CreateBodyUserDto) {
    return this.userService.createUser(body);
  }

  @UseGuards(AuthGuard)
  @Get('/list')
  async findAllUser(@Body() body: BodyUserIdsDto) {
    return this.userService.findAllUser(body);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findOneUser(@Param() param: ParamUserDto) {
    return this.userService.findOneUser(param);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  async updateUser(
    @Param() param: ParamUserDto,
    @Body() body: UpdateBodyUserDto,
    @Token() token: TokenPayload,
  ) {
    return this.userService.updateUser(param, body, token.id);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  async deleteUser(@Param() param: ParamUserDto) {
    return this.userService.deleteUser(param);
  }
}
