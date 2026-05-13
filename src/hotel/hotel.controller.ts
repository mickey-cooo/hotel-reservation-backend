import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { BodyHotelIdsDto, ParamHotelDto } from './dto/hotel-params.dto';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';

@Controller('/hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/create')
  async createHotel(@Body() body: CreateHotelBodyDto) {
    return await this.hotelService.createHotel(body);
  }

  @Get('/list')
  async findAllHotel(@Body() body: BodyHotelIdsDto) {
    return await this.hotelService.findAllHotel(body);
  }

  @Get('/:id')
  async findOneHotel(@Param() param: ParamHotelDto) {
    return await this.hotelService.findOneHotel(param);
  }

  @Patch('/update/:id')
  async updateHotel(
    @Param() param: ParamHotelDto,
    @Body() body: UpdateHotelBodyDto,
  ) {
    return await this.hotelService.updateHotel(param, body);
  }

  @Delete('/delete/:id')
  async deleteHotel(@Param() param: ParamHotelDto) {
    return await this.hotelService.deleteHotel(param);
  }
}
