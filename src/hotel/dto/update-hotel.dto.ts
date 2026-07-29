import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateHotelRoomBodyDto } from '../../hotel-room/dto/update-hotel-room.dto';
import { AddressDto } from '../../user/dto/address.dto';
import { HotelCategory } from '../../enum/hotel-category.status';

export class UpdateHotelRoomInHotelDto extends UpdateHotelRoomBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roomId: string;
}

export class UpdateHotelBodyDto {
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
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  website: string;

  @ApiProperty({ enum: HotelCategory, required: false })
  @IsOptional()
  @IsEnum(HotelCategory)
  category?: HotelCategory;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  addressDetail: AddressDto;

  @ApiProperty({ type: [UpdateHotelRoomInHotelDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateHotelRoomInHotelDto)
  rooms: UpdateHotelRoomInHotelDto[];
}
