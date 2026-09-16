import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HotelRoomService } from './hotel-room.service';
import { CreateManyHotelRoomBodyDto } from './dto/create-hotel-room.dto';
import { HotelRoomDataInterface } from './interface/hotel-room.interface';
import { HotelRoomBodyParamsDto } from './dto/hotel-room-params.dto';
import { UpdateHotelRoomBodyDto } from './dto/update-hotel-room.dto';
import { AuthGuard } from '../guard/auth.guard';
import { HotelRoomQueryParamsDto } from './dto/hotel-room-query.dto';

@Controller('/hotel-room')
export class HotelRoomController {
  constructor(private readonly hotelRoomService: HotelRoomService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  async createHotelRoom(
    @Body() body: CreateManyHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface[]> {
    return await this.hotelRoomService.createHotelRoom(body);
  }

  @Get('/list')
  async findAllHotelRooms(
    @Body() body: HotelRoomBodyParamsDto | undefined,
    @Query() query: HotelRoomQueryParamsDto,
  ): Promise<HotelRoomDataInterface[]> {
    return await this.hotelRoomService.findAllHotelRooms(body, query);
  }

  @Get('/:id')
  async findOneHotelRoom(
    @Param('id') id: string,
  ): Promise<HotelRoomDataInterface> {
    return await this.hotelRoomService.findOneHotelRoom({ id: id });
  }

  @Patch('/update/:id')
  @UseGuards(AuthGuard)
  async updateHotelRoom(
    @Param('id') id: string,
    @Body() body: UpdateHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface> {
    return await this.hotelRoomService.updateHotelRoom({ id: id }, body);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  async deleteHotelRoom(@Param('id') id: string): Promise<void> {
    return await this.hotelRoomService.deleteHotelRoom({ id: id });
  }

  @Get('/availability/:id')
  async hotelRoomAvailability(
    @Param('id') id: string,
  ): Promise<HotelRoomDataInterface> {
    return await this.hotelRoomService.hotelRoomAvailability({ id: id });
  }
}
