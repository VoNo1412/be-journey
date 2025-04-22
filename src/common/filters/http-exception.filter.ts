import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Initialize the response object
    let errorResponse: {
      statusCode: number;
      message: string | string[];
      errors?: any[];
      path: string;
    } = {
      statusCode: status,
      message: exception.message || 'Internal Server Error',
      path: request.url,
    };

    // Handle validation errors (from class-validator)
    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const messages = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];

      // Check if the error is a validation error (class-validator format)
      if (messages.some((msg) => msg.includes('must be'))) {
        errorResponse.message = 'Validation failed';
        errorResponse.errors = messages.map((msg) => {
          // Extract field and constraint from messages like "description must be a string"
          const [property, ...constraintParts] = msg.split(' must ');
          return {
            property: property.trim(),
            constraints: constraintParts.join(' must ').trim(),
          };
        });
      } else {
        errorResponse.message = messages;
      }
    } else if (typeof exceptionResponse === 'string') {
      errorResponse.message = exceptionResponse;
    }

    // Log the error for debugging
    console.error(`Request failed with status ${status}:`, errorResponse);

    // Send the response
    response.status(status).json(errorResponse);
  }
}