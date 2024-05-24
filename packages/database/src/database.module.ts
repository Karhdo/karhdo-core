import { LoggerModule, LoggerService } from '@karhdo/nestjs-logger';
import { ConfigModule, Database, DatabaseConfig, SQL_DATABASE_TYPE } from '@karhdo/nestjs-config';
import { Module, DynamicModule, Provider } from '@karhdo/nestjs-core';

import { get } from 'lodash';
import { Sequelize } from 'sequelize-typescript';
import { defer, lastValueFrom, retryWhen, scan, delay } from 'rxjs';

import { DATABASE_FACTORY } from './database.enum';
import { DatabaseModuleOption } from './database.interface';
import { RETRY_ATTEMPT, RETRY_DELAY, OPERATORS_ALIASES } from './database.constant';
import { getDatabaseModuleOptionToken, getConnectionToken } from './database.utils';

@Module({})
export class DatabaseModule {
  public static forRootAsync(options: DatabaseModuleOption): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: DatabaseModule,
      imports: [ConfigModule, LoggerModule],
      providers,
      exports: providers,
      global: true,
    };
  }

  private static createProviders(options: DatabaseModuleOption): Provider[] {
    const { name: connectionName, retryAttempts = RETRY_ATTEMPT, retryDelay = RETRY_DELAY } = options;

    const databaseModuleOptionToken = getDatabaseModuleOptionToken(connectionName);

    return [
      {
        inject: [DatabaseConfig],
        provide: databaseModuleOptionToken,
        useFactory: (databaseConfig: DatabaseConfig) => get(databaseConfig, connectionName),
      },
      {
        inject: [databaseModuleOptionToken, LoggerModule],
        provide: getConnectionToken(connectionName),
        useFactory: async (database: Database, logger: LoggerService) => {
          const connectionString = this.getConnectionString(database);

          return lastValueFrom(
            defer(async () => {
              const connection = await this.createConnectionFactory(database);

              logger.info(`Connected successfully to database ${connectionString}`);

              return connection;
            }).pipe(
              retryWhen((e) =>
                e.pipe(
                  scan((errorCount, error: Error) => {
                    logger.error(
                      `Unable to connect to the database. Retrying (${errorCount + 1})...`,
                      connectionString,
                    );

                    if (errorCount + 1 >= retryAttempts) {
                      throw error;
                    }

                    return errorCount + 1;
                  }, 0),

                  delay(retryDelay),
                ),
              ),
            ),
          );
        },
      },
    ];
  }

  private static async createSQLConnection(database: Database): Promise<Sequelize> {
    const { type, ...config } = database;

    const sequelize = new Sequelize({
      ...config,
      dialect: type as SQL_DATABASE_TYPE,
      operatorsAliases: OPERATORS_ALIASES,
      query: {
        raw: true,
      },
    });

    await sequelize.authenticate();

    return sequelize;
  }

  private static async createConnectionFactory(database: Database): Promise<Sequelize> {
    const { type } = database;

    switch (type) {
      case DATABASE_FACTORY.MONGO:
        return this.createSQLConnection(database);
      default:
        return this.createSQLConnection(database);
    }
  }

  private static getConnectionString(options: { type: string; host: string; port: number; database: string }): string {
    const { type, host, port, database } = options;

    return `${type}://${host}:${port}/${database}`;
  }
}
