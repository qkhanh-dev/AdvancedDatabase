import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto, PayInvoiceDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Viện phí & Thanh toán (Billing)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('preview/:maLuotKham')
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN, Role.BAC_SI)
  @ApiOperation({ summary: 'Xem trước viện phí từ VIEW/Query & gợi ý THE_BHYT còn hạn (BR-V2-08)' })
  async previewBilling(@Param('maLuotKham') maLuotKham: string) {
    return this.billingService.previewBilling(maLuotKham);
  }

  @Post('invoices')
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN)
  @ApiOperation({ summary: 'Lập hóa đơn VIEN_PHI (tối đa 1 thẻ BHYT, không tính tiền giường)' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Patch('invoices/:maHoaDon/pay')
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN)
  @ApiOperation({ summary: 'Chốt thanh toán DA_THANH_TOAN và khóa chi phí liên quan (BR-V2-08, BR-V2-13)' })
  async payInvoice(
    @Param('maHoaDon') maHoaDon: string,
    @Body() dto: PayInvoiceDto,
  ) {
    return this.billingService.payInvoice(maHoaDon, dto);
  }

  @Get('invoices/:maHoaDon')
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN, Role.BAC_SI)
  @ApiOperation({ summary: 'Chi tiết hóa đơn VIEN_PHI (kèm TongTienThuoc, TongTienDichVu, ThucThu)' })
  async getInvoiceById(@Param('maHoaDon') maHoaDon: string) {
    return this.billingService.getInvoiceById(maHoaDon);
  }
}
