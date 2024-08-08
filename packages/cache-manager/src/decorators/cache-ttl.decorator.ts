import { ExecutionContext, SetMetadata } from '@karhdo/nestjs-core';

import { CACHE_TTL_METADATA } from '../cache.constants';

type CacheTTLFactory = (ctx: ExecutionContext) => Promise<number> | number;

export const CacheTTL = (ttl: number | CacheTTLFactory) => SetMetadata(CACHE_TTL_METADATA, ttl);
