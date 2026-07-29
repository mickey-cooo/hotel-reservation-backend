import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '../../pagination/dto/pagination.dto';
import { HotelCategory } from '../../enum/hotel-category.status';

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
  @IsNumber()
  price?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rating?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiProperty({ enum: HotelCategory, required: false })
  @IsOptional()
  @IsEnum(HotelCategory)
  category?: HotelCategory;
}
