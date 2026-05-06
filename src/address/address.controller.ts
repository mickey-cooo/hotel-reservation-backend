import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressBodyDto } from './dto/create-address.dto';
import {
  AddressBodyParamsDto,
  AddressParamDto,
} from './dto/address-params.dto';
import { UpdateAddressBodyDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('/create')
  async createAddress(@Body() body: CreateAddressBodyDto) {
    return await this.addressService.createAddress(body);
  }

  @Get('/:id')
  async findOneAddress(@Param() param: { id: string }) {
    return await this.addressService.findOneAddress(param);
  }

  @Get('/list')
  async findAllAddress(@Body() body: AddressBodyParamsDto) {
    return await this.addressService.findAllAddress(body);
  }

  @Patch('/update/:id')
  async updateAddress(
    @Param() param: AddressParamDto,
    @Body() body: UpdateAddressBodyDto,
  ) {
    return await this.addressService.updateAddress(param, body);
  }

  @Delete('/delete/:id')
  async deleteAddress(@Param() param: AddressParamDto) {
    return await this.addressService.deleteAddress(param);
  }
}
