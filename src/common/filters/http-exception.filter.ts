import { Catch, ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    res.status(status).json({
      success: false,
      statusCode: status,
      path: ctx.getRequest().url,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
