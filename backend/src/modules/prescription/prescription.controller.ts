import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Dược phẩm & Đơn thuốc (Medicines & Prescriptions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PrescriptionController {
  constructor(private readonly service: PrescriptionService) {}

  @Get('medicines')
  @ApiOperation({ summary: 'Danh mục thuốc (THUOC - không quản lý tồn kho SoLuongTon)' })
  async getAllMedicines() {
    return this.service.getAllMedicines();
  }

  @Post('prescriptions')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Kê đơn thuốc DON_THUOC + CHI_TIET_DON_THUOC (BR-V2-05, 06, 08, 13)' })
  async createPrescription(@Body() dto: CreatePrescriptionDto) {
    return this.service.createPrescription(dto);
  }

  @Patch('prescriptions/:maDonThuoc')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Cập nhật đơn thuốc trước thanh toán (BR-V2-06, 08, 13)' })
  async updatePrescription(
    @Param('maDonThuoc') maDonThuoc: string,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.service.updatePrescription(maDonThuoc, dto);
  }

  @Delete('prescriptions/:maDonThuoc')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Xóa đơn thuốc trước thanh toán (BR-V2-08, 13)' })
  async deletePrescription(@Param('maDonThuoc') maDonThuoc: string) {
    return this.service.deletePrescription(maDonThuoc);
  }

  @Get('prescriptions/:maDonThuoc')
  @ApiOperation({ summary: 'Chi tiết đơn thuốc kèm TongTienThuoc (dẫn xuất)' })
  async getPrescriptionById(@Param('maDonThuoc') maDonThuoc: string) {
    return this.service.getPrescriptionById(maDonThuoc);
  }
}
