import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DepartmentRoomService } from './department-room.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import {
  CreateDepartmentDto,
  CreateRoomDto,
  UpdateBedStatusDto,
  UpdateDepartmentDto,
  UpdateRoomDto,
} from './dto/department-room.dto';

@ApiTags('Cơ sở vật chất & Khoa phòng (Department & Room)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DepartmentRoomController {
  constructor(private readonly service: DepartmentRoomService) {}

  @Get('departments')
  @ApiOperation({ summary: 'Danh sách các chuyên khoa (KHOA)' })
  async getAllDepartments() {
    return this.service.getAllDepartments();
  }

  @Get('departments/:maKhoa')
  @ApiOperation({ summary: 'Chi tiết chuyên khoa' })
  async getDepartmentById(@Param('maKhoa') maKhoa: string) {
    return this.service.getDepartmentById(maKhoa);
  }

  @Post('departments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo chuyên khoa mới' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.service.createDepartment(dto);
  }

  @Patch('departments/:maKhoa')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật chuyên khoa' })
  async updateDepartment(@Param('maKhoa') maKhoa: string, @Body() dto: UpdateDepartmentDto) {
    return this.service.updateDepartment(maKhoa, dto);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Danh sách phòng (PHONG)' })
  @ApiQuery({ name: 'maKhoa', required: false })
  async getRooms(@Query('maKhoa') maKhoa?: string) {
    return this.service.getRooms(maKhoa);
  }

  @Post('rooms')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo phòng mới' })
  async createRoom(@Body() dto: CreateRoomDto) {
    return this.service.createRoom(dto);
  }

  @Patch('rooms/:maPhong')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật phòng' })
  async updateRoom(@Param('maPhong') maPhong: string, @Body() dto: UpdateRoomDto) {
    return this.service.updateRoom(maPhong, dto);
  }

  @Get('beds/map')
  @ApiOperation({ summary: 'Sơ đồ giường bệnh tại ngày D (BR-V2-11: tách bạch TrangThai và PHAN_GIUONG)' })
  @ApiQuery({ name: 'date', required: false, example: '2026-11-15' })
  @ApiQuery({ name: 'maKhoa', required: false })
  async getBedMap(@Query('date') date?: string, @Query('maKhoa') maKhoa?: string) {
    return this.service.getBedMap(date, maKhoa);
  }

  @Patch('beds/:maGiuong/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cập nhật tình trạng khai thác giường (SAN_SANG | BAO_TRI | NGUNG_SU_DUNG)' })
  async updateBedStatus(@Param('maGiuong') maGiuong: string, @Body() dto: UpdateBedStatusDto) {
    return this.service.updateBedStatus(maGiuong, dto);
  }
}
