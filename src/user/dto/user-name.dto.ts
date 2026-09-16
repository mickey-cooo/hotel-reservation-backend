import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserNameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  th: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  en: string;
}
