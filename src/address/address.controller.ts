import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressBodyDto } from './dto/create-address.dto';

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
}
