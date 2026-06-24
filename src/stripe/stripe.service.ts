import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type Stripe from 'stripe';
import { Repository } from 'typeorm';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
    @InjectRepository(PaymentTransactionEntity)
    private readonly paymentTransactionRepository: Repository<PaymentTransactionEntity>,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: dto.currency,
            product_data: { name: dto.productName },
            unit_amount: dto.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: dto.orderId },
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
    });

    await this.paymentTransactionRepository.insert({
      orderId: dto.orderId,
      stripeSessionId: session.id,
      amount: dto.amount,
      currency: dto.currency,
      status: PaymentTransactionStatus.PENDING,
    });

    this.logger.log(
      `Checkout session created: ${session.id} for order: ${dto.orderId}`,
    );

    return { sessionId: session.id, url: session.url };
  }

  async refundPaymentIntent(body: { paymentIntentId: string }) {
    return this.stripe.refunds.create({ payment_intent: body.paymentIntentId });
  }
}
