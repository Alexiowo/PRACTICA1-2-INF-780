import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionBody {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    const exceptionBody = exception.getResponse() as HttpExceptionBody | string;

    const message =
      typeof exceptionBody === 'string'
        ? exceptionBody
        : Array.isArray(exceptionBody.message)
          ? exceptionBody.message.join('; ')
          : exceptionBody.message;

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
