import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePaymentBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(15, 15)
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
  @Length(3, 3)
  cardCvv: string;
}
