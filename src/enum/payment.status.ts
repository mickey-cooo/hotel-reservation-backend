export enum CancellableStatus {
  BOOKED = 'booked',
  AWAITING_PAYMENT = 'awaiting_payment',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  CONFIRMED = 'confirmed',
}

export enum StripeEnum {
  PAYMENT = 'payment',
  SETUP = 'setup',
  SUBSCRIPTION = 'subscription',
}
