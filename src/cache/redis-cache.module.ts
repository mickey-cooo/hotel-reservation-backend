import { CacheModule } from '@nestjs/cache-manager';
import type { CacheOptions } from '@nestjs/cache-manager';
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import Keyv from 'keyv';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): CacheOptions => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          return { ttl: 0 };
        }
        return {
          stores: [new Keyv<unknown>({ store: new KeyvRedis(redisUrl) })],
          ttl: 0,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
