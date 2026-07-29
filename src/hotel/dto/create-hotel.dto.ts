import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from '../../user/dto/address.dto';
import { CreateHotelRoomBodyDto } from '../../hotel-room/dto/create-hotel-room.dto';
import { HotelCategory } from '../../enum/hotel-category.status';

export class CreateHotelBodyDto {
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
  @IsUrl()
  image?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

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

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHotelRoomBodyDto)
  rooms: CreateHotelRoomBodyDto[];
  //   @ApiProperty()
  //   @IsNotEmpty()
  //   @IsArray()
  //   @ValidateNested({ each: true })
  //   @Type(() => CreateHotelReviewDto)
  //   reviews: CreateHotelReviewDto[];
}
