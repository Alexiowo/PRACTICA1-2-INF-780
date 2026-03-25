import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ResponseEnvelope<T> {
  data: T;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T> | undefined> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T | undefined): ResponseEnvelope<T> | undefined => {
        if (data === undefined) {
          return undefined;
        }
        return {
          data,
          statusCode: response.statusCode,
        };
      }),
    );
  }
}
