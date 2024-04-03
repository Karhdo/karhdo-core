import { INestApplication, ModuleMetadata } from '@karhdo/nestjs-core';

export default interface AppOptions extends ModuleMetadata {
  app?: INestApplication;
}
