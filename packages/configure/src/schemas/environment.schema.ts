import { Type, Expose, plainToInstance } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';
import { NestedObjectTransform } from '@karhdo/nestjs-core';

import { AppConfig } from './app.schema';
import { Sequelize, SequelizeConfig } from './sequelize.schema';
import { Database, DatabaseConfig } from './database.schema';

export class EnvironmentConfig {
  @Type(() => AppConfig)
  @Expose()
  @ValidateNested()
  public readonly app: AppConfig;

  constructor(config?: Partial<EnvironmentConfig>) {
    Object.assign(this, config);
  }

  @IsOptional()
  @NestedObjectTransform(Database, ({ value }) => {
    return plainToInstance(DatabaseConfig, value);
  })
  public readonly database: DatabaseConfig;

  @IsOptional()
  @NestedObjectTransform(Sequelize, ({ value }) => {
    return plainToInstance(SequelizeConfig, value);
  })
  public readonly sequelize: SequelizeConfig;
}
