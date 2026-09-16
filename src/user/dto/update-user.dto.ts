import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from './address.dto';
import { UserNameDto } from './user-name.dto';
import { Type } from 'class-transformer';

export class UpdateBodyUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserNameDto)
  firstName: UserNameDto;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UserNameDto)
  lastName: UserNameDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  addressDetail: AddressDto;
}
