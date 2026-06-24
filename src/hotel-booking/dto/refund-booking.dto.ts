import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefundBookingBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
