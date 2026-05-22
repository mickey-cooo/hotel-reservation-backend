import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../enum/common.status';

export class UpdateHotelBookingBodyDto {
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
  @IsNumber()
  guestCount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  stayPeriod: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  checkInDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  checkOutDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
