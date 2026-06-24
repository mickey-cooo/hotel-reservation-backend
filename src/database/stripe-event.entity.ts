import { Column, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('stripe_event')
export class StripeEventEntity extends TemplateEntity {
  @Column({ type: 'varchar', unique: true })
  stripeEventId: string;

  @Column({ type: 'varchar' })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: object;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
