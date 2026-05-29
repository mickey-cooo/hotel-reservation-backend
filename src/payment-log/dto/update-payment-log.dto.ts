import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePaymentLogBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  log: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotelRoomId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotelBookingId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
