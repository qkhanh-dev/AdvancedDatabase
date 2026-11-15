import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateStaffDto } from './dto/create-staff.dto';

@ApiTags('Nhân sự y tế (Staff)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách nhân viên kèm SoNamCongTac (dẫn xuất)' })
  @ApiQuery({ name: 'loaiChuyenMon', enum: ['BAC_SI', 'DIEU_DUONG', 'KY_THUAT_VIEN', 'KHAC'], required: false })
  @ApiQuery({ name: 'maKhoa', required: false })
  async getAllStaff(
    @Query('loaiChuyenMon') loaiChuyenMon?: string,
    @Query('maKhoa') maKhoa?: string,
  ) {
    return this.staffService.getAllStaff(loaiChuyenMon, maKhoa);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Danh sách bác sĩ (BAC_SI)' })
  async getDoctors() {
    return this.staffService.getDoctors();
  }

  @Get('nurses')
  @ApiOperation({ summary: 'Danh sách điều dưỡng (DIEU_DUONG)' })
  async getNurses() {
    return this.staffService.getNurses();
  }

  @Get('technicians')
  @ApiOperation({ summary: 'Danh sách kỹ thuật viên xét nghiệm (KY_THUAT_VIEN)' })
  async getTechnicians() {
    return this.staffService.getTechnicians();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo nhân sự mới tuân thủ chuyên biệt hóa disjoint, partial (BR-V2-01)' })
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.staffService.createStaff(dto);
  }

  @Get(':maNV')
  @ApiOperation({ summary: 'Chi tiết nhân viên kèm SoNamCongTac' })
  async getStaffById(@Param('maNV') maNV: string) {
    return this.staffService.getStaffById(maNV);
  }
}
