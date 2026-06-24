import { ApiProperty } from '@nestjs/swagger';

export class HotelReviewInterface {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  isAnonymous: boolean;

  @ApiProperty()
  isReply: boolean;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;
}

export class ReplyHotelReviewInterface {
  @ApiProperty()
  isReply: boolean;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;
}
