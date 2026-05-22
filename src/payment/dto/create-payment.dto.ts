import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreatePaymentBodyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Max(15)
  @Min(15)
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
  @Max(3)
  @Min(3)
  cardCvv: string;
}
