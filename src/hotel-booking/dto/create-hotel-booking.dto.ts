import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../../enum/common.status';

export class CreateHotelBookingBodyDto {
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
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // transactionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  checkInDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  checkOutDate: Date;
}
