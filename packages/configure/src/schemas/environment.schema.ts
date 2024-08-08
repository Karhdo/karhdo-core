import { Type, Expose, plainToInstance } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { NestedObjectTransform, NestedObjectValidator } from '@karhdo/nestjs-core';

import { AppConfig } from './app.schema';
import { CacheConfig } from './cache.schema';
import { RabbitMQConfig } from './rabbitmq.schema';
import { AxiosConfig, HttpConfig } from './http.schema';
import { Database, DatabaseConfig } from './database.schema';

export class EnvironmentConfig {
  constructor(config?: Partial<EnvironmentConfig>) {
    Object.assign(this, config);
  }

  @Type(() => AppConfig)
  @Expose()
  @ValidateNested()
  public readonly app: AppConfig;

  @Type(() => CacheConfig)
  @Expose()
  @ValidateNested()
  public readonly cache: CacheConfig;

  @IsOptional()
  @NestedObjectValidator(AxiosConfig)
  @NestedObjectTransform(AxiosConfig, ({ value }) => {
    return plainToInstance(HttpConfig, value);
  })
  public readonly http: HttpConfig;

  @Type(() => RabbitMQConfig)
  @Expose()
  @ValidateNested()
  public readonly rabbitmq: RabbitMQConfig;

  @IsOptional()
  @NestedObjectTransform(Database, ({ value }) => {
    return plainToInstance(DatabaseConfig, value);
  })
  public readonly database: DatabaseConfig;
}
