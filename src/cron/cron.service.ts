import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJobService } from './cron.job.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly cronJobService: CronJobService) {}

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'handleBookingRoomExpiry',
    timeZone: 'Asia/Bangkok',
  })
  async handleBookingRoomExpiry() {
    this.logger.log('handleBookingRoomExpiry');
    return await this.cronJobService.checkExpirePayment();
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM, {
    name: 'refundPayment',
    timeZone: 'Asia/Bangkok',
  })
  async refundPayment(transactionId: string) {
    this.logger.log('refundPayment');
    return await this.cronJobService.refundPayment(transactionId);
  }
}
