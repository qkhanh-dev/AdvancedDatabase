import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

const DEFAULT_RULE_CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const message =
      typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
        ? (errorResponse as any).message
        : exception.message;

    let ruleCode: string | undefined =
      typeof errorResponse === 'object' && errorResponse !== null && 'ruleCode' in errorResponse
        ? (errorResponse as any).ruleCode
        : undefined;

    if (!ruleCode && typeof message === 'string') {
      const match = message.match(/\[(BR-V2-\d{2})\]/);
      if (match) {
        ruleCode = match[1];
      }
    }

    if (!ruleCode) {
      ruleCode = DEFAULT_RULE_CODE_BY_STATUS[status] || `HTTP_${status}`;
    }

    this.logger.warn(
      `[${request.method}] ${request.url} - Status: ${status} - Rule: ${ruleCode} - Error: ${JSON.stringify(message)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ruleCode,
      message,
    });
  }
}
