import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoleParamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class BodyRoleIdsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
