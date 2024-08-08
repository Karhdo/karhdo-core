import { SetMetadata } from '@karhdo/nestjs-core';

import { CACHE_KEY_METADATA } from '../cache.constants';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
