import { Module, Global } from '@karhdo/nestjs-core';
import { AmqpModule } from './amqp';

@Global()
@Module({
  imports: [AmqpModule.forRootAsync()],
})
export class RabbitMQModule {}
