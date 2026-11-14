import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { ReceptionDto } from './dto/reception.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Tiếp đón & Hồ sơ người bệnh (Patient)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('reception')
  @Roles(Role.ADMIN, Role.NV_HANH_CHINH, Role.THU_NGAN)
  @ApiOperation({ summary: 'Tiếp đón bệnh nhân mới / Tạo hồ sơ' })
  async reception(@Body() dto: ReceptionDto) {
    return this.patientService.reception(dto);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Tra cứu hồ sơ bệnh nhân theo MaBN, CCCD hoặc SoBHYT' })
  @ApiQuery({ name: 'q', required: true, description: 'Từ khóa tra cứu (MaBN, CCCD, BHYT, SĐT)' })
  async lookup(@Query('q') query: string) {
    return this.patientService.lookup(query);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ bệnh nhân (phân trang)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllPatients(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.patientService.getAllPatients(parseInt(page, 10), parseInt(limit, 10));
  }
}
