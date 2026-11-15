import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LabTestService } from './lab-test.service';
import {
  CompleteLabRequestDto,
  CreateLabRequestDto,
  StartLabRequestDto,
} from './dto/lab-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Xét nghiệm & Phiếu xét nghiệm (Lab Tests)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LabTestController {
  constructor(private readonly service: LabTestService) {}

  @Get('lab-types')
  @ApiOperation({ summary: 'Danh mục loại xét nghiệm LOAI_XET_NGHIEM' })
  async getLabTypes() {
    return this.service.getLabTypes();
  }

  @Get('lab-requests')
  @Roles(Role.ADMIN, Role.BAC_SI, Role.KY_THUAT_VIEN, Role.DIEU_DUONG)
  @ApiOperation({ summary: 'Danh sách phiếu xét nghiệm PHIEU_XET_NGHIEM' })
  @ApiQuery({ name: 'status', enum: ['PENDING', 'WAITING', 'IN_PROGRESS', 'COMPLETED'], required: false })
  @ApiQuery({ name: 'maLuotKham', required: false })
  async getLabRequests(
    @Query('status') status?: string,
    @Query('maLuotKham') maLuotKham?: string,
  ) {
    return this.service.getLabRequests(status, maLuotKham);
  }

  @Post('lab-requests')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Bác sĩ chỉ định PHIEU_XET_NGHIEM (chụp DonGiaXN, khóa sau thanh toán)' })
  async createLabRequest(@Body() dto: CreateLabRequestDto) {
    return this.service.createLabRequest(dto);
  }

  @Patch('lab-requests/:maPhieuXN/start')
  @Roles(Role.ADMIN, Role.KY_THUAT_VIEN)
  @ApiOperation({ summary: 'KTV bắt đầu thực hiện xét nghiệm (ghi MaNV_KTV & NgayGioXN trong 1 transaction)' })
  async startLabRequest(
    @Param('maPhieuXN') maPhieuXN: string,
    @Body() dto: StartLabRequestDto,
    @CurrentUser('maNV') currentMaNV: string,
  ) {
    return this.service.startLabRequest(maPhieuXN, dto, currentMaNV);
  }

  @Patch('lab-requests/:maPhieuXN/complete')
  @Roles(Role.ADMIN, Role.KY_THUAT_VIEN)
  @ApiOperation({ summary: 'KTV hoàn tất trả kết quả xét nghiệm (BR-V2-07)' })
  async completeLabRequest(
    @Param('maPhieuXN') maPhieuXN: string,
    @Body() dto: CompleteLabRequestDto,
    @CurrentUser('maNV') currentMaNV: string,
  ) {
    return this.service.completeLabRequest(maPhieuXN, dto, currentMaNV);
  }

  @Delete('lab-requests/:maPhieuXN')
  @Roles(Role.ADMIN, Role.BAC_SI)
  @ApiOperation({ summary: 'Hủy phiếu xét nghiệm trước thanh toán (BR-V2-08, BR-V2-13)' })
  async deleteLabRequest(@Param('maPhieuXN') maPhieuXN: string) {
    return this.service.deleteLabRequest(maPhieuXN);
  }
}
