import { DynamicModule, Module } from '@nestjs/common';
import { CacheConfig } from '@karhdo/nestjs-config';

import { redisStore } from 'cache-manager-redis-yet';

import type { Cache as CoreCache } from 'cache-manager';
import { CACHE_MANAGER } from './cache.constants';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './cache.module-definition';
import { createCacheManager } from './cache.providers';
// import { CacheModuleAsyncOptions, CacheModuleOptions } from './interfaces/cache-module.interface';

/**
 * This is just the same as the `Cache` interface from `cache-manager` but you can
 * use this as a provider token as well.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class Cache {}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Cache extends CoreCache {}

@Module({
  providers: [
    createCacheManager(),
    {
      provide: Cache,
      useExisting: CACHE_MANAGER,
    },
  ],
  exports: [CACHE_MANAGER, Cache],
})
export class CacheModule extends ConfigurableModuleClass {
  static registerAsync(): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          inject: [CacheConfig],
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: (cacheConfig: CacheConfig) => ({
            store: redisStore,
            ttl: cacheConfig.ttl,
            url: `redis://${cacheConfig.host}:${cacheConfig.port}`,
          }),
        },
        createCacheManager(),
      ],
    };
  }
}
