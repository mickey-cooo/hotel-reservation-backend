import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subDistrict: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  detail: string;
}
