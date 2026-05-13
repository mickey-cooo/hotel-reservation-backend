import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { HotelRoomType, RoomPolicyType } from '../../enum/hotel-room.status';
import { HotelRoomAmenities } from '../../enum/hotel-room.status';

export class UpdateHotelRoomBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(RoomPolicyType, { each: true })
  policies: RoomPolicyType[];

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(HotelRoomAmenities, { each: true })
  amenities: HotelRoomAmenities[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(HotelRoomType)
  type: HotelRoomType;
}
