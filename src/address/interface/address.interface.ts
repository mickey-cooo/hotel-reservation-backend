import { ApiProperty } from '@nestjs/swagger';

export class AddressInterface {
  @ApiProperty()
  id: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  subDistrict: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  detail?: string;
}

export class GeographyInterface {
  @ApiProperty()
  geo_id: number;

  @ApiProperty()
  geo_name: string;
}

export class ProvinceInterface {
  @ApiProperty()
  province_id: number;

  @ApiProperty()
  province_code: string;

  @ApiProperty()
  province_name: string;

  @ApiProperty()
  geography: GeographyInterface;
}

export class DistrictInterface {
  @ApiProperty()
  district_id: number;

  @ApiProperty()
  district_code: string;

  @ApiProperty()
  district_name: string;

  @ApiProperty()
  geography: GeographyInterface;

  @ApiProperty()
  province: ProvinceInterface;
}

export class AmphurInterface {
  @ApiProperty()
  amphur_id: number;

  @ApiProperty()
  amphur_code: string;

  @ApiProperty()
  amphur_name: string;

  @ApiProperty()
  postcode: string;

  @ApiProperty()
  geography: GeographyInterface;

  @ApiProperty()
  province: ProvinceInterface;
}
