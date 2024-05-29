import JSON5 from 'json5';
import { camelCase } from 'lodash';
import { NestedObjectValidator, ObjectLiteral } from '@karhdo/nestjs-core';
import { Type } from 'class-transformer';
import { IsNumber, IsString, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';

import { Message, Options } from 'amqplib';

export type ExchangeType = 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string;

export class RabbitMQChannelConfig {
  @IsOptional()
  @IsNumber()
  public readonly prefetchCount: number = 1;

  @IsOptional()
  @IsBoolean()
  public readonly isDefault: boolean = false;
}

export class RabbitMQExchangeConfig {
  @IsString()
  public readonly name: string = 'default_exchange';

  @IsString()
  public readonly type: ExchangeType = 'topic';

  @IsOptional()
  public readonly options?: Options.AssertExchange;
}

export interface QueueOptions extends Options.AssertQueue {
  channel?: string;
}

export class MessageConsumerConfig {
  @IsString()
  public readonly name?: string = 'AmqpConnection';

  @IsOptional()
  @IsString()
  public readonly queue?: string;

  @IsOptional()
  @IsString()
  public readonly exchange?: string;

  @IsOptional()
  @IsString()
  public readonly routingKey?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public readonly routingKeys?: string[];

  @IsOptional()
  public readonly queueOptions?: QueueOptions;

  @IsBoolean()
  public readonly createQueueIfNotExists?: boolean = true;

  @IsOptional()
  @IsBoolean()
  public readonly enable?: boolean;

  @IsOptional()
  @IsNumber()
  public readonly batchSize?: number;

  @IsOptional()
  @IsNumber()
  public readonly idleTimeout?: number = 10000;

  public getChannelName(key: string = ''): string {
    return `${this.queue}-${this.batchSize}-${camelCase(key)}Channel`;
  }
}

export class RabbitMQConfig {
  /**
   * The IP Address or hostname of AMQP connection.
   * @Default: localhost
   */
  @IsString()
  public readonly hostname: string = '127.0.0.1';

  /**
   * The password to authenticate AMQP connection.
   * @Default: 5672
   */
  @IsNumber()
  public readonly port: number = 5672;

  /**
   * The username that is used for authenticating AMQP connection.
   * @Default: root
   */
  @IsString()
  public readonly username: string = 'root';

  /**
   * The password that is used for authenticating AMQP connection.
   * @Default: admin123
   */
  @IsString()
  public readonly password: string = 'admin123';

  /**
   * Default name AMQP connection.
   * @Default: default
   */
  @IsString()
  public readonly name: string = 'default';

  /**
   * Prefetch count for default channel.
   * @Default: 1
   */
  @IsNumber()
  public readonly prefetchCount: number = 1;

  /**
   * Optionally create multiple channel.
   */
  @NestedObjectValidator(RabbitMQChannelConfig)
  public readonly channels: Record<string, RabbitMQChannelConfig> = {};

  /**
   * Optionally create exchanges when not exists.
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RabbitMQExchangeConfig)
  public readonly exchanges: RabbitMQExchangeConfig[] = [];

  /**
   * Optionally message consumer configuration
   */
  @IsOptional()
  @NestedObjectValidator(MessageConsumerConfig)
  public readonly consumer?: Record<string, MessageConsumerConfig> = {};

  /**
   * Automatically set default exchange type as topic, fanout or direct.
   * @Default: topic
   */
  @IsString()
  public readonly defaultExchangeType: ExchangeType = 'topic';

  public deserializer(message: Message): ObjectLiteral {
    return JSON5.parse(message.content.toString());
  }

  public serializer(value: ObjectLiteral): Buffer {
    return Buffer.from(JSON.stringify(value));
  }
}
