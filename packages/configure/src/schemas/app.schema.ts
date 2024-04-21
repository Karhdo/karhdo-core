import { IsNumber, IsString, IsOptional } from 'class-validator';

export class AppConfig {
  @IsNumber()
  public readonly port: number = 3080;

  @IsOptional()
  @IsString()
  public readonly api_key?: string = '';
}
