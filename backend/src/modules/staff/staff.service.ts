import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoaiNVEnum } from '@prisma/client';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllStaff(loaiNV?: LoaiNVEnum, maKhoa?: string) {
    const where: any = {};
    if (loaiNV) where.LoaiNV = loaiNV;
    if (maKhoa) where.MaKhoa = maKhoa;

    return this.prisma.nhanVien.findMany({
      where,
      include: {
        khoa: {
          select: {
            TenKhoa: true,
          },
        },
        bacSi: true,
        dieuDuong: true,
        nvHanhChinh: true,
      },
      orderBy: { MaNV: 'asc' },
    });
  }

  async getStaffById(maNV: string) {
    const staff = await this.prisma.nhanVien.findUnique({
      where: { MaNV: maNV },
      include: {
        khoa: true,
        bacSi: true,
        dieuDuong: true,
        nvHanhChinh: true,
        lichTrucs: {
          take: 10,
          orderBy: { NgayTruc: 'desc' },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Nhân viên ${maNV} không tồn tại`);
    }

    return staff;
  }

  async getDoctors() {
    return this.prisma.bacSi.findMany({
      include: {
        nhanVien: {
          include: {
            khoa: true,
          },
        },
      },
    });
  }

  async getNurses() {
    return this.prisma.dieuDuong.findMany({
      include: {
        nhanVien: {
          include: {
            khoa: true,
          },
        },
      },
    });
  }
}
