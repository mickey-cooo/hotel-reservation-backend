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

export class GeographyBodyParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  geo_ids: string[];
}

export class ProvinceParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class DistrictParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  geo_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  province_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  district_id: string;
}

export class AmphurParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  province_id: string;
}
