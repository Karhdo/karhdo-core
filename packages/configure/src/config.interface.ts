import { ValidatorOptions } from 'class-validator';
import { ClassConstructor } from 'class-transformer';

export interface FileLoaderOptions {}

export interface DotEnvLoaderOptions {
  filePath?: string | Array<string>;
}

export enum FileExtension {
  YML = 'yml',
  JSON = 'json',
  YAML = 'yaml',
}

export type ConfigLoader = () => object;

export interface ConfigModuleOptions {
  isGlobal?: boolean;

  load?: ConfigLoader | Array<ConfigLoader>;

  validationOptions?: ValidatorOptions;

  validationSchema?: ClassConstructor<any>;

  validate?: (config: object) => object;
}
