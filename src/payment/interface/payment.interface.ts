import { ApiProperty } from '@nestjs/swagger';
import { CommonStatus } from '../../enum/common.status';

export class PaymentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cardHolderName: string;

  @ApiProperty()
  cardExpiryMonth: string;

  @ApiProperty()
  cardExpiryYear: string;

  @ApiProperty()
  status: CommonStatus;
}
