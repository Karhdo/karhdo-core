import { AppModule as NestJSApp } from "@ynm/nestjs-app";

import { SkeletonModule } from "./skeleton.module";

void NestJSApp.bootstrap({
  imports: [SkeletonModule],
});
