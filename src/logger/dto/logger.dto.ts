import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LogLevel } from '../../enum/common.status';
import { Type } from 'class-transformer';

class PayloadRequest {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  stack: string;
}

export class LoggerPayloadDto {
  @ApiProperty()
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty()
  @IsString()
  service: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  event?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @ApiProperty()
  @Type(() => PayloadRequest)
  @ValidateNested()
  payload: PayloadRequest;
}
