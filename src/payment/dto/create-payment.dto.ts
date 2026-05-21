import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_id?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardHolderName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardExpiryMonth: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardExpiryYear: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardCvv: string;
}
