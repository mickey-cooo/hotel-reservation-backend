import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class HotelParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotel_id: string;
}

export class HotelRoomParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class HotelRoomBodyParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
