import { TemplateEntity } from './template.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import {
  HotelRoomAmenities,
  HotelRoomStatus,
  HotelRoomType,
  RoomPolicyType,
} from '../enum/hotel-room.status';
import { HotelEntity } from './hotel.entity';

@Entity('hotel_room')
export class HotelRoomEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: HotelRoomStatus,
    default: HotelRoomStatus.UNAVAILABLE,
    nullable: true,
  })
  status: HotelRoomStatus;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'integer', nullable: true })
  price: number;

  @Column({ type: 'integer', nullable: true })
  capacity: number;

  @Column({ type: 'enum', enum: RoomPolicyType, nullable: true, array: true })
  policies: RoomPolicyType[];

  @Column({
    type: 'enum',
    enum: HotelRoomAmenities,
    nullable: true,
    array: true,
  })
  amenities: HotelRoomAmenities[];

  @Column({ type: 'enum', enum: HotelRoomType, nullable: true })
  type: HotelRoomType;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => HotelEntity, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel?: HotelEntity;
}
