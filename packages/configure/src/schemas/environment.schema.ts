import { Type, Expose, plainToInstance } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { NestedObjectTransform } from '@karhdo/nestjs-core';

import { AppConfig } from './app.schema';
import { RabbitMQConfig } from './rabbitmq.schema';
import { Database, DatabaseConfig } from './database.schema';

export class EnvironmentConfig {
  @Type(() => AppConfig)
  @Expose()
  @ValidateNested()
  public readonly app: AppConfig;

  constructor(config?: Partial<EnvironmentConfig>) {
    Object.assign(this, config);
  }

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
