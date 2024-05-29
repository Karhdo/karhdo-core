import { Module, DynamicModule, Global } from '@karhdo/nestjs-core';

import axiosRetry from 'axios-retry';
import Axios, { AxiosInstance } from 'axios';

import { HttpService } from './http.service';
import { HttpModuleOption } from './http.interface';
import { NESTJS_AXIOS_INSTANCE } from './http.constant';

@Global()
@Module({})
export class HttpModule {
  private static createAxiosInstance(options?: HttpModuleOption): AxiosInstance {
    const axiosInstance = Axios.create(options);

    axiosRetry(axiosInstance, options);

    return axiosInstance;
  }

  public static forRootAsync(options?: HttpModuleOption): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: NESTJS_AXIOS_INSTANCE,
          useValue: this.createAxiosInstance(options),
        },
        HttpService,
      ],
      exports: [HttpService],
    };
  }
}
