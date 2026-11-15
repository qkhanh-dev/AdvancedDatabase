import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  CreateRoomDto,
  UpdateBedStatusDto,
  UpdateDepartmentDto,
  UpdateRoomDto,
} from './dto/department-room.dto';
import { formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';

@Injectable()
export class DepartmentRoomService {
  constructor(private prisma: PrismaService) {}

  async getAllDepartments() {
    return this.prisma.khoa.findMany({
      orderBy: { MaKhoa: 'asc' },
    });
  }

  async getDepartmentById(maKhoa: string) {
    const khoa = await this.prisma.khoa.findUnique({
      where: { MaKhoa: maKhoa },
      include: { phongs: true },
    });
    if (!khoa) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Khoa ${maKhoa} không tồn tại`,
      });
    }
    return khoa;
  }

  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.khoa.create({
      data: {
        MaKhoa: dto.maKhoa,
        TenKhoa: dto.tenKhoa,
        DiaDiem: dto.diaDiem,
        SoDienThoai: dto.soDienThoai,
      },
    });
  }

  async updateDepartment(maKhoa: string, dto: UpdateDepartmentDto) {
    const existing = await this.prisma.khoa.findUnique({ where: { MaKhoa: maKhoa } });
    if (!existing) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Khoa ${maKhoa} không tồn tại`,
      });
    }
    return this.prisma.khoa.update({
      where: { MaKhoa: maKhoa },
      data: {
        ...(dto.tenKhoa !== undefined ? { TenKhoa: dto.tenKhoa } : {}),
        ...(dto.diaDiem !== undefined ? { DiaDiem: dto.diaDiem } : {}),
        ...(dto.soDienThoai !== undefined ? { SoDienThoai: dto.soDienThoai } : {}),
      },
    });
  }

  async getRooms(maKhoa?: string) {
    return this.prisma.phong.findMany({
      where: maKhoa ? { MaKhoa: maKhoa } : undefined,
      include: {
        khoa: true,
        giuongBenhs: { orderBy: { MaGiuong: 'asc' } },
      },
      orderBy: { MaPhong: 'asc' },
    });
  }

  async createRoom(dto: CreateRoomDto) {
    const khoa = await this.prisma.khoa.findUnique({ where: { MaKhoa: dto.maKhoa } });
    if (!khoa) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Khoa ${dto.maKhoa} không tồn tại`,
      });
    }
    return this.prisma.phong.create({
      data: {
        MaPhong: dto.maPhong,
        MaKhoa: dto.maKhoa,
        TenPhong: dto.tenPhong,
        LoaiPhong: dto.loaiPhong,
        ViTri: dto.viTri,
      },
      include: { khoa: true },
    });
  }

  async updateRoom(maPhong: string, dto: UpdateRoomDto) {
    const room = await this.prisma.phong.findUnique({ where: { MaPhong: maPhong } });
    if (!room) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Phòng ${maPhong} không tồn tại`,
      });
    }
    if (dto.maKhoa !== undefined) {
      const khoa = await this.prisma.khoa.findUnique({ where: { MaKhoa: dto.maKhoa } });
      if (!khoa) {
        throw new NotFoundException({
          ruleCode: 'NOT_FOUND',
          message: `Khoa ${dto.maKhoa} không tồn tại`,
        });
      }
    }
    return this.prisma.phong.update({
      where: { MaPhong: maPhong },
      data: {
        ...(dto.maKhoa !== undefined ? { MaKhoa: dto.maKhoa } : {}),
        ...(dto.tenPhong !== undefined ? { TenPhong: dto.tenPhong } : {}),
        ...(dto.loaiPhong !== undefined ? { LoaiPhong: dto.loaiPhong } : {}),
        ...(dto.viTri !== undefined ? { ViTri: dto.viTri } : {}),
      },
      include: { khoa: true },
    });
  }

  // BR-V2-11: Trạng thái có người nằm được suy diễn hoàn toàn từ PHAN_GIUONG tại ngày tra cứu D
  async getBedMap(dateStr?: string, maKhoa?: string) {
    let targetDate: Date;
    try {
      targetDate = dateStr ? parseDateOnlyUtc(dateStr) : parseDateOnlyUtc(new Date());
    } catch {
      throw new BadRequestException({
        ruleCode: 'VALIDATION_ERROR',
        message: `Định dạng ngày không hợp lệ (cần YYYY-MM-DD): ${dateStr}`,
      });
    }

    const beds = await this.prisma.giuongBenh.findMany({
      where: maKhoa ? { phong: { MaKhoa: maKhoa } } : undefined,
      include: {
        phong: {
          include: { khoa: true },
        },
        phanGiuongs: {
          where: {
            TuNgay: { lte: targetDate },
            OR: [{ DenNgay: null }, { DenNgay: { gt: targetDate } }],
          },
          include: {
            dotNoiTru: {
              include: { benhNhan: true },
            },
          },
        },
      },
      orderBy: { MaGiuong: 'asc' },
    });

    return beds.map((bed) => {
      const activeAlloc = bed.phanGiuongs[0] ?? null;
      return {
        MaGiuong: bed.MaGiuong,
        MaPhong: bed.MaPhong,
        SoGiuong: bed.SoGiuong,
        LoaiGiuong: bed.LoaiGiuong,
        TrangThai: bed.TrangThai,
        DonGiaNgay: Number(bed.DonGiaNgay),
        phong: bed.phong,
        date: formatDateOnly(targetDate),
        dangCoNguoiNam: Boolean(activeAlloc),
        phanGiuongHienTai: activeAlloc
          ? {
              MaDotNT: activeAlloc.MaDotNT,
              MaGiuong: activeAlloc.MaGiuong,
              TuNgay: formatDateOnly(activeAlloc.TuNgay),
              DenNgay: formatDateOnly(activeAlloc.DenNgay),
              dotNoiTru: {
                ...activeAlloc.dotNoiTru,
                NgayNhapVien: formatDateOnly(activeAlloc.dotNoiTru.NgayNhapVien),
                NgayRaVien: formatDateOnly(activeAlloc.dotNoiTru.NgayRaVien),
                benhNhan: {
                  ...activeAlloc.dotNoiTru.benhNhan,
                  NgaySinh: formatDateOnly(activeAlloc.dotNoiTru.benhNhan.NgaySinh),
                },
              },
            }
          : null,
      };
    });
  }

  async updateBedStatus(maGiuong: string, dto: UpdateBedStatusDto) {
    const bed = await this.prisma.giuongBenh.findUnique({ where: { MaGiuong: maGiuong } });
    if (!bed) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Giường bệnh ${maGiuong} không tồn tại`,
      });
    }

    const updated = await this.prisma.giuongBenh.update({
      where: { MaGiuong: maGiuong },
      data: {
        TrangThai: dto.trangThai,
        ...(dto.donGiaNgay !== undefined ? { DonGiaNgay: dto.donGiaNgay } : {}),
      },
      include: { phong: true },
    });

    return {
      ...updated,
      DonGiaNgay: Number(updated.DonGiaNgay),
    };
  }
}
