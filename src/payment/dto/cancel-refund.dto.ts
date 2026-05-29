import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CancelRefundBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
