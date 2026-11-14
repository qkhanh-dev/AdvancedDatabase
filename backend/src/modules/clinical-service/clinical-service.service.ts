import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignServiceDto } from './dto/assign-service.dto';
import { UpdateServiceResultDto } from './dto/update-result.dto';

@Injectable()
export class ClinicalServiceService {
  constructor(private prisma: PrismaService) {}

  async getAllServices() {
    return this.prisma.dichVu.findMany({
      orderBy: { MaDV: 'asc' },
    });
  }

  async assignService(dto: AssignServiceDto) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: dto.maLuotKham },
    });
    if (!exam) {
      throw new NotFoundException(`Lượt khám ${dto.maLuotKham} không tồn tại`);
    }

    const dv = await this.prisma.dichVu.findUnique({
      where: { MaDV: dto.maDV },
    });
    if (!dv) {
      throw new NotFoundException(`Dịch vụ ${dto.maDV} không tồn tại`);
    }

    return this.prisma.suDungDv.create({
      data: {
        MaLuotKham: dto.maLuotKham,
        MaDV: dto.maDV,
        ThoiGianChiDinh: new Date(),
        SoLuong: dto.soLuong || 1,
        DonGiaDV: dv.DonGiaHienHanh, // Snapshot price
        KetQuaCLS: null,
      },
      include: {
        dichVu: true,
      },
    });
  }

  async updateResult(dto: UpdateServiceResultDto) {
    // Verify Technician is DIEU_DUONG
    const ktv = await this.prisma.dieuDuong.findUnique({
      where: { MaNV: dto.maKTVThucHien },
    });
    if (!ktv) {
      throw new BadRequestException(`Kỹ thuật viên / Điều dưỡng ${dto.maKTVThucHien} không hợp lệ`);
    }

    const record = await this.prisma.suDungDv.findUnique({
      where: {
        MaLuotKham_MaDV_ThoiGianChiDinh: {
          MaLuotKham: dto.maLuotKham,
          MaDV: dto.maDV,
          ThoiGianChiDinh: new Date(dto.thoiGianChiDinh),
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy chỉ định dịch vụ tương ứng');
    }

    return this.prisma.suDungDv.update({
      where: {
        MaLuotKham_MaDV_ThoiGianChiDinh: {
          MaLuotKham: dto.maLuotKham,
          MaDV: dto.maDV,
          ThoiGianChiDinh: new Date(dto.thoiGianChiDinh),
        },
      },
      data: {
        KetQuaCLS: dto.ketQuaCLS,
        MaKTVThucHien: dto.maKTVThucHien,
      },
      include: {
        dichVu: true,
        ktvThucHien: {
          include: { nhanVien: true },
        },
      },
    });
  }

  async getPendingRequests() {
    return this.prisma.suDungDv.findMany({
      where: {
        KetQuaCLS: null,
      },
      include: {
        dichVu: true,
        luotKham: {
          include: {
            benhNhan: true,
            bacSi: {
              include: { nhanVien: true },
            },
          },
        },
      },
      orderBy: { ThoiGianChiDinh: 'asc' },
    });
  }
}
