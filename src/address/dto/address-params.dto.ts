import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddressParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class AddressBodyParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
