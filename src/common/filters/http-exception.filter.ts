import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const rawResponse = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const message = typeof rawResponse === 'object' && rawResponse !== null && 'message' in (rawResponse as any)
      ? (rawResponse as any).message
      : rawResponse;

    res.status(status).json({
      success: false,
      statusCode: status,
      path: ctx.getRequest().url,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
