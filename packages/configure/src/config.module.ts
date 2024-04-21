/* eslint-disable no-console */
import set from 'lodash/set';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import isObject from 'lodash/isObject';
import snakeCase from 'lodash/snakeCase';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

import flat from 'flat';
import { validateSync, ValidatorOptions } from 'class-validator';
import { ClassConstructor, classToPlain, plainToClass } from 'class-transformer';

import { Provider, DynamicModule, ObjectLiteral, forEachDeep } from '@karhdo/nestjs-core';

import { fileLoader } from './loaders';
import { EnvironmentConfig } from './schemas';

import { ConfigModuleOptions } from './config.interface';

export class ConfigModule {
  public static forRoot(options?: ConfigModuleOptions): DynamicModule {
    const configureApp = this.getConfigureApp({});

    return this.getDynamicModule(configureApp, options);
  }

  public static async forRootAsync(options: ConfigModuleOptions = {}): Promise<DynamicModule> {
    const configureApp = await this.getConfigureAppAsync(options);

    return this.getDynamicModule(configureApp, options);
  }

  private static getDynamicModule(configureApp: object, options: ConfigModuleOptions): DynamicModule {
    const {
      isGlobal = true,
      validate = this.validateWithValidator.bind(this),
      validationOptions = {},
      validationSchema = EnvironmentConfig,
    } = options;

    const validatedConfig = validate(configureApp, validationSchema, validationOptions);

    const paths = keys(flat(validatedConfig));

    for (const path of paths) {
      const envKey = snakeCase(path).toUpperCase();

      if (process.env[envKey]) {
        set(validatedConfig, path, process.env[envKey]);
      }
    }

    const providers = this.getProviders(validatedConfig, validationSchema);

    return {
      module: ConfigModule,
      providers,
      global: isGlobal,
      exports: providers,
    };
  }

  private static getConfigureApp(options?: ConfigModuleOptions) {
    const { load } = options;

    let result = {};

    if (Array.isArray(load)) {
      result = reduce(load, (config, fn) => Object.assign(config, fn()), {});
    } else if (isFunction(load)) {
      result = load();
    }

    return result;
  }

  private static async getConfigureAppAsync(options: ConfigModuleOptions = {}) {
    const { load = fileLoader } = options;

    let result = {};

    if (Array.isArray(load)) {
      const multipleLoaderHandler = async (config, fn) => Object.assign(config, await fn());

      result = reduce(load, multipleLoaderHandler, Promise.resolve({}));
    } else if (isFunction(load)) {
      result = load();
    }

    return result;
  }

  private static isClass(func): boolean {
    return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
  }

  private static getProviders(
    validatedConfig: Record<string, any>,
    schemaValidation: ClassConstructor<any>,
  ): Array<Provider> {
    const providers: Array<Provider> = [];

    providers.push({
      provide: schemaValidation,
      useValue: validatedConfig,
    });

    forEachDeep(validatedConfig, (value) => {
      if (isObject(value) && this.isClass(value.constructor)) {
        providers.push({
          provide: value.constructor,
          useValue: value,
        });
      }
    });

    return providers;
  }

  private static getDefaultConfigureApp(configureApp: ObjectLiteral, validationSchema: ClassConstructor<any>) {
    const instance = new validationSchema();

    const plain = classToPlain(instance);

    const result = Object.keys(plain).reduce((defaultConfig, key: string) => {
      if (!defaultConfig[key]) {
        defaultConfig[key] = {};
      }

      return defaultConfig;
    }, configureApp);

    return result;
  }

  private static validateWithValidator(
    configureApp: Record<string, any> = {},
    validationSchema: ClassConstructor<any>,
    validationOptions?: ValidatorOptions,
  ) {
    if (!isPlainObject(configureApp)) {
      throw new Error('Configure application should be object');
    }

    const defaultConfigureApp = this.getDefaultConfigureApp(configureApp, validationSchema);

    const config = plainToClass(validationSchema, defaultConfigureApp, {
      exposeDefaultValues: true,
    });

    const schemaErrors = validateSync(config, {
      forbidUnknownValues: true,
      ...validationOptions,
    });

    if (schemaErrors.length > 0) {
      console.log(schemaErrors);

      throw new Error('Schema validation error');
    }

    return config;
  }
}
