import { LoggerModule, LoggerService } from '@karhdo/nestjs-logger';
import { Module, DynamicModule, Provider } from '@karhdo/nestjs-core';
import { ConfigModule, Sequelize, SequelizeConfig, SQL_DATABASE_TYPE } from '@karhdo/nestjs-config';

import { get } from 'lodash';
import { defer, lastValueFrom, retryWhen, scan, delay } from 'rxjs';
import { Sequelize as SequelizeTypescript } from 'sequelize-typescript';

import { SequelizeModuleOption } from './sequelize.interface';
import { RETRY_ATTEMPT, RETRY_DELAY, OPERATORS_ALIASES, DATABASE_MODULE_OPTION } from './sequelize.constant';

@Module({})
export class SequelizeModule {
  public static forRootAsync(options: SequelizeModuleOption): DynamicModule {
    const providers = this.createProviders(options);

    return {
      module: SequelizeModule,
      imports: [ConfigModule, LoggerModule],
      providers,
      exports: providers,
      global: true,
    };
  }

  private static createProviders(options: SequelizeModuleOption): Provider[] {
    const { name: connectionName, retryAttempts = RETRY_ATTEMPT, retryDelay = RETRY_DELAY } = options;

    const sequelizeModuleOptionToken = `${connectionName}_${DATABASE_MODULE_OPTION}`;

    return [
      {
        inject: [SequelizeConfig],
        provide: sequelizeModuleOptionToken,
        useFactory: (sequelizeConfig: SequelizeConfig) => get(sequelizeConfig, connectionName),
      },
      {
        inject: [sequelizeModuleOptionToken, LoggerService],
        provide: `${connectionName}Connection`,
        useFactory: async (sequelize: Sequelize, logger: LoggerService) => {
          const connectionString = this.getConnectionString(sequelize);

          return lastValueFrom(
            defer(async () => {
              const connection = await this.createSQLConnection(sequelize);

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

  private static async createSQLConnection(sequelize: Sequelize): Promise<SequelizeTypescript> {
    const { type, ...config } = sequelize;

    const sequelizeTypescript = new SequelizeTypescript({
      ...config,
      dialect: type as SQL_DATABASE_TYPE,
      operatorsAliases: OPERATORS_ALIASES,
      query: {
        raw: true,
      },
    });

    await sequelizeTypescript.authenticate();

    return sequelizeTypescript;
  }

  private static getConnectionString(options: { type: string; host: string; port: number; database: string }): string {
    const { type, host, port, database } = options;

    return `${type}://${host}:${port}/${database}`;
  }
}
