import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type Stripe from 'stripe';
import { DataSource, Repository } from 'typeorm';
import { BookingEntity } from '../database/booking.entity';
import { OrderEntity } from '../database/order.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
    private readonly dataSource: DataSource,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async createCheckoutSession(body: CreateCheckoutSessionDto) {
    const booking = await this.bookingRepository
      .createQueryBuilder('b')
      .where('b.bookingCode = :bookingCode', { bookingCode: body.bookingCode })
      .getOne();

    if (!booking) {
      throw new NotFoundException(`Booking ${body.bookingCode} not found`);
    }

    if (booking.status !== HotelBookingStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Booking status is ${booking.status}, expected AWAITING_PAYMENT`,
      );
    }

    const existingOrder = await this.orderRepository
      .createQueryBuilder('o')
      .innerJoin('o.booking', 'b')
      .where('b.id = :bookingId', { bookingId: booking.id })
      .getOne();

    if (existingOrder) {
      throw new BadRequestException(
        `Order already exists for booking ${body.bookingCode}`,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: body.currency,
            product_data: { name: body.productName },
            unit_amount: body.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: body.orderId, bookingId: booking.id },
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    });

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .insert()
        .into(OrderEntity)
        .values({
          id: body.orderId,
          booking: { id: booking.id },
          status: PaymentTransactionStatus.PENDING,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .insert()
        .into(PaymentTransactionEntity)
        .values({
          orderId: body.orderId,
          stripeSessionId: session.id,
          amount: body.amount,
          currency: body.currency,
          status: PaymentTransactionStatus.PENDING,
        })
        .execute();
    });

    this.logger.log(
      `Checkout session created: ${session.id} for order: ${body.orderId}, booking: ${body.bookingCode}`,
    );

    return { sessionId: session.id, url: session.url };
  }

  async refundPaymentIntent(body: { paymentIntentId: string }) {
    return this.stripe.refunds.create({ payment_intent: body.paymentIntentId });
  }
}
