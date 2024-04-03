import { Module, INestApplication } from '@karhdo/nestjs-core';

import AppOptions from './app.interface';

@Module({})
export class AppModule {
  private static options: AppOptions;

  private static instance: INestApplication;
}
