import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExaminationService } from './examination.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Khám bệnh & Chẩn đoán (Examination)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('examinations')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Bác sĩ khởi tạo lượt khám lâm sàng' })
  async createExamination(@Body() dto: CreateExaminationDto) {
    return this.examinationService.createExamination(dto);
  }

  @Patch(':id/diagnose')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Cập nhật chẩn đoán xác định và hướng xử trí' })
  async updateDiagnosis(
    @Param('id') id: string,
    @Body() dto: UpdateDiagnosisDto,
  ) {
    return this.examinationService.updateDiagnosis(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lượt khám bệnh' })
  async getExaminationById(@Param('id') id: string) {
    return this.examinationService.getExaminationById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các lượt khám' })
  @ApiQuery({ name: 'maBS', required: false })
  @ApiQuery({ name: 'maBN', required: false })
  async getAllExaminations(
    @Query('maBS') maBS?: string,
    @Query('maBN') maBN?: string,
  ) {
    return this.examinationService.getAllExaminations(maBS, maBN);
  }
}
