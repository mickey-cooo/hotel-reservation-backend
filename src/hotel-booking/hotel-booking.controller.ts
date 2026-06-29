import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HotelBookingService } from './hotel-booking.service';
import { AuthGuard } from '../guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { CreateHotelBookingBodyDto } from './dto/create-hotel-booking.dto';
import { Token } from '../decorator/token.decorator';
import { TokenPayload } from '../helper/app.const';
import { HotelBookingParamsDto } from './dto/hotel-booking-params.dto';
import { UpdateHotelBookingBodyDto } from './dto/update-hotel-booking.dto';
import { RefundBookingBodyDto } from './dto/refund-booking.dto';

@ApiTags('Hotel Booking')
@UseGuards(AuthGuard)
@Controller('hotel-booking')
export class HotelBookingController {
  constructor(private readonly hotelBookingService: HotelBookingService) {}

  @Post('/create')
  async create(
    @Body() body: CreateHotelBookingBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.createHotelBooking(body, token.id);
  }

  @Get('/list')
  async listHotelBooking(
    @Body() body: HotelBookingParamsDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.findAllHotelBooking(body, token.id);
  }

  @Get('/:id')
  async findOneHotelBooking(
    @Param() param: HotelBookingParamsDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.findOneHotelBooking(param, token.id);
  }

  @Patch('/update/:id')
  async updateHotelBooking(
    @Param() param: HotelBookingParamsDto,
    @Body() body: UpdateHotelBookingBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.updateHotelBooking(
      param,
      body,
      token.id,
    );
  }

  @Patch('/confirm/:bookingCode')
  async confirmHotelBooking(@Param() param: HotelBookingParamsDto) {
    return await this.hotelBookingService.confirmHotelBooking(param);
  }

  @Patch('/check-in/:bookingCode')
  async checkInBooking(@Param() param: HotelBookingParamsDto) {
    return await this.hotelBookingService.checkInBooking(param);
  }

  @Patch('/check-out/:bookingCode')
  async checkOutBooking(@Param() param: HotelBookingParamsDto) {
    return await this.hotelBookingService.checkOutBooking(param);
  }

  @Patch('/refund-cancel')
  async refundCancelHotelBooking(
    @Body() body: RefundBookingBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.cancelAndRefund(body, token.id);
  }

  @Delete('/cancel/:id')
  async cancelHotelBooking(
    @Param() param: HotelBookingParamsDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelBookingService.cancelHotelBooking(param, token.id);
  }
}
