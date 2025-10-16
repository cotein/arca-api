import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ArcaException } from './arca.exceptions';

@Catch(ArcaException)
export class ArcaExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ArcaExceptionFilter.name);

  catch(exception: ArcaException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(`[${exception.code}] ${exception.message}`);

    const status =
      exception.code === 'CONFIG_ERROR' ||
      exception.code === 'CERTIFICATE_ERROR'
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      code: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}