import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExaminationService } from './examination.service';
import { CreateExaminationDto, UpdateExaminationDto } from './dto/examination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Khám bệnh & Lượt khám (Examination)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('examinations')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN, Role.BAC_SI)
  @ApiOperation({ summary: 'Tạo lượt khám LUOT_KHAM (BR-V2-04: FK11 & khung đợt nội trú)' })
  async createExamination(@Body() dto: CreateExaminationDto) {
    return this.examinationService.createExamination(dto);
  }

  @Patch(':maLuotKham')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Cập nhật chẩn đoán, trạng thái hoặc chuyển MaDotNT (BR-V2-04)' })
  async updateExamination(
    @Param('maLuotKham') maLuotKham: string,
    @Body() dto: UpdateExaminationDto,
  ) {
    return this.examinationService.updateExamination(maLuotKham, dto);
  }

  @Get(':maLuotKham')
  @ApiOperation({ summary: 'Chi tiết lượt khám kèm đơn thuốc, xét nghiệm và viện phí (kèm thuộc tính dẫn xuất)' })
  async getExaminationById(@Param('maLuotKham') maLuotKham: string) {
    return this.examinationService.getExaminationById(maLuotKham);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách lượt khám' })
  @ApiQuery({ name: 'maNV_BacSi', required: false })
  @ApiQuery({ name: 'maBN', required: false })
  @ApiQuery({ name: 'maDotNT', required: false })
  async getAllExaminations(
    @Query('maNV_BacSi') maNV_BacSi?: string,
    @Query('maBN') maBN?: string,
    @Query('maDotNT') maDotNT?: string,
  ) {
    return this.examinationService.getAllExaminations(maNV_BacSi, maBN, maDotNT);
  }
}
