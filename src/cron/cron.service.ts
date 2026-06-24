import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronJobService } from './cron.job.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly cronJobService: CronJobService) {}

  @Cron('0 * * * *', {
    name: 'handleBookingRoomExpiry',
    timeZone: 'Asia/Bangkok',
  })
  async handleBookingRoomExpiry() {
    this.logger.log('handleBookingRoomExpiry');
    return await this.cronJobService.checkExpirePayment();
  }
}
