import { PartialType } from '@nestjs/swagger';
import { CreateStripeEventDto } from './create-stripe-event.dto';

export class UpdateStripeEventDto extends PartialType(CreateStripeEventDto) {}
