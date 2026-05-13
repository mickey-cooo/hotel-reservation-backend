import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HotelReviewService } from './hotel-review.service';
import { CreateHotelReviewDto } from './dto/create-hotel-review.dto';
import { UpdateHotelReviewDto } from './dto/update-hotel-review.dto';

@Controller('hotel-review')
export class HotelReviewController {
  constructor(private readonly hotelReviewService: HotelReviewService) {}

  @Post()
  create(@Body() createHotelReviewDto: CreateHotelReviewDto) {
    return this.hotelReviewService.create(createHotelReviewDto);
  }

  @Get()
  findAll() {
    return this.hotelReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelReviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelReviewDto: UpdateHotelReviewDto) {
    return this.hotelReviewService.update(+id, updateHotelReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelReviewService.remove(+id);
  }
}
