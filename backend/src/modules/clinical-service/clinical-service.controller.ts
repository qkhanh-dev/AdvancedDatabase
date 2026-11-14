import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicalServiceService } from './clinical-service.service';
import { AssignServiceDto } from './dto/assign-service.dto';
import { UpdateServiceResultDto } from './dto/update-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Cận lâm sàng & Dịch vụ kỹ thuật (Clinical Services)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('services')
export class ClinicalServiceController {
  constructor(private readonly service: ClinicalServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh mục dịch vụ kỹ thuật y tế' })
  async getAllServices() {
    return this.service.getAllServices();
  }

  @Post('assign')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Bác sĩ chỉ định dịch vụ kỹ thuật cho lượt khám' })
  async assignService(@Body() dto: AssignServiceDto) {
    return this.service.assignService(dto);
  }

  @Patch('result')
  @Roles(Role.ADMIN, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Điều dưỡng / KTV cập nhật kết quả cận lâm sàng' })
  async updateResult(@Body() dto: UpdateServiceResultDto) {
    return this.service.updateResult(dto);
  }

  @Get('pending')
  @Roles(Role.ADMIN, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Lấy danh sách các chỉ định đang chờ thực hiện' })
  async getPendingRequests() {
    return this.service.getPendingRequests();
  }
}
