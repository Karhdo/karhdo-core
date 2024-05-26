import { Module } from '@karhdo/nestjs-core';
import { DatabaseModule } from '@karhdo/nestjs-database';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      name: 'karhdo_postgres',
      entities: [],
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class SkeletonModule {}
