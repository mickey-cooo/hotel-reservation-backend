import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelBodyDto } from './dto/create-hotel.dto';
import { ParamHotelDto, QueryHotelDto } from './dto/hotel-params.dto';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  async createHotel(@Body() body: CreateHotelBodyDto) {
    return await this.hotelService.createHotel(body);
  }

  @Post('/list')
  async findAllHotel(@Query() query: QueryHotelDto) {
    return await this.hotelService.findAllHotel(query);
  }

  @Get('/:id')
  async findOneHotel(@Param() param: ParamHotelDto) {
    return await this.hotelService.findOneHotel(param);
  }

  @Patch('/update/:id')
  @UseGuards(AuthGuard)
  async updateHotel(
    @Param() param: ParamHotelDto,
    @Body() body: UpdateHotelBodyDto,
  ) {
    return await this.hotelService.updateHotel(param, body);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  async deleteHotel(@Param() param: ParamHotelDto) {
    return await this.hotelService.deleteHotel(param);
  }
}
