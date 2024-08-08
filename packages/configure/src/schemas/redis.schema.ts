import { IsNumber, IsString, IsOptional } from 'class-validator';

export class RedisConfig {
  @IsOptional()
  @IsString()
  public readonly host?: string = 'localhost';

  @IsOptional()
  @IsNumber()
  public readonly port?: number = 6379;

  @IsOptional()
  @IsString()
  public readonly db?: string = '';

  @IsOptional()
  @IsString()
  public readonly username?: string = '';

  @IsOptional()
  @IsString()
  public readonly password?: string = '';
}
