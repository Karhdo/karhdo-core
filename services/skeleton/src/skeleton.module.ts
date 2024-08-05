import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';

import { Module } from '@karhdo/nestjs-core';

import { services } from './services';
import { controllers } from './controllers';
import { repositories } from './repositories';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      url: 'redis://localhost:6379',
    }),
  ],
  controllers,
  providers: [...services, ...repositories],
})
export class SkeletonModule {}
