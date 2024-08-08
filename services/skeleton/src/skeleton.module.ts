import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

import { CacheModule } from '@karhdo/cache-manager';
import { CacheConfig } from '@karhdo/nestjs-config';

import { Module } from '@karhdo/nestjs-core';

import { services } from './services';
import { controllers } from './controllers';
import { repositories } from './repositories';

@Module({
  imports: [
    // CacheModule.registerAsync<RedisClientOptions>({
    //   inject: [CacheConfig],
    //   useFactory: (cacheConfig: CacheConfig) => ({
    //     store: redisStore,
    //     ttl: cacheConfig.ttl,
    //     username: cacheConfig.username,
    //     password: cacheConfig.password,
    //     url: `redis://${cacheConfig.host}:${cacheConfig.port}`,
    //   }),
    // }),
    CacheModule.registerAsync(),
  ],
  controllers,
  providers: [...services, ...repositories],
})
export class SkeletonModule {}
