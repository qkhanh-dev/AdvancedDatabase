import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DutyScheduleService } from './duty-schedule.service';
import { CreateDutyScheduleDto } from './dto/create-duty-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CaTrucEnum, TrangThaiDiemDanhEnum } from '@prisma/client';

@ApiTags('Lịch trực & Phân ca y bác sĩ (Duty Schedules)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('duty-schedules')
export class DutyScheduleController {
  constructor(private readonly service: DutyScheduleService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Lập lịch trực y tế (Chống trùng ca trực BR05)' })
  async createDutySchedule(@Body() dto: CreateDutyScheduleDto) {
    return this.service.createDutySchedule(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách ca trực theo khoảng thời gian' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'maNV', required: false })
  async getSchedules(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('maNV') maNV?: string,
  ) {
    return this.service.getSchedules(startDate, endDate, maNV);
  }

  @Patch('attendance')
  @Roles(Role.ADMIN, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Điểm danh ca trực' })
  async updateAttendance(
    @Query('maNV') maNV: string,
    @Query('ngayTruc') ngayTruc: string,
    @Query('caTruc') caTruc: CaTrucEnum,
    @Query('status') status: TrangThaiDiemDanhEnum,
  ) {
    return this.service.updateAttendance(maNV, ngayTruc, caTruc, status);
  }
}
