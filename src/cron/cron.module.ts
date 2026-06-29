import { Global, Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronJobService } from './cron.job.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../database/booking.entity';
import { HotelRoomEntity } from '../database/hotel-room.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity, HotelRoomEntity])],
  providers: [CronService, CronJobService],
  exports: [CronService, CronJobService],
})
export class CronModule {}
