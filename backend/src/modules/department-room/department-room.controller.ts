import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DepartmentRoomService } from './department-room.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Cơ sở vật chất & Khoa phòng (Department & Room)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DepartmentRoomController {
  constructor(private readonly service: DepartmentRoomService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Lấy danh sách các chuyên khoa y tế' })
  async getAllDepartments() {
    return this.service.getAllDepartments();
  }

  @Get('departments/:maKhoa')
  @ApiOperation({ summary: 'Lấy chi tiết chuyên khoa' })
  async getDepartmentById(@Param('maKhoa') maKhoa: string) {
    return this.service.getDepartmentById(maKhoa);
  }

  @Get('rooms/available')
  @ApiOperation({ summary: 'Tra cứu danh sách buồng bệnh/phòng khám còn chỗ trống' })
  @ApiQuery({ name: 'maKhoa', required: false, description: 'Lọc theo mã khoa' })
  async getAvailableRooms(@Query('maKhoa') maKhoa?: string) {
    return this.service.getAvailableRooms(maKhoa);
  }

  @Get('beds/map')
  @ApiOperation({ summary: 'Lấy sơ đồ trạng thái toàn bộ giường bệnh nội trú' })
  async getBedMap() {
    return this.service.getBedMap();
  }
}
