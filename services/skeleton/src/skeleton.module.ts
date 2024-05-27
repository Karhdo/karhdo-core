import { Module } from '@karhdo/nestjs-core';
import { DatabaseModule } from '@karhdo/nestjs-database';

import { User } from './models';
import { services } from './services';
import { controllers } from './controllers';
import { repositories } from './repositories';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      name: 'karhdo_postgres',
      entities: [User],
    }),
  ],
  controllers,
  providers: [...services, ...repositories],
})
export class SkeletonModule {}
