import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : Array.isArray((payload as { message?: unknown }).message)
            ? (payload as { message: string[] }).message
            : ((payload as { message?: string }).message ?? exception.message);

      return response.status(status).json({
        success: false,
        statusCode: status,
        error: HttpStatus[status] ?? 'Error',
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const statusCode = this.mapPrismaErrorToStatus(exception.code);

      return response.status(statusCode).json({
        success: false,
        statusCode,
        error: HttpStatus[statusCode] ?? 'Error',
        message: 'Database operation failed',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Unexpected server error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private mapPrismaErrorToStatus(code: string): number {
    switch (code) {
      case 'P2002':
        return HttpStatus.CONFLICT;
      case 'P2003':
      case 'P2010':
        return HttpStatus.BAD_REQUEST;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
