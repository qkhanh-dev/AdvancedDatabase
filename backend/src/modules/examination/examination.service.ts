import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';

@Injectable()
export class ExaminationService {
  constructor(private prisma: PrismaService) {}

  async createExamination(dto: CreateExaminationDto) {
    const maLK = dto.maLuotKham || `LK${Date.now().toString().slice(-8)}`;

    // Verify room is KHAM (C02/Business Rule)
    const phong = await this.prisma.phong.findUnique({
      where: { MaPhong: dto.maPhongKham },
    });
    if (!phong || phong.LoaiPhong !== 'KHAM') {
      throw new BadRequestException(`Phòng khám ${dto.maPhongKham} không hợp lệ (Phải là phòng có loại KHAM)`);
    }

    // Verify Doctor is BAC_SI (C03)
    const bacSi = await this.prisma.bacSi.findUnique({
      where: { MaNV: dto.maBS },
    });
    if (!bacSi) {
      throw new BadRequestException(`Bác sĩ ${dto.maBS} không tồn tại trong danh mục Bác sĩ điều trị`);
    }

    return this.prisma.luotKham.create({
      data: {
        MaLuotKham: maLK,
        ThoiGianKham: new Date(),
        TrieuChung: dto.trieuChung,
        HuyetAp: dto.huyetAp || null,
        NhietDo: dto.nhietDo || null,
        Mach: dto.mach || null,
        ChanDoanSoBo: dto.chanDoanSoBo,
        HuongXuTri: dto.huongXuTri,
        NgayTaiKham: dto.ngayTaiKham ? new Date(dto.ngayTaiKham) : null,
        MaBN: dto.maBN,
        MaBS: dto.maBS,
        MaPhongKham: dto.maPhongKham,
      },
      include: {
        benhNhan: true,
        bacSi: {
          include: {
            nhanVien: true,
          },
        },
        phongKham: true,
      },
    });
  }

  async updateDiagnosis(id: string, dto: UpdateDiagnosisDto) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: id },
    });
    if (!exam) {
      throw new NotFoundException(`Lượt khám ${id} không tồn tại`);
    }

    return this.prisma.luotKham.update({
      where: { MaLuotKham: id },
      data: {
        ChanDoanXacDinh: dto.chanDoanXacDinh,
        HuongXuTri: dto.huongXuTri,
        NgayTaiKham: dto.ngayTaiKham ? new Date(dto.ngayTaiKham) : null,
      },
      include: {
        benhNhan: true,
        bacSi: {
          include: { nhanVien: true },
        },
        donThuoc: true,
        suDungDvs: {
          include: { dichVu: true },
        },
      },
    });
  }

  async getExaminationById(id: string) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: id },
      include: {
        benhNhan: true,
        bacSi: {
          include: { nhanVien: true },
        },
        phongKham: true,
        donThuoc: {
          include: {
            ctDonThuocs: {
              include: { thuoc: true },
            },
          },
        },
        suDungDvs: {
          include: {
            dichVu: true,
            ktvThucHien: {
              include: { nhanVien: true },
            },
          },
        },
        hoaDon: true,
      },
    });

    if (!exam) {
      throw new NotFoundException(`Không tìm thấy lượt khám ${id}`);
    }

    return exam;
  }

  async getAllExaminations(maBS?: string, maBN?: string) {
    const where: any = {};
    if (maBS) where.MaBS = maBS;
    if (maBN) where.MaBN = maBN;

    return this.prisma.luotKham.findMany({
      where,
      orderBy: { ThoiGianKham: 'desc' },
      include: {
        benhNhan: {
          select: {
            MaBN: true,
            HoTen: true,
            GioiTinh: true,
            NgaySinh: true,
            SoBHYT: true,
          },
        },
        bacSi: {
          include: {
            nhanVien: {
              select: { HoTen: true },
            },
          },
        },
        phongKham: true,
      },
    });
  }
}
