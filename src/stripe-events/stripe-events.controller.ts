import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type Stripe from 'stripe';
import { StripeEventsService } from './stripe-events.service';
import { LoggerService } from '../logger/logger.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeEventsController {
  private readonly logger = new Logger(StripeEventsController.name);

  constructor(
    private readonly stripeEventsService: StripeEventsService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook receiver' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    let event: Stripe.Event;
    try {
      event = this.stripeEventsService.verifyWebhookSignature(
        rawBody,
        signature,
      );
    } catch (err) {
      this.loggerService.error({
        service: StripeEventsController.name,
        event: 'handleWebhook',
        payload: { message: err.message, stack: err.stack },
      });
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.stripeEventsService.handleEvent(event);

    return { received: true };
  }
}
