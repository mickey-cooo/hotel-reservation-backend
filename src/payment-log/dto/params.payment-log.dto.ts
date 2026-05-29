import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ListParamsPaymentLogDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}

export class ParamPaymentLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
