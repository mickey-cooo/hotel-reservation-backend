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
