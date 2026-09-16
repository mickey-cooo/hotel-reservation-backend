import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class HotelRoomQueryParamsDto {
  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  hotel_id?: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  guestNumber?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  roomCount?: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  amenities?: string;
}
