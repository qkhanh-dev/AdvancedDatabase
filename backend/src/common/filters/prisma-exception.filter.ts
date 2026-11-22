import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let ruleCode = `PRISMA_${exception.code}`;
    let message = 'Lỗi cơ sở dữ liệu hệ thống';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const targetText = Array.isArray(target) ? target.join(', ') : String(target);
        if (targetText.includes('MaLuotKham')) {
          ruleCode = 'BR-V2-05';
        } else if (targetText.includes('MaBN') || exception.message.includes('UQ_DOT_NOI_TRU_OPEN_MABN')) {
          ruleCode = 'BR-V2-12';
        } else {
          ruleCode = 'UNIQUE_CONSTRAINT';
        }
        message = `Dữ liệu bị trùng lặp khóa duy nhất trên trường: ${targetText}`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        ruleCode = 'NOT_FOUND';
        message = 'Không tìm thấy bản ghi dữ liệu yêu cầu';
        break;
      }
      case 'P2003': {
        status = HttpStatus.CONFLICT;
        ruleCode = 'FK_NO_ACTION';
        message = 'Vi phạm ràng buộc khóa ngoại (ON DELETE / ON UPDATE NO ACTION)';
        break;
      }
      case 'P2034': {
        status = HttpStatus.CONFLICT;
        ruleCode = 'CONCURRENCY_CONFLICT';
        message = 'Giao dịch xung đột đồng thời, vui lòng thử lại';
        break;
      }
      case 'P2010':
      case 'P2004': {
        const msg = exception.message || '';
        const brMatch = msg.match(/\[(BR-V2-\d{2})\]/);
        if (brMatch) {
          ruleCode = brMatch[1];
          status = ['BR-V2-01', 'BR-V2-03', 'BR-V2-05', 'BR-V2-08', 'BR-V2-11', 'BR-V2-12', 'BR-V2-13'].includes(
            ruleCode,
          )
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
          message = msg;
        } else {
          status = HttpStatus.BAD_REQUEST;
          ruleCode = 'DB_CONSTRAINT';
          message = `Lỗi ràng buộc cơ sở dữ liệu: ${msg}`;
        }
        break;
      }
      default:
        message = `Lỗi Prisma: ${exception.message}`;
        break;
    }

    this.logger.error(
      `[${request.method}] ${request.url} - Code: ${exception.code} - Rule: ${ruleCode} - Message: ${message}`,
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
