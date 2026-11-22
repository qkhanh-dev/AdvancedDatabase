import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InpatientStayService } from './inpatient-stay.service';
import {
  CreateAdmissionDto,
  CreateBedAllocationDto,
  DischargeAdmissionDto,
  TransferBedDto,
} from './dto/inpatient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Điều trị Nội trú & Phân giường (Inpatient)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inpatient')
export class InpatientStayController {
  constructor(private readonly service: InpatientStayService) {}

  @Get('admissions')
  @ApiOperation({ summary: 'Danh sách các đợt điều trị nội trú DOT_NOI_TRU' })
  @ApiQuery({ name: 'openOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'maBN', required: false })
  async getAdmissions(
    @Query('openOnly') openOnly?: string,
    @Query('maBN') maBN?: string,
  ) {
    return this.service.getAdmissions(openOnly === 'true', maBN);
  }

  @Post('admissions')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Mở đợt điều trị nội trú DOT_NOI_TRU (BR-V2-12)' })
  async createAdmission(@Body() dto: CreateAdmissionDto) {
    return this.service.createAdmission(dto);
  }

  @Post('bed-allocations')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Phân giường nội trú [TuNgay, DenNgay) chống trùng lịch (BR-V2-03, BR-V2-11)' })
  async allocateBed(@Body() dto: CreateBedAllocationDto) {
    return this.service.allocateBed(dto);
  }

  @Post('transfer-bed')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Chuyển giường nội trú tại ngày ngayChuyen trong 1 transaction có khóa' })
  async transferBed(@Body() dto: TransferBedDto) {
    return this.service.transferBed(dto);
  }

  @Patch('admissions/:maDotNT/discharge')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Đóng đợt nội trú & đóng phân giường đang mở (BR-V2-02, BR-V2-03)' })
  async dischargeAdmission(
    @Param('maDotNT') maDotNT: string,
    @Body() dto: DischargeAdmissionDto,
  ) {
    return this.service.dischargeAdmission(maDotNT, dto);
  }
}
