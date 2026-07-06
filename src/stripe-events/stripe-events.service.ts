import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type Stripe from 'stripe';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BookingEntity } from '../database/booking.entity';
import { OrderEntity } from '../database/order.entity';
import { PaymentTransactionEntity } from '../database/payment-transaction.entity';
import { StripeEventEntity } from '../database/stripe-event.entity';
import { HotelBookingStatus } from '../enum/hotel.booking.status';
import { PaymentStatus } from '../enum/common.status';
import { PaymentTransactionStatus } from '../enum/payment-transaction.status';
import { MailService } from '../mail/mail.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StripeEventsService {
  private readonly logger = new Logger(StripeEventsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
    @InjectRepository(StripeEventEntity)
    private readonly stripeEventRepository: Repository<StripeEventEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(PaymentTransactionEntity)
    private readonly paymentTransactionRepository: Repository<PaymentTransactionEntity>,
    private readonly mailService: MailService,
    private readonly loggerService: LoggerService,
  ) {}

  verifyWebhookSignature(rawBody: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    const duplicate = await this.stripeEventRepository.findOneBy({
      stripeEventId: event.id,
    });

    if (duplicate) {
      this.logger.log(`Duplicate event ignored: ${event.id}`);
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const stripeEvent = queryRunner.manager.create(StripeEventEntity, {
        stripeEventId: event.id,
        eventType: event.type,
        payload: event as unknown as object,
        processed: false,
        processedAt: null,
      });
      await queryRunner.manager.save(StripeEventEntity, stripeEvent);

      if (event.type === 'checkout.session.completed') {
        await this.handleCheckoutSessionCompleted(queryRunner.manager, event);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Event processed: ${event.id} (${event.type})`);

      if (event.type === 'checkout.session.completed') {
        await this.sendBookingConfirmationMail(event);
      }
    } catch (error) {
      this.loggerService.error({
        service: StripeEventsService.name,
        event: 'handleEvent',
        payload: { message: error.message, stack: error.stack },
      });
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to process event ${event.id}`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleCheckoutSessionCompleted(
    manager: EntityManager,
    event: Stripe.Event,
  ): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const bookingId = session.metadata?.bookingId;

    if (!orderId || !bookingId) {
      throw new ConflictException(
        `Missing orderId or bookingId in metadata for session: ${session.id}`,
      );
    }

    const now = new Date();
    const paymentIntentId = session.payment_intent;

    await manager
      .createQueryBuilder()
      .update(PaymentTransactionEntity)
      .set({
        status: PaymentTransactionStatus.PAID,
        paidAt: now,
        paymentIntentId,
      })
      .where('stripeSessionId = :sessionId', { sessionId: session.id })
      .execute();

    await manager
      .createQueryBuilder()
      .update(OrderEntity)
      .set({ status: PaymentTransactionStatus.PAID, paidAt: now })
      .where('id = :orderId', { orderId })
      .execute();

    await manager
      .createQueryBuilder()
      .update(BookingEntity)
      .set({
        paymentStatus: PaymentStatus.PAID,
        status: HotelBookingStatus.CONFIRMED,
        paymentDate: now,
      })
      .where('id = :bookingId', { bookingId })
      .execute();

    await manager
      .createQueryBuilder()
      .update(StripeEventEntity)
      .set({ processed: true, processedAt: now })
      .where('stripeEventId = :stripeEventId', { stripeEventId: event.id })
      .execute();
  }

  private async sendBookingConfirmationMail(
    event: Stripe.Event,
  ): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) return;

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['user'],
    });

    if (!booking?.user?.email) {
      this.logger.warn(`No user email for booking ${bookingId}, skip mail`);
      return;
    }

    try {
      await this.mailService.sendHotelBookingMail(
        booking.user.email,
        '',
        booking,
      );
    } catch (error) {
      this.loggerService.error({
        service: StripeEventsService.name,
        event: 'sendBookingConfirmationMail',
        payload: { message: error.message, stack: error.stack },
      });
      this.logger.error(
        `Failed to send booking confirmation for ${bookingId}`,
        error,
      );
    }
  }
}
