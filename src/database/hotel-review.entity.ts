import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';
import { HotelEntity } from './hotel.entity';

@Entity('hotel_review')
export class HotelReviewEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  description: string;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ type: 'boolean', nullable: true })
  isAnonymous: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  reviewDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  reply: string;

  @Column({ type: 'boolean', nullable: true })
  isReply: boolean;

  @Column({ type: 'varchar', nullable: true })
  replyBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  replyDate: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  @ManyToOne(() => HotelEntity, (hotel) => hotel.reviews)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;
}
