import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: (configService: ConfigService) => {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    return new Stripe(secretKey!, {
      apiVersion: '2026-05-27.dahlia',
    });
  },
  inject: [ConfigService],
};
