import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
  HttpStatus,
} from '@karhdo/nestjs-core';
import { map } from 'rxjs';

export class HealthCheckInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, handler: CallHandler) {
    return handler.handle().pipe(
      map((isConnected: boolean) => {
        if (isConnected) {
          return {
            message: 'RabbitMQ - AMQP connection is available',
            statusCode: HttpStatus.OK,
          };
        }

        throw new ServiceUnavailableException('RabbitMQ - AMQP connection is not available');
      }),
    );
  }
}
