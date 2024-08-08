/* eslint-disable no-console */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@karhdo/nestjs-core';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export default class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();

    return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
