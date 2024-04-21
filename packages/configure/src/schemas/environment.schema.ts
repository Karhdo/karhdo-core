import { Type, Expose } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { AppConfig } from './app.schema';

export class EnvironmentConfig {
  @Type(() => AppConfig)
  @Expose()
  @ValidateNested()
  public readonly app: AppConfig;

  constructor(config?: Partial<EnvironmentConfig>) {
    Object.assign(this, config);
  }
}
