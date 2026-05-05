import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { ParamHotelDto } from './dto/hotel-params.dto';

@Controller('/hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/create')
  async createHotel(@Body() body: CreateHotelBodyDto) {
    return await this.hotelService.createHotel(body);
  }

  @Get('/:id')
  async findOneHotel(@Param() param: ParamHotelDto) {
    return await this.hotelService.findOneHotel(param);
  }
}
