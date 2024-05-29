import {
  Module,
  DynamicModule,
  OnApplicationBootstrap,
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
  ExternalContextCreator,
} from '@karhdo/nestjs-core';
import { ConfigModule, RabbitMQConfig } from '@karhdo/nestjs-config';
import { RegistryModule, RegistryService } from '@karhdo/nestjs-registry';

import { groupBy, map, isString } from 'lodash';

import { AmqpConnection } from './connection';
import { AMQPConnectionManager } from './connection-manager';

import { RABBIT_HANDLER } from '../rabbitmq.constant';
import { ConsumerOptions } from '../rabbitmq.interface';

@Module({
  imports: [RegistryModule],
  providers: [RegistryService],
})
export class AmqpModule implements OnApplicationBootstrap {
  private static connectionManager = new AMQPConnectionManager();

  constructor(
    private amqpConnectionManager: AMQPConnectionManager,
    private discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
    private externalContextCreator: ExternalContextCreator,
    private registryService: RegistryService,
    private rabbitMQConfig: RabbitMQConfig,
  ) {}

  public static forRootAsync(): DynamicModule {
    return {
      module: AmqpModule,
      imports: [ConfigModule.forRootAsync(), DiscoveryModule],
      providers: [
        {
          provide: AMQPConnectionManager,
          inject: [RabbitMQConfig],
          useFactory: async (config: RabbitMQConfig) => {
            await this.connectionFactory(config);

            return this.connectionManager;
          },
        },
        {
          provide: AmqpConnection,
          inject: [RabbitMQConfig, AMQPConnectionManager],
          useFactory: async (config: RabbitMQConfig, connectionManager: AMQPConnectionManager) => {
            const { name } = config;

            return connectionManager.getConnection(name);
          },
        },
      ],
      exports: [AMQPConnectionManager, AmqpConnection],
      global: true,
    };
  }

  private static async connectionFactory(config: RabbitMQConfig) {
    const connection = new AmqpConnection(config);

    this.connectionManager.addConnection(connection);

    await connection.init();

    return connection;
  }

  private getConsumerConfig(consumerOptions: ConsumerOptions | string): ConsumerOptions {
    return isString(consumerOptions) ? this.rabbitMQConfig?.consumer[consumerOptions] : consumerOptions;
  }

  public async onApplicationBootstrap() {
    const connections = this.amqpConnectionManager.getConnections();

    for (const connection of connections) {
      const wrappers = this.discoveryService.getProviders();

      for (const wrapper of wrappers) {
        const contextMethods = this.registryService.extractMethodOfClassByMetadataKey<ConsumerOptions>(
          wrapper,
          RABBIT_HANDLER,
        );

        const grouped = groupBy(contextMethods, (contextMethod) => contextMethod.registryMethod.parentClass.name);

        const providerKeys = Object.keys(grouped);

        for (const providerKey of providerKeys) {
          const promises = map(grouped[providerKey], ({ meta, registryMethod }) => {
            const handler = this.externalContextCreator.create(
              registryMethod.parentClass.instance,
              registryMethod.handler,
              registryMethod.methodName,
            );

            const consumerConfig = this.getConsumerConfig(meta);

            return connection.consume(consumerConfig, handler);
          });

          await Promise.all(promises);
        }
      }
    }
  }
}
