import { IsOptional, IsString } from 'class-validator';
import { AxiosRequestConfig } from 'axios';

export class AxiosConfig implements AxiosRequestConfig {
  @IsString()
  public readonly baseURL: string = '';

  @IsOptional()
  @IsString()
  public readonly url: string;

  @IsOptional()
  @IsString()
  public readonly method: string;
}

export class HttpConfig {
  readonly [K: string]: AxiosConfig;
}
