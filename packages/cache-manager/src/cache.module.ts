import { CacheConfig } from '@karhdo/nestjs-config';
import { DynamicModule, Module } from '@karhdo/nestjs-core';

import type { Cache as CoreCache } from 'cache-manager';

import { CACHE_MANAGER, CACHE_MODULE_OPTIONS } from './cache.constants';
import { createCacheManager } from './cache.providers';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class Cache {}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Cache extends CoreCache {}

@Module({})
export class CacheModule {
  static registerAsync(): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      providers: [
        {
          provide: CACHE_MODULE_OPTIONS,
          inject: [CacheConfig],
          useFactory: (cacheConfig: CacheConfig) => cacheConfig,
        },
        createCacheManager(),
        {
          provide: Cache,
          useExisting: CACHE_MANAGER,
        },
      ],
      exports: [CACHE_MANAGER],
    };
  }
}
