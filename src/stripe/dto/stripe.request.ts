import { ApiProperty } from '@nestjs/swagger';
import { StripeEnum } from '../../enum/payment.status';

export class LineItemDto {
  @ApiProperty()
  price_data: {
    currency: string;
    product_data: {
      name: string;
    };
    unit_amount: number;
  };
  @ApiProperty()
  quantity: number;
}

export class metaDataDto {
  @ApiProperty()
  booking_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  hotel_id: string;

  @ApiProperty()
  room_id: string;

  @ApiProperty()
  check_in_date: string;

  @ApiProperty()
  check_out_date: string;

  @ApiProperty()
  total_amount: number;
}

export class PaymentIntentDataDto {
  @ApiProperty()
  setup_future_usage: string;

  @ApiProperty()
  metadata: metaDataDto;
}

export class StripeRequestBodyDto {
  @ApiProperty()
  mode: StripeEnum;

  @ApiProperty()
  line_items: LineItemDto[];

  @ApiProperty()
  success_url: string;

  @ApiProperty()
  cancel_url: string;

  @ApiProperty()
  payment_intent_data: PaymentIntentDataDto;
}
