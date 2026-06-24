import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    });
  },
};
