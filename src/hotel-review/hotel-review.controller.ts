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
import { HotelReviewService } from './hotel-review.service';
import { CreateHotelReviewBodyDto } from './dto/create-hotel-review.dto';
import { Token } from '../decorator/token.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { TokenPayload } from '../helper/app.const';
import {
  HotelReviewParamDto,
  HotelReviewParamsDto,
} from './dto/hotel-review-params.dto';
import { UpdateHotelReviewBodyDto } from './dto/update-hotel-review.dto';

@ApiTags('Hotel Review')
@UseGuards(AuthGuard)
@Controller('hotel-review')
export class HotelReviewController {
  constructor(private readonly hotelReviewService: HotelReviewService) {}

  @Post('/create')
  async createHotelReview(
    @Body() body: CreateHotelReviewBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelReviewService.createHotelReview(body, token.id);
  }

  @Get('/list')
  async findAllHotelReview(@Body() body: HotelReviewParamsDto) {
    return await this.hotelReviewService.findAllHotelReview(body);
  }

  @Get('/:id/hotel/:hotel_id')
  async findOneHotelReview(@Param() param: HotelReviewParamDto) {
    return await this.hotelReviewService.findOneHotelReview(param);
  }

  @Patch('/:id/hotel/:hotel_id')
  async updateHotelReview(
    @Param() param: HotelReviewParamDto,
    @Body() body: UpdateHotelReviewBodyDto,
    @Token() token: TokenPayload,
  ) {
    return await this.hotelReviewService.updateHotelReview(
      param,
      body,
      token.id,
    );
  }

  @Delete('/:id/hotel/:hotel_id')
  async deleteHotelReview(@Param() param: HotelReviewParamDto) {
    return await this.hotelReviewService.deleteHotelReview(param);
  }
}
