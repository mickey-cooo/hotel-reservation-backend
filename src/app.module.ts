import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { modules } from './modules/modules';
import { RoleModule } from './role/role.module';
import { HotelModule } from './hotel/hotel.module';
import { HotelRoomModule } from './hotel-room/hotel-room.module';
import { AddressModule } from './address/address.module';
import { HotelReviewModule } from './hotel-review/hotel-review.module';
import { HotelBookingModule } from './hotel-booking/hotel-booking.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentLogModule } from './payment-log/payment-log.module';
import { ChatModule } from './chat/chat.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        // logging: true,
      }),
    }),
    RedisCacheModule,
    MailModule,
    ...modules,
    RoleModule,
    HotelModule,
    HotelRoomModule,
    AddressModule,
    HotelReviewModule,
    HotelBookingModule,
    PaymentModule,
    PaymentLogModule,
    ChatModule,
  ],
})
export class AppModule {}
