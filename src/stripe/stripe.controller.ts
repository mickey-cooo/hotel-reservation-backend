import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Stripe Checkout Session' })
  @ApiCreatedResponse({ description: 'Returns Stripe session ID and redirect URL' })
  createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    return this.stripeService.createCheckoutSession(dto);
  }
}
