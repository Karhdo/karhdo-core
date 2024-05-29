import { AxiosRequestConfig } from 'axios';
import { IAxiosRetryConfig } from 'axios-retry';

export type HttpModuleOption = AxiosRequestConfig & IAxiosRetryConfig;
