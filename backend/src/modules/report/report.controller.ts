import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @Roles(
    Role.ADMIN,
    Role.BAC_SI,
    Role.DIEU_DUONG,
    Role.KY_THUAT_VIEN,
    Role.TIEP_NHAN,
    Role.THU_NGAN,
  )
  @ApiOperation({ summary: 'Tổng quan Dashboard từ 18 bảng và VIEW (BR-V2-08, 11)' })
  @ApiQuery({ name: 'date', required: false, example: '2026-11-15' })
  async getDashboardSummary(@Query('date') date?: string) {
    return this.reportService.getDashboardSummary(date);
  }
}
