import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoaiNVEnum } from '@prisma/client';

@ApiTags('Nhân sự y tế (Staff)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách cán bộ y tế' })
  @ApiQuery({ name: 'loaiNV', enum: LoaiNVEnum, required: false })
  @ApiQuery({ name: 'maKhoa', required: false })
  async getAllStaff(
    @Query('loaiNV') loaiNV?: LoaiNVEnum,
    @Query('maKhoa') maKhoa?: string,
  ) {
    return this.staffService.getAllStaff(loaiNV, maKhoa);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Danh sách bác sĩ điều trị' })
  async getDoctors() {
    return this.staffService.getDoctors();
  }

  @Get('nurses')
  @ApiOperation({ summary: 'Danh sách điều dưỡng' })
  async getNurses() {
    return this.staffService.getNurses();
  }

  @Get(':maNV')
  @ApiOperation({ summary: 'Xem chi tiết nhân sự y tế' })
  async getStaffById(@Param('maNV') maNV: string) {
    return this.staffService.getStaffById(maNV);
  }
}
