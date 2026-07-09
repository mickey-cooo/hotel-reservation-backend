import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
