import { IsEnum, IsIn, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

import { AppEnvironment } from '@karhdo/nestjs-core';

type DATABASE_TYPE =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'db2'
  | 'snowflake'
  | 'oracle'
  | 'mongo'
  | 'solr';

type ANOTHER_DATABASE_TYPE = 'mongo' | 'solr';

export type SQL_DATABASE_TYPE = Exclude<DATABASE_TYPE, ANOTHER_DATABASE_TYPE>;

export class Database {
  @IsOptional()
  @IsEnum(AppEnvironment)
  public readonly NODE_ENV: AppEnvironment;

  @IsOptional()
  @IsIn(['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql', 'db2', 'snowflake', 'oracle', 'mongo', 'solr'])
  public readonly type: SQL_DATABASE_TYPE | ANOTHER_DATABASE_TYPE = 'postgres';

  @IsString()
  public readonly host: string = '127.0.0.1';

  @IsNumber()
  public readonly port: number = 5432;

  @IsString()
  public readonly username: string = 'postgres';

  @IsString()
  public readonly password: string = 'postgres';

  @IsString()
  public readonly database: string = 'app';

  @IsOptional()
  @IsBoolean()
  public readonly logging: boolean = true;

  @IsOptional()
  @IsBoolean()
  public readonly synchronize: boolean = false;

  @IsOptional()
  @IsBoolean()
  public readonly autoLoadModels: boolean = false;
}

export class DatabaseConfig {
  readonly [K: string]: Database;
}
