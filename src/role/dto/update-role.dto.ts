import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBodyRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  priority: number;
}
