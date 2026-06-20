import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HotelBookingParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingCode: string;
}

export class HotelBookingParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  room_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  user_id: string;
}

export class AvailableHotelBookingParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  room_id: string;
}
