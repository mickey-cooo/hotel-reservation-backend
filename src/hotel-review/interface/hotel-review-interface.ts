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
  reviewDate: Date;
  @ApiProperty()
  isReply: boolean;
  @ApiProperty()
  reply: string[];
}
