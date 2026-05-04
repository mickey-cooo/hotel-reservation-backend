import { Body, Controller, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';

@Controller('/hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/create')
  async createHotel(@Body() body: CreateHotelBodyDto) {
    return await this.hotelService.createHotel(body);
  }
}
