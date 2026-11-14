import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { VietQrWebhookDto } from './dto/vietqr-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Thu ngân & Quyết toán viện phí (Billing & Invoices)')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('calculate/:examId')
  @ApiOperation({ summary: 'Tính toán chi phí viện phí và khấu trừ BHYT tự động (BR03)' })
  async calculateFee(@Param('examId') examId: string) {
    return this.billingService.calculateFee(examId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('invoices')
  @ApiOperation({ summary: 'Thu ngân lập hóa đơn thanh toán viện phí' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Public()
  @Post('webhook/vietqr')
  @ApiOperation({ summary: 'Webhook nhận thông báo thanh toán thành công VietQR (Idempotent BR06)' })
  async handleVietQrWebhook(@Body() dto: VietQrWebhookDto) {
    return this.billingService.handleVietQrWebhook(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('invoices/:id/pdf')
  @ApiOperation({ summary: 'Xuất biên lai hóa đơn viện phí định dạng PDF' })
  async downloadInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.billingService.generateInvoicePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice_${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('invoices/:id')
  @ApiOperation({ summary: 'Xem chi tiết hóa đơn thanh toán' })
  async getInvoiceById(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }
}
