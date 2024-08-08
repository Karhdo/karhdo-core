import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

import { RedisConfig } from './redis.schema';

export class CacheConfig {
  @IsOptional()
  @IsNumber()
  public readonly ttl?: number = 5000;

  @IsOptional()
  @IsNumber()
  public readonly max?: number = 100;

  @IsOptional()
  @IsBoolean()
  public readonly enable: boolean = true;

  @IsOptional()
  public readonly redis: RedisConfig;
}
