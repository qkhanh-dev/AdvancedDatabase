import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDutyScheduleDto } from './dto/create-duty-schedule.dto';
import { CaTrucEnum, TrangThaiDiemDanhEnum } from '@prisma/client';

@Injectable()
export class DutyScheduleService {
  constructor(private prisma: PrismaService) {}

  // BR05: Anti-Double-Shift Validation
  async createDutySchedule(dto: CreateDutyScheduleDto) {
    const ngayTrucDate = new Date(dto.ngayTruc);

    // 1. Check existing shift on same day and shift for this staff
    const existingShift = await this.prisma.lichTruc.findUnique({
      where: {
        MaNV_NgayTruc_CaTruc: {
          MaNV: dto.maNV,
          NgayTruc: ngayTrucDate,
          CaTruc: dto.caTruc,
        },
      },
    });

    if (existingShift) {
      throw new BadRequestException(
        `Nhân viên ${dto.maNV} đã được phân công ca trực "${dto.caTruc}" vào ngày ${dto.ngayTruc} (Chống trùng ca trực BR05)`,
      );
    }

    // 2. Verify staff exists and check qualifications if doctor
    const staff = await this.prisma.nhanVien.findUnique({
      where: { MaNV: dto.maNV },
      include: { bacSi: true },
    });

    if (!staff) {
      throw new NotFoundException(`Nhân sự ${dto.maNV} không tồn tại`);
    }

    // If doctor, verify medical license CCHN
    if (staff.LoaiNV === 'BAC_SI' && !staff.bacSi?.SoCCHN) {
      throw new BadRequestException('Bác sĩ trực chính bắt buộc phải có Chứng chỉ hành nghề y tế (SoCCHN) hợp lệ!');
    }

    // 3. Verify room
    const room = await this.prisma.phong.findUnique({
      where: { MaPhong: dto.maPhong },
    });
    if (!room) {
      throw new NotFoundException(`Phòng ${dto.maPhong} không tồn tại`);
    }

    return this.prisma.lichTruc.create({
      data: {
        MaNV: dto.maNV,
        NgayTruc: ngayTrucDate,
        CaTruc: dto.caTruc,
        MaPhong: dto.maPhong,
        VaiTroTruc: dto.vaiTroTruc || null,
        TrangThaiDiemDanh: dto.trangThaiDiemDanh || TrangThaiDiemDanhEnum.CHUA_DIEM_DANH,
      },
      include: {
        nhanVien: true,
        phong: true,
      },
    });
  }

  async getSchedules(startDate?: string, endDate?: string, maNV?: string) {
    const where: any = {};
    if (maNV) {
      where.MaNV = maNV;
    }
    if (startDate && endDate) {
      where.NgayTruc = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.lichTruc.findMany({
      where,
      orderBy: [
        { NgayTruc: 'asc' },
        { CaTruc: 'asc' },
      ],
      include: {
        nhanVien: {
          include: { khoa: true },
        },
        phong: true,
      },
    });
  }

  async updateAttendance(maNV: string, ngayTruc: string, caTruc: CaTrucEnum, status: TrangThaiDiemDanhEnum) {
    return this.prisma.lichTruc.update({
      where: {
        MaNV_NgayTruc_CaTruc: {
          MaNV: maNV,
          NgayTruc: new Date(ngayTruc),
          CaTruc: caTruc,
        },
      },
      data: {
        TrangThaiDiemDanh: status,
      },
    });
  }
}
