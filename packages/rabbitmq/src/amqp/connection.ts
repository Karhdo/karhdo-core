/* eslint-disable no-console */
import {
  AmqpConnectionManager as ConnectionManager,
  ChannelWrapper as ChannelManager,
  connect as createConnection,
} from 'amqp-connection-manager';
import { plainToInstance } from 'class-transformer';
import asyncTimedCargo from 'async-timed-cargo';
import { ConfirmChannel, Connection, ConsumeMessage, Options } from 'amqplib';
import { keys, map } from 'lodash';

import { Injectable, ServiceUnavailableException, isJSONString, pickEntities } from '@karhdo/nestjs-core';
import { RabbitMQConfig, RabbitMQChannelConfig, MessageConsumerConfig } from '@karhdo/nestjs-config';
import { LoggerService } from '@karhdo/nestjs-logger';

import { AllowArray, ConsumeHandler, ConsumerOptions, PublishedMessage } from '../rabbitmq.interface';

@Injectable()
export class AmqpConnection {
  private _managedConnection!: ConnectionManager;

  private _connection?: Connection;

  private _managedChannel!: ChannelManager;
  private _managedChannels: Record<string, ChannelManager> = {};

  private config: RabbitMQConfig;

  private logger: LoggerService = new LoggerService();

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  get channel(): ChannelManager {
    return this._managedChannel;
  }

  get channels(): Record<string, ChannelManager> {
    return this._managedChannels;
  }

  get configuration(): RabbitMQConfig {
    return this.config;
  }

  get connected(): boolean {
    return this._managedConnection.isConnected();
  }

  get defaultChannel() {
    return {
      name: AmqpConnection.name,
      config: {
        prefetchCount: this.config.prefetchCount,
        isDefault: true,
      },
    };
  }

  public setConfig(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * @description create channel to consume messages in batches of "batchSize" messages
   * @returns void
   */
  private async createBatchConsumingChannel(): Promise<void> {
    const { consumer } = this.config;

    const consumerKeys = keys(consumer);

    const channels = consumerKeys.reduce((results, consumerKey) => {
      const instance = plainToInstance(MessageConsumerConfig, consumer[consumerKey]);

      if (instance?.batchSize) {
        const channelName = instance.getChannelName();

        results.push({
          prefetchCount: instance?.batchSize,
          isDefault: false,
          channelName,
        });
      }

      return results;
    }, []);

    if (channels?.length) {
      const promises = channels.map((channel) => {
        const { channelName, ...config } = channel;

        return this.setupManagedChannel(channelName, config);
      });

      await Promise.all(promises);
    }
  }

  private async createChannel(): Promise<void> {
    const { name: defaultName, config: defaultConfig } = this.defaultChannel;

    await this.setupManagedChannel(defaultName, defaultConfig);

    const channelNames: Array<string> = keys(this.config.channels);

    const promises = channelNames.map((channelName) => {
      const channelConfig = this.config.channels[channelName];

      return this.setupManagedChannel(channelName, {
        ...channelConfig,
        isDefault: false,
      });
    });

    if (promises.length) {
      await Promise.all(promises);
    }

    await this.createBatchConsumingChannel();
  }

  private async setupChannel(channel: ConfirmChannel, config: RabbitMQChannelConfig): Promise<void> {
    await channel.prefetch(config.prefetchCount || this.config.prefetchCount);

    if (config.isDefault) {
      const { exchanges } = this.config;

      for (const exchange of exchanges) {
        const { name, type = this.config.defaultExchangeType, options } = exchange;

        await channel.assertExchange(name, type, options);
      }
    }
  }

  private setupManagedChannel(name: string, config: RabbitMQChannelConfig): Promise<void> {
    const channelManager = this._managedConnection.createChannel({
      name,
    });

    this._managedChannels[name] = channelManager;

    if (config.isDefault) {
      this._managedChannel = channelManager;
    }

    channelManager.on('connect', () => {
      this.logger.info(`Created successfully RabbitMQ channel ${name}`);
    });

    channelManager.on('error', (err) => {
      this.logger.error(`Failed to setup RabbitMQ channel ${name}`, err);
    });

    channelManager.on('close', () => {
      this.logger.warning(`Successfully closed RabbitMQ channel ${name}`);
    });

    return channelManager.addSetup((channel: ConfirmChannel) => {
      return this.setupChannel(channel, config);
    });
  }

  private connect(): void {
    const { hostname, port, username, password } = this.config;

    this._managedConnection = createConnection({
      hostname,
      port,
      username,
      password,
    });

    this._managedConnection.on('connect', ({ connection }) => {
      this._connection = connection;

      const { hostname, port } = this.config;

      this.logger.info(`Connected successfully rabbitMQ broker amqp://${hostname}:${port}`);
    });

    this._managedConnection.on('disconnect', ({ err }) => {
      this.logger.error('Disconnected from rabbitMQ broker', err);
    });

    this._managedConnection.on('connectFailed', ({ err }) => {
      this.logger.error('Error establishing a rabbitMQ broker connection', err);
    });
  }

  public async init(): Promise<void> {
    this.connect();

    await this.createChannel();
  }

  public async publish(
    exchange: string,
    routingKey: string,
    data: PublishedMessage | PublishedMessage[],
    options: Options.Publish = {
      persistent: true,
    },
  ): Promise<boolean> {
    if (!this.connected || !this.channel) {
      throw new ServiceUnavailableException('RabbitMQ - AMQP connection is not available');
    }

    const messages = pickEntities(data);

    const promises = map(messages, (message) => {
      const content = this.config.serializer(message);

      return this.channel.publish(exchange, routingKey, content, options);
    });

    await Promise.all(promises);

    return true;
  }

  public async sendToQueue(
    queue: string,
    data: PublishedMessage | PublishedMessage[],
    options: Options.Publish = {
      persistent: true,
    },
  ): Promise<boolean> {
    if (!this.connected || !this.channel) {
      throw new ServiceUnavailableException('RabbitMQ - AMQP connection is not available');
    }

    const messages = pickEntities(data);

    const promises = map(messages, (message) => {
      const content = this.config.serializer(message);

      return this.channel.sendToQueue(queue, content, options);
    });

    await Promise.all(promises);

    return true;
  }

  public selectManagedChannel(options?: ConsumerOptions): ChannelManager {
    if (options?.batchSize) {
      const consumerConfig = plainToInstance(MessageConsumerConfig, options);

      const channelName = consumerConfig.getChannelName();

      return this._managedChannels[channelName];
    }

    const channelName = options?.queueOptions?.channel;

    if (!channelName) {
      return this._managedChannel;
    }

    const channel = this._managedChannels[channelName];

    if (!channel) {
      return this._managedChannel;
    }

    return channel;
  }

  private async setupQueue(channel: ConfirmChannel, options: ConsumerOptions) {
    const {
      queue: queueName = '',
      exchange,
      routingKey,
      routingKeys,
      createQueueIfNotExists = true,
      queueOptions,
    } = options;

    if (JSON.parse(createQueueIfNotExists.toString())) {
      const options = Object.assign({ arguments: { 'x-queue-type': 'quorum' } }, queueOptions);

      await channel.assertQueue(queueName, options);
    }

    if (exchange && (routingKey || routingKeys.length)) {
      const patterns = routingKey ? [routingKey] : routingKeys;

      const promises = patterns.map((pattern) => {
        channel.bindQueue(queueName, exchange, pattern);
      });

      await Promise.all(promises);
    }

    return queueName;
  }

  public async binding(options: ConsumerOptions): Promise<void> {
    const channel = this.selectManagedChannel();

    await channel.addSetup(async (channel: ConfirmChannel) => await this.setupQueue(channel, options));
  }

  private async setupSubscriberChannel(
    channel: ConfirmChannel,
    handler: ConsumeHandler,
    options: ConsumerOptions,
  ): Promise<void> {
    const queue = await this.setupQueue(channel, options);

    if (options?.batchSize) {
      return this.receiveMessages(queue, channel, handler, options);
    }

    await this.receiveMessage(queue, channel, handler);
  }

  private async receiveMessages(
    queue: string,
    channel: ConfirmChannel,
    handler: ConsumeHandler,
    options: ConsumerOptions,
  ): Promise<void> {
    const { batchSize, idleTimeout = 60 * 1000 } = options;

    const worker = asyncTimedCargo(
      async (rawMessages: ConsumeMessage[], callback) => {
        callback();

        const consumedMessages = map(rawMessages, (rawMessage) => {
          const canParse = isJSONString(rawMessage?.content?.toString());

          if (rawMessage?.content && canParse) {
            return this.config.deserializer(rawMessage);
          }
        }).filter((message) => !!message);

        try {
          await handler(consumedMessages, rawMessages);

          await this.commit(channel, rawMessages);
        } catch (err) {
          console.log(`Handle message ${JSON.stringify(consumedMessages)} occurs error`, err);

          await this.reject(channel, rawMessages);
        }
      },
      batchSize,
      idleTimeout,
    );

    await channel.consume(queue, worker.push);
  }

  private async receiveMessage(queue: string, channel: ConfirmChannel, handler: ConsumeHandler): Promise<void> {
    await channel.consume(queue, async (rawMessage) => {
      const canParse = isJSONString(rawMessage?.content?.toString());

      if (rawMessage?.content && canParse) {
        const message = this.config.deserializer(rawMessage);

        try {
          await handler(message, rawMessage);

          await this.commit(channel, rawMessage);
        } catch (err) {
          console.log(`Handle message ${JSON.stringify(message)} occurs error`, err);

          await this.reject(channel, rawMessage);
        }
      } else {
        rawMessage && (await this.commit(channel, rawMessage));
      }
    });
  }

  private async commit(channel: ConfirmChannel, message: AllowArray<ConsumeMessage>): Promise<void> {
    const messages = pickEntities(message);

    if (messages?.length) {
      for (const message of messages) {
        channel.ack(message);
      }
    }

    await channel.waitForConfirms();
  }

  private async reject(
    channel: ConfirmChannel,
    message: AllowArray<ConsumeMessage>,
    options?: {
      requeue: boolean;
    },
  ): Promise<void> {
    const messages = pickEntities(message);

    const { requeue } = options || { requeue: true };

    if (messages?.length) {
      for (const message of messages) {
        message && channel.reject(message, requeue);
      }

      await channel.waitForConfirms();
    }
  }

  public async consume(options: ConsumerOptions, handler: ConsumeHandler): Promise<void> {
    const { enable = false } = options;

    if (!JSON.parse(enable.toString())) {
      return;
    }

    const channel = this.selectManagedChannel(options);

    await channel.addSetup(
      async (channel: ConfirmChannel) => await this.setupSubscriberChannel(channel, handler, options),
    );
  }
}
