import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Báo cáo thống kê & Dashboard (Reports)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG, Role.NV_HANH_CHINH, Role.THU_NGAN)
  @ApiOperation({ summary: 'Lấy số liệu tổng quan Dashboard bệnh viện (Doanh thu, công suất giường, ca khám)' })
  async getDashboardSummary() {
    return this.reportService.getDashboardSummary();
  }
}
