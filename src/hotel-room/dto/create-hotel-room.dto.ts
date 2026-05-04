import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  HotelRoomAmenities,
  HotelRoomStatus,
  HotelRoomType,
  RoomPolicyType,
} from 'src/enum/hotel-room.status';

export class CreateHotelRoomBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

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
  @IsEnum(HotelRoomStatus)
  status: HotelRoomStatus;

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

export class CreateManyHotelRoomBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHotelRoomBodyDto)
  rooms: CreateHotelRoomBodyDto[];
}
