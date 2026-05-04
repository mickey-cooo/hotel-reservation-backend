import { ApiProperty } from '@nestjs/swagger';
import {
  HotelRoomAmenities,
  HotelRoomStatus,
  HotelRoomType,
  RoomPolicyType,
} from '../../enum/hotel-room.status';

export class HotelRoomDataInterface {
  @ApiProperty()
  id?: string;

  @ApiProperty()
  hotel_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  status: HotelRoomStatus;

  @ApiProperty()
  policies: RoomPolicyType[];

  @ApiProperty()
  amenities: HotelRoomAmenities[];

  @ApiProperty()
  type: HotelRoomType;
}
