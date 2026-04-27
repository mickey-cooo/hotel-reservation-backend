import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ParamUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class BodyUserIdsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
