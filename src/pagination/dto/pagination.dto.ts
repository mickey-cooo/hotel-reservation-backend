import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;
}
