import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HotelReviewParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;
}

export class HotelReviewParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;
}
