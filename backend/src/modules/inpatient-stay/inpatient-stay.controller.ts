import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InpatientStayService } from './inpatient-stay.service';
import { AdmitPatientDto } from './dto/admit-patient.dto';
import { AssignBedDto, TransferBedDto } from './dto/assign-bed.dto';
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

  @Post('admit')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Chuyển bệnh nhân vào điều trị nội trú' })
  async admitPatient(@Body() dto: AdmitPatientDto) {
    return this.service.admitPatient(dto);
  }

  @Post('assign-bed')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Phân bổ giường bệnh nội trú (Chống trùng lặp giường BR02)' })
  async assignBed(@Body() dto: AssignBedDto) {
    return this.service.assignBed(dto);
  }

  @Post('transfer-bed')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Chuyển buồng bệnh / Đổi giường bệnh' })
  async transferBed(@Body() dto: TransferBedDto) {
    return this.service.transferBed(dto);
  }

  @Get('patients')
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ bệnh nhân đang điều trị nội trú' })
  async getInpatientList() {
    return this.service.getInpatientList();
  }
}
