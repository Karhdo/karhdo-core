import { Provider } from '@karhdo/nestjs-core';
import { CacheConfig } from '@karhdo/nestjs-config';

import { loadPackage } from '@nestjs/common/utils/load-package.util';

import { redisStore } from 'cache-manager-redis-yet';

import { CACHE_MANAGER, CACHE_MODULE_OPTIONS } from './cache.constants';

export function createCacheManager(): Provider {
  return {
    provide: CACHE_MANAGER,
    inject: [CACHE_MODULE_OPTIONS],
    useFactory: async (options: CacheConfig) => {
      const { ttl, max, enable, redis: redisConfig } = options;

      if (!enable) {
        // Return a no-op cache manager if caching is disabled
        return {
          get: async () => null,
          set: async () => {},
          del: async () => {},
        };
      }

      const cacheManager = loadPackage('cache-manager', 'CacheModule', () => require('cache-manager'));

      const cache = redisConfig ? redisStore : 'memory';

      if (!redisConfig) {
        return cacheManager.caching(cache, { max, ttl });
      }

      return cacheManager.caching(cache, {
        max,
        ttl,
        username: redisConfig.username,
        password: redisConfig.password,
        url: `redis://${redisConfig.host}:${redisConfig.port}/${redisConfig.db}`,
      });
    },
  };
}
