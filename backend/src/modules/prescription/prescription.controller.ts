import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Dược phẩm & Toa thuốc (Prescription & Pharmacy)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly service: PrescriptionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Bác sĩ kê toa thuốc cho lượt khám' })
  async createPrescription(@Body() dto: CreatePrescriptionDto) {
    return this.service.createPrescription(dto);
  }

  @Patch(':id/dispense')
  @Roles(Role.ADMIN, Role.DIEU_DUONG, Role.NV_HANH_CHINH)
  @ApiOperation({ summary: 'Dược sĩ / Điều dưỡng xác nhận phát thuốc (Trừ kho nguyên tử)' })
  async dispensePrescription(@Param('id') id: string) {
    return this.service.dispensePrescription(id);
  }

  @Get('medicines')
  @ApiOperation({ summary: 'Lấy danh mục dược phẩm và tồn kho' })
  async getAllMedicines() {
    return this.service.getAllMedicines();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết đơn thuốc' })
  async getPrescriptionById(@Param('id') id: string) {
    return this.service.getPrescriptionById(id);
  }
}
