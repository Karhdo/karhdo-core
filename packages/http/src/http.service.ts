import { Injectable, Inject } from '@karhdo/nestjs-core';

import Axios, { AxiosInstance } from 'axios';

import { NESTJS_AXIOS_INSTANCE } from './http.constant';

@Injectable()
export class HttpService {
  public readonly get: typeof Axios.get;
  public readonly post: typeof Axios.post;
  public readonly put: typeof Axios.put;
  public readonly patch: typeof Axios.patch;
  public readonly delete: typeof Axios.delete;
  public readonly request: typeof Axios.request;

  constructor(@Inject(NESTJS_AXIOS_INSTANCE) private readonly instance: AxiosInstance) {
    this.get = this.instance.get;
    this.put = this.instance.put;
    this.post = this.instance.post;
    this.patch = this.instance.patch;
    this.delete = this.instance.delete;
    this.request = this.instance.request;
  }

  get axiosRef(): AxiosInstance {
    return this.instance;
  }
}
