# nestjs-rabbitmq

RabbitMQ module for Nest framework (node.js) 🚀

## Installation

```bash
$ yarn add @karhdo/nestjs-rabbitmq
```

## Usage

Import `RabbitMQModule`:

```typescript
@Module({
  imports: [
    RabbitMQModule
  ],
  providers: [...],
})
export class AppModule {}
```

Read config from yaml file

```yaml
YAML FILE

rabbitmq:
  hostname: 127.0.0.1
  port: 5672
  username: app
  password: iamapp
```

RabbitMQ Configuration DTO

```typescript
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
    return JSON.parse(message.content.toString());
  }

  public serializer(value: ObjectLiteral): Buffer {
    return Buffer.from(JSON.stringify(value));
  }
}
```

## Consume Messages

```typescript
import { Injectable } from '@karhdo/nestjs-core';
import { Consume } from '@karhdo/nestjs-rabbitmq';

@Injectable()
export class ConsumerService {
  @Consume('priceMonitoring')
  public async insert(message: CrawlingSuccess | CrawlingFailure): Promise<void> {}

  @Consume({
    queue: 'email-worker',
    enable: true,
    exchange: 'ynm-campaign',
    routingKeys: 'campaign.email',
    createQueueIfNotExists: true,
  })
  public async sendEmail(message: Email): Promise<void> {}
}
```

Config consumer key from yaml file

```yaml
YAML FILE

rabbitmq:
  consumer:
    priceMonitoring:
      queue: 'eca.price_monitoring'
      createQueueIfNotExists: false
      enable: true
```

## Publish Messages

If you just want to publish a message onto a RabbitMQ exchange, use the publish method of the AmqpConnection which has the following signature:

```ja
public publish<T>(
  exchange: string,
  routingKey: string,
  message: T,
  options?: amqplib.Options.Publish = { persistent: true }
)
```

Publish message into specific queue

```code
public sendToQueue<T>(
  queue: string,
  message: T,
  options?: amqplib.Options.Publish = { persistent: true }
)
```

```typescript
import { Injectable } from '@karhdo/nestjs-core';
import { AmqpConnection } from '@karhdo/nestjs-rabbitmq';

@Injectable()
export class PublishService {
  constructor(private readonly rabbitService: AmqpConnection) {}

  public async sendToQueue(queue: string, message: ProductItem): Promise<void> {
    await this.rabbitService.sendToQueue<ProductItem>(queue, message);
  }

  public async publish(exchange: string, routingKey: string, message: ProductItem): Promise<void> {
    await this.rabbitService.publish<ProductItem>(exchange, routingKey, message);
  }
}
```
