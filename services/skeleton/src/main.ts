import { AppModule as NestJSApp } from '@karhdo/nestjs-app';

import { SkeletonModule } from './skeleton.module';

void NestJSApp.bootstrap({
  imports: [SkeletonModule],
});
