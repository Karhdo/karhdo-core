import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CacheConfig {
  @IsOptional()
  @IsString()
  public readonly host?: string = 'localhost';

  @IsOptional()
  @IsNumber()
  public readonly port?: number = 6379;

  @IsOptional()
  @IsNumber()
  public readonly ttl?: number = 10;

  @IsOptional()
  @IsString()
  public readonly username?: string = '';

  @IsOptional()
  @IsString()
  public readonly password?: string = '';
}
