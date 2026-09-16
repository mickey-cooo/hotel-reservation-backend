import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationQueryDto } from '../../pagination/dto/pagination.dto';
import { HotelCategory } from '../../enum/hotel-category.status';
import { GuestType } from '../../enum/guest.type';

export class GuestDto {
  @ApiProperty({ enum: GuestType })
  @IsNotEmpty()
  @IsEnum(GuestType)
  type: GuestType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  count: number;
}

export class ParamHotelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class BodyHotelIdsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}

export class QueryHotelDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rating?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiProperty({ enum: HotelCategory, required: false })
  @IsOptional()
  @IsEnum(HotelCategory)
  category?: HotelCategory;

  @ApiProperty({ type: [GuestDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guests?: GuestDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rooms?: number;
}
