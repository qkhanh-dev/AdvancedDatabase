import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreateInsuranceCardDto, CreatePatientDto } from './dto/patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Tiếp đón, Bệnh nhân & Thẻ BHYT (Patient & Insurance)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN)
  @ApiOperation({ summary: 'Tạo hồ sơ BENH_NHAN mới (BR-V2-09: không tạo BN_NGOAI_TRU)' })
  async createPatient(@Body() dto: CreatePatientDto) {
    return this.patientService.createPatient(dto);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Tra cứu bệnh nhân theo MaBN, CCCD, SDT hoặc MaTheBHYT (kèm Tuoi dẫn xuất)' })
  @ApiQuery({ name: 'q', required: true })
  async lookup(@Query('q') query: string) {
    return this.patientService.lookup(query);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách bệnh nhân (phân trang, kèm Tuoi dẫn xuất)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllPatients(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.patientService.getAllPatients(parseInt(page, 10), parseInt(limit, 10));
  }

  @Post(':maBN/insurance-cards')
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN)
  @ApiOperation({ summary: 'Thêm thẻ THE_BHYT cho bệnh nhân (BR-V2-06)' })
  async createInsuranceCard(
    @Param('maBN') maBN: string,
    @Body() dto: CreateInsuranceCardDto,
  ) {
    return this.patientService.createInsuranceCard(maBN, dto);
  }

  @Get(':maBN/insurance-cards')
  @ApiOperation({ summary: 'Liệt kê thẻ THE_BHYT của bệnh nhân (tùy chọn lọc theo validAt=YYYY-MM-DD)' })
  @ApiQuery({ name: 'validAt', required: false, example: '2026-11-15' })
  async getInsuranceCards(
    @Param('maBN') maBN: string,
    @Query('validAt') validAt?: string,
  ) {
    return this.patientService.getInsuranceCards(maBN, validAt);
  }
}
