import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message || 'Internal Server Error';

    // Log lỗi nếu cần
    console.error(`Request failed with status ${status}: ${message}`);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
