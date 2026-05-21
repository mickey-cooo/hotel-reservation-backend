import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardHolderName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardExpiryMonth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardExpiryYear?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardCvv?: string;
}
