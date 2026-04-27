import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max, ValidateNested } from 'class-validator';
import { AddressDto } from './address.dto';
import { Type } from 'class-transformer';

export interface UserNameDto {
  th: string;
  en: string;
}

export class CreateBodyUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: UserNameDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: UserNameDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(10)
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  addressDetail: AddressDto;
}
