import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExaminationDto, UpdateExaminationDto } from './dto/examination.dto';
import { TrangThaiLuotKham } from '../../common/enums/role.enum';
import { addUtcDays, formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';
import { lockLuotKhamAndAssertUnlocked } from '../../common/utils/cost-lock.util';

@Injectable()
export class ExaminationService {
  constructor(private prisma: PrismaService) {}

  private async validateDotNoiTruConstraint(
    maDotNT: string,
    maBN: string,
    ngayGioKham: Date,
  ) {
    const dot = await this.prisma.dotNoiTru.findUnique({ where: { MaDotNT: maDotNT } });
    if (!dot) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Đợt nội trú ${maDotNT} không tồn tại`,
      });
    }

    if (dot.MaBN !== maBN) {
      throw new ConflictException({
        ruleCode: 'BR-V2-04',
        message: `Đợt nội trú ${maDotNT} thuộc bệnh nhân ${dot.MaBN}, không khớp bệnh nhân ${maBN} (FK11)`,
      });
    }

    const startDay = parseDateOnlyUtc(dot.NgayNhapVien);
    if (ngayGioKham < startDay) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-04',
        message: `NgayGioKham (${ngayGioKham.toISOString()}) phải >= đầu ngày NgayNhapVien (${formatDateOnly(startDay)})`,
      });
    }

    if (dot.NgayRaVien) {
      const endExclusive = addUtcDays(parseDateOnlyUtc(dot.NgayRaVien), 1);
      if (ngayGioKham >= endExclusive) {
        throw new BadRequestException({
          ruleCode: 'BR-V2-04',
          message: `NgayGioKham (${ngayGioKham.toISOString()}) phải < đầu ngày NgayRaVien + 1 (${formatDateOnly(endExclusive)})`,
        });
      }
    }
  }

  async createExamination(dto: CreateExaminationDto) {
    const [patient, doctor] = await Promise.all([
      this.prisma.benhNhan.findUnique({ where: { MaBN: dto.maBN } }),
      this.prisma.bacSi.findUnique({ where: { MaNV: dto.maNV_BacSi } }),
    ]);

    if (!patient) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Bệnh nhân ${dto.maBN} không tồn tại`,
      });
    }
    if (!doctor) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Bác sĩ ${dto.maNV_BacSi} không tồn tại`,
      });
    }

    const ngayGioKham = dto.ngayGioKham ? new Date(dto.ngayGioKham) : new Date();
    if (Number.isNaN(ngayGioKham.getTime())) {
      throw new BadRequestException({
        ruleCode: 'VALIDATION_ERROR',
        message: 'NgayGioKham không hợp lệ',
      });
    }

    if (dto.maDotNT) {
      await this.validateDotNoiTruConstraint(dto.maDotNT, dto.maBN, ngayGioKham);
    }

    const maLuotKham = dto.maLuotKham || `LK_${Date.now().toString().slice(-8)}`;

    const created = await this.prisma.luotKham.create({
      data: {
        MaLuotKham: maLuotKham,
        MaBN: dto.maBN,
        MaNV_BacSi: dto.maNV_BacSi,
        NgayGioKham: ngayGioKham,
        LyDoKham: dto.lyDoKham,
        TrieuChung: dto.trieuChung,
        ChanDoanSoBo: dto.chanDoanSoBo,
        TrangThai: dto.trangThai ?? TrangThaiLuotKham.CHO_KHAM,
        MaDotNT: dto.maDotNT ?? null,
      },
      include: {
        benhNhan: true,
        bacSi: { include: { nhanVien: true } },
        dotNoiTru: true,
      },
    });

    return this.getExaminationById(created.MaLuotKham);
  }

  async updateExamination(maLuotKham: string, dto: UpdateExaminationDto) {
    await this.prisma.$transaction(
      async (tx) => {
        await lockLuotKhamAndAssertUnlocked(tx, maLuotKham);

        const existing = await tx.luotKham.findUnique({
          where: { MaLuotKham: maLuotKham },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Lượt khám ${maLuotKham} không tồn tại`,
          });
        }

        if (
          dto.trangThai !== undefined &&
          (existing.TrangThai === 'HOAN_TAT' || existing.TrangThai === 'HUY') &&
          dto.trangThai !== existing.TrangThai
        ) {
          throw new ConflictException({
            ruleCode: 'INVALID_STATUS_TRANSITION',
            message: `Lượt khám ${maLuotKham} đã ở trạng thái ${existing.TrangThai}, không thể chuyển sang ${dto.trangThai}`,
          });
        }

        if (dto.maDotNT !== undefined && dto.maDotNT !== null) {
          await this.validateDotNoiTruConstraint(dto.maDotNT, existing.MaBN, existing.NgayGioKham);
        }

        await tx.luotKham.update({
          where: { MaLuotKham: maLuotKham },
          data: {
            ...(dto.lyDoKham !== undefined ? { LyDoKham: dto.lyDoKham } : {}),
            ...(dto.trieuChung !== undefined ? { TrieuChung: dto.trieuChung } : {}),
            ...(dto.chanDoanSoBo !== undefined ? { ChanDoanSoBo: dto.chanDoanSoBo } : {}),
            ...(dto.trangThai !== undefined ? { TrangThai: dto.trangThai } : {}),
            ...(dto.maDotNT !== undefined ? { MaDotNT: dto.maDotNT } : {}),
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.getExaminationById(maLuotKham);
  }

  async getExaminationById(maLuotKham: string) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: maLuotKham },
      include: {
        benhNhan: { include: { theBHYTs: true } },
        bacSi: { include: { nhanVien: true } },
        dotNoiTru: true,
        donThuoc: {
          include: {
            chiTietDonThuocs: { include: { thuoc: true } },
          },
        },
        phieuXetNghiems: {
          include: {
            loaiXetNghiem: true,
            kyThuatVien: { include: { nhanVien: true } },
          },
          orderBy: { MaPhieuXN: 'asc' },
        },
        vienPhi: true,
      },
    });

    if (!exam) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Lượt khám ${maLuotKham} không tồn tại`,
      });
    }

    const [bnView, dtView, vpView] = await Promise.all([
      this.prisma.$queryRaw<Array<{ Tuoi: number }>>`
        SELECT "Tuoi" FROM "V_BENH_NHAN" WHERE "MaBN" = ${exam.MaBN}
      `,
      exam.donThuoc
        ? this.prisma.$queryRaw<Array<{ TongTienThuoc: string }>>`
            SELECT "TongTienThuoc" FROM "V_DON_THUOC" WHERE "MaDonThuoc" = ${exam.donThuoc.MaDonThuoc}
          `
        : Promise.resolve([]),
      exam.vienPhi
        ? this.prisma.$queryRaw<
            Array<{ TongTienDichVu: string; TongTienThuoc: string; ThucThu: string }>
          >`
            SELECT "TongTienDichVu", "TongTienThuoc", "ThucThu" FROM "V_VIEN_PHI" WHERE "MaHoaDon" = ${exam.vienPhi.MaHoaDon}
          `
        : Promise.resolve([]),
    ]);

    return {
      ...exam,
      benhNhan: {
        ...exam.benhNhan,
        NgaySinh: formatDateOnly(exam.benhNhan.NgaySinh),
        Tuoi: bnView[0]?.Tuoi ?? 0,
        theBHYTs: exam.benhNhan.theBHYTs.map((t) => ({
          ...t,
          MucHuong: Number(t.MucHuong),
          NgayBatDau: formatDateOnly(t.NgayBatDau),
          NgayHetHan: formatDateOnly(t.NgayHetHan),
        })),
      },
      dotNoiTru: exam.dotNoiTru
        ? {
            ...exam.dotNoiTru,
            NgayNhapVien: formatDateOnly(exam.dotNoiTru.NgayNhapVien),
            NgayRaVien: formatDateOnly(exam.dotNoiTru.NgayRaVien),
          }
        : null,
      donThuoc: exam.donThuoc
        ? {
            ...exam.donThuoc,
            NgayKeDon: formatDateOnly(exam.donThuoc.NgayKeDon),
            TongTienThuoc: Number(dtView[0]?.TongTienThuoc ?? 0),
            chiTietDonThuocs: exam.donThuoc.chiTietDonThuocs.map((ct) => ({
              ...ct,
              DonGiaKe: Number(ct.DonGiaKe),
              thuoc: { ...ct.thuoc, DonGia: Number(ct.thuoc.DonGia) },
            })),
          }
        : null,
      phieuXetNghiems: exam.phieuXetNghiems.map((pxn) => ({
        ...pxn,
        DonGiaXN: Number(pxn.DonGiaXN),
        loaiXetNghiem: { ...pxn.loaiXetNghiem, DonGia: Number(pxn.loaiXetNghiem.DonGia) },
      })),
      vienPhi: exam.vienPhi
        ? {
            ...exam.vienPhi,
            NgayLap: formatDateOnly(exam.vienPhi.NgayLap),
            TruBHYT: Number(exam.vienPhi.TruBHYT),
            TongTienDichVu: Number(vpView[0]?.TongTienDichVu ?? 0),
            TongTienThuoc: Number(vpView[0]?.TongTienThuoc ?? 0),
            ThucThu: Number(vpView[0]?.ThucThu ?? 0),
          }
        : null,
    };
  }

  async getAllExaminations(maNV_BacSi?: string, maBN?: string, maDotNT?: string) {
    return this.prisma.luotKham.findMany({
      where: {
        ...(maNV_BacSi ? { MaNV_BacSi: maNV_BacSi } : {}),
        ...(maBN ? { MaBN: maBN } : {}),
        ...(maDotNT ? { MaDotNT: maDotNT } : {}),
      },
      include: {
        benhNhan: true,
        bacSi: { include: { nhanVien: true } },
        dotNoiTru: true,
        vienPhi: true,
      },
      orderBy: { NgayGioKham: 'desc' },
    });
  }
}
