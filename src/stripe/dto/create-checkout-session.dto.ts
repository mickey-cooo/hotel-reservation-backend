import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ example: 'order-uuid-here', description: 'Order ID to attach to this payment' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 50000, description: 'Amount in smallest currency unit (e.g. satang for THB, cents for USD)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'thb', description: 'ISO 4217 currency code (lowercase)' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'Deluxe Room - 3 nights', description: 'Product name shown on Stripe checkout' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'https://yourapp.com/payment/success' })
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ example: 'https://yourapp.com/payment/cancel' })
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
