import { NestInterceptor, ExecutionContext, CallHandler, ServiceUnavailableException } from '@karhdo/nestjs-core';
import { LoggerService } from '@karhdo/nestjs-logger';
import { throwError, catchError, timeout } from 'rxjs';

const IDLE_TIMEOUT = 5000; // 5 seconds

export class RabbitIngestorInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  public intercept(context: ExecutionContext, handler: CallHandler) {
    return handler.handle().pipe(
      timeout(IDLE_TIMEOUT),
      catchError((error) => {
        this.loggerService.error('Publish message to RabbitMQ has been occurred an error', error);

        return throwError(() => new ServiceUnavailableException('Failed to send a message'));
      }),
    );
  }
}
