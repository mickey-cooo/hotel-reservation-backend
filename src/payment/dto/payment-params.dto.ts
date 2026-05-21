import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ParamPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ParamPaymentQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  user_id?: string;
}
