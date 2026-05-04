import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HotelRoomService } from './hotel-room.service';
import { CreateManyHotelRoomBodyDto } from './dto/create-hotel-room.dto';
import { HotelRoomDataInterface } from './interface/hotel-room.interface';
import { HotelRoomBodyParamsDto } from './dto/hotel-room-params.dto';
import { UpdateHotelRoomBodyDto } from './dto/update-hotel-room.dto';

@Controller('/hotel-room')
export class HotelRoomController {
  constructor(private readonly hotelRoomService: HotelRoomService) {}

  @Post('/create')
  async createHotelRoom(
    @Body() body: CreateManyHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface[]> {
    return await this.hotelRoomService.createHotelRoom(body);
  }

  @Get('/list')
  async findAllHotelRooms(
    @Body() body: HotelRoomBodyParamsDto,
  ): Promise<HotelRoomDataInterface[]> {
    return await this.hotelRoomService.findAllHotelRooms(body);
  }

  @Get('/:id')
  async findOneHotelRoom(
    @Param('id') id: string,
  ): Promise<HotelRoomDataInterface> {
    return await this.hotelRoomService.findOneHotelRoom({ id: id });
  }

  @Patch('/update/:id')
  async updateHotelRoom(
    @Param('id') id: string,
    @Body() body: UpdateHotelRoomBodyDto,
  ): Promise<HotelRoomDataInterface> {
    return await this.hotelRoomService.updateHotelRoom({ id: id }, body);
  }

  @Delete('/delete/:id')
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
