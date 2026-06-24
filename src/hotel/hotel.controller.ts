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
import { BodyHotelIdsDto, ParamHotelDto } from './dto/hotel-params.dto';
import { UpdateHotelBodyDto } from './dto/update-hotel.dto';
import { PaginationQueryDto } from '../pagination/dto/pagination.dto';
import { AuthGuard } from '../guard/auth.guard';

@Controller('/hotel')
@UseGuards(AuthGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/create')
  async createHotel(@Body() body: CreateHotelBodyDto) {
    return await this.hotelService.createHotel(body);
  }

  @Get('/list')
  async findAllHotel(
    @Body() body: BodyHotelIdsDto,
    @Query() query: PaginationQueryDto,
  ) {
    return await this.hotelService.findAllHotel(body, query);
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
