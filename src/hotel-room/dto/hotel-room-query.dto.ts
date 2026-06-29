import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class HotelRoomQueryParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  hotel_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  checkInDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  checkOutDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  guestNumber?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  roomCount?: number;
}
