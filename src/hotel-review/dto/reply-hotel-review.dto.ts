import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReplyHotelReviewBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  review_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reply: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  isReply: boolean;
}
