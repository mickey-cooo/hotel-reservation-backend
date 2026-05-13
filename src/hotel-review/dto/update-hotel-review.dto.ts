import { PartialType } from '@nestjs/swagger';
import { CreateHotelReviewDto } from './create-hotel-review.dto';

export class UpdateHotelReviewDto extends PartialType(CreateHotelReviewDto) {}
