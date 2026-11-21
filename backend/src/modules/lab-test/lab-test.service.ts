import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompleteLabRequestDto,
  CreateLabRequestDto,
  StartLabRequestDto,
} from './dto/lab-test.dto';
import {
  assertTruBHYTBoundsForExam,
  lockLuotKhamAndAssertUnlocked,
} from '../../common/utils/cost-lock.util';

@Injectable()
export class LabTestService {
  constructor(private prisma: PrismaService) {}

  async getLabTypes() {
    const types = await this.prisma.loaiXetNghiem.findMany({
      orderBy: { MaLoaiXN: 'asc' },
    });
    return types.map((t) => ({ ...t, DonGia: Number(t.DonGia) }));
  }

  async getLabRequests(status?: string, maLuotKham?: string) {
    const where: any = {};
    if (maLuotKham) {
      where.MaLuotKham = maLuotKham;
    }
    if (status === 'PENDING') {
      where.NgayGioTraKQ = null;
    } else if (status === 'WAITING') {
      where.NgayGioXN = null;
    } else if (status === 'IN_PROGRESS') {
      where.NgayGioXN = { not: null };
      where.NgayGioTraKQ = null;
    } else if (status === 'COMPLETED') {
      where.NgayGioTraKQ = { not: null };
    }

    const list = await this.prisma.phieuXetNghiem.findMany({
      where,
      include: {
        loaiXetNghiem: true,
        kyThuatVien: { include: { nhanVien: true } },
        luotKham: { include: { benhNhan: true, vienPhi: true } },
      },
      orderBy: { MaPhieuXN: 'asc' },
    });

    return list.map((p) => ({
      ...p,
      DonGiaXN: Number(p.DonGiaXN),
      loaiXetNghiem: { ...p.loaiXetNghiem, DonGia: Number(p.loaiXetNghiem.DonGia) },
    }));
  }

  async createLabRequest(dto: CreateLabRequestDto) {
    const maPhieuXN = dto.maPhieuXN || `PXN_${Date.now().toString().slice(-8)}`;

    const created = await this.prisma.$transaction(
      async (tx) => {
        await lockLuotKhamAndAssertUnlocked(tx, dto.maLuotKham);

        const labType = await tx.loaiXetNghiem.findUnique({
          where: { MaLoaiXN: dto.maLoaiXN },
        });
        if (!labType) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Loại xét nghiệm ${dto.maLoaiXN} không tồn tại`,
          });
        }

        return tx.phieuXetNghiem.create({
          data: {
            MaPhieuXN: maPhieuXN,
            MaLuotKham: dto.maLuotKham,
            MaLoaiXN: dto.maLoaiXN,
            MaNV_KTV: null,
            NgayGioXN: null,
            NgayGioTraKQ: null,
            KetQua: null,
            DanhGia: null,
            DonGiaXN: labType.DonGia,
          },
          include: {
            loaiXetNghiem: true,
            luotKham: true,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      ...created,
      DonGiaXN: Number(created.DonGiaXN),
      loaiXetNghiem: { ...created.loaiXetNghiem, DonGia: Number(created.loaiXetNghiem.DonGia) },
    };
  }

  // BR-V2-07 & BR-V2-08: Bắt đầu thực hiện xét nghiệm (ghi MaNV_KTV + NgayGioXN)
  async startLabRequest(maPhieuXN: string, dto: StartLabRequestDto, currentMaNV?: string) {
    const updated = await this.prisma.$transaction(
      async (tx) => {
        const pre = await tx.phieuXetNghiem.findUnique({
          where: { MaPhieuXN: maPhieuXN },
          select: { MaLuotKham: true },
        });
        if (!pre) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Phiếu xét nghiệm ${maPhieuXN} không tồn tại`,
          });
        }

        await lockLuotKhamAndAssertUnlocked(tx, pre.MaLuotKham);

        const existing = await tx.phieuXetNghiem.findUnique({
          where: { MaPhieuXN: maPhieuXN },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Phiếu xét nghiệm ${maPhieuXN} không tồn tại`,
          });
        }

        if (existing.NgayGioXN !== null || existing.NgayGioTraKQ !== null) {
          throw new ConflictException({
            ruleCode: 'BR-V2-07',
            message: `Phiếu xét nghiệm ${maPhieuXN} đã được bắt đầu hoặc hoàn tất, không thể bắt đầu lại (BR-V2-07)`,
          });
        }

        const maNV_KTV = dto.maNV_KTV || currentMaNV;
        if (!maNV_KTV) {
          throw new BadRequestException({
            ruleCode: 'BR-V2-07',
            message: 'Phải có MaNV_KTV khi bắt đầu xét nghiệm (BR-V2-07)',
          });
        }

        const ktv = await tx.kyThuatVien.findUnique({ where: { MaNV: maNV_KTV } });
        if (!ktv) {
          throw new BadRequestException({
            ruleCode: 'BR-V2-07',
            message: `Nhân viên ${maNV_KTV} không phải là Kỹ thuật viên xét nghiệm hợp lệ (KY_THUAT_VIEN)`,
          });
        }

        const ngayGioXN = dto.ngayGioXN ? new Date(dto.ngayGioXN) : new Date();
        if (Number.isNaN(ngayGioXN.getTime())) {
          throw new BadRequestException({
            ruleCode: 'VALIDATION_ERROR',
            message: 'NgayGioXN không hợp lệ',
          });
        }

        const result = await tx.phieuXetNghiem.update({
          where: { MaPhieuXN: maPhieuXN },
          data: {
            MaNV_KTV: maNV_KTV,
            NgayGioXN: ngayGioXN,
          },
          include: {
            loaiXetNghiem: true,
            kyThuatVien: { include: { nhanVien: true } },
          },
        });

        await assertTruBHYTBoundsForExam(tx, existing.MaLuotKham);
        return result;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      ...updated,
      DonGiaXN: Number(updated.DonGiaXN),
      loaiXetNghiem: { ...updated.loaiXetNghiem, DonGia: Number(updated.loaiXetNghiem.DonGia) },
    };
  }

  // BR-V2-07 & BR-V2-08: Hoàn tất trả kết quả trong 1 transaction
  async completeLabRequest(
    maPhieuXN: string,
    dto: CompleteLabRequestDto,
    currentMaNV?: string,
  ) {
    const updated = await this.prisma.$transaction(
      async (tx) => {
        const pre = await tx.phieuXetNghiem.findUnique({
          where: { MaPhieuXN: maPhieuXN },
          select: { MaLuotKham: true },
        });
        if (!pre) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Phiếu xét nghiệm ${maPhieuXN} không tồn tại`,
          });
        }

        await lockLuotKhamAndAssertUnlocked(tx, pre.MaLuotKham);

        const existing = await tx.phieuXetNghiem.findUnique({
          where: { MaPhieuXN: maPhieuXN },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Phiếu xét nghiệm ${maPhieuXN} không tồn tại`,
          });
        }

        if (existing.NgayGioTraKQ !== null) {
          throw new ConflictException({
            ruleCode: 'BR-V2-07',
            message: `Phiếu xét nghiệm ${maPhieuXN} đã trả kết quả, không thể ghi đè (BR-V2-07)`,
          });
        }

        const maNV_KTV = dto.maNV_KTV || existing.MaNV_KTV || currentMaNV;
        const ngayGioXN = dto.ngayGioXN ? new Date(dto.ngayGioXN) : existing.NgayGioXN;

        if (!maNV_KTV || !ngayGioXN) {
          throw new BadRequestException({
            ruleCode: 'BR-V2-07',
            message: 'Khi ghi nhận kết quả phải có đủ MaNV_KTV và NgayGioXN (BR-V2-07)',
          });
        }

        const ktv = await tx.kyThuatVien.findUnique({ where: { MaNV: maNV_KTV } });
        if (!ktv) {
          throw new BadRequestException({
            ruleCode: 'BR-V2-07',
            message: `Nhân viên ${maNV_KTV} không phải là Kỹ thuật viên xét nghiệm hợp lệ (KY_THUAT_VIEN)`,
          });
        }

        const ngayGioTraKQ = dto.ngayGioTraKQ ? new Date(dto.ngayGioTraKQ) : new Date();
        if (Number.isNaN(ngayGioXN.getTime()) || Number.isNaN(ngayGioTraKQ.getTime())) {
          throw new BadRequestException({
            ruleCode: 'VALIDATION_ERROR',
            message: 'Định dạng thời gian xét nghiệm không hợp lệ',
          });
        }

        if (ngayGioTraKQ < ngayGioXN) {
          throw new BadRequestException({
            ruleCode: 'BR-V2-07',
            message: 'NgayGioTraKQ phải >= NgayGioXN (BR-V2-07)',
          });
        }

        const result = await tx.phieuXetNghiem.update({
          where: { MaPhieuXN: maPhieuXN },
          data: {
            MaNV_KTV: maNV_KTV,
            NgayGioXN: ngayGioXN,
            NgayGioTraKQ: ngayGioTraKQ,
            KetQua: dto.ketQua,
            DanhGia: dto.danhGia ?? null,
          },
          include: {
            loaiXetNghiem: true,
            kyThuatVien: { include: { nhanVien: true } },
          },
        });

        await assertTruBHYTBoundsForExam(tx, existing.MaLuotKham);
        return result;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return {
      ...updated,
      DonGiaXN: Number(updated.DonGiaXN),
      loaiXetNghiem: { ...updated.loaiXetNghiem, DonGia: Number(updated.loaiXetNghiem.DonGia) },
    };
  }

  async deleteLabRequest(maPhieuXN: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.phieuXetNghiem.findUnique({
          where: { MaPhieuXN: maPhieuXN },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Phiếu xét nghiệm ${maPhieuXN} không tồn tại`,
          });
        }

        await lockLuotKhamAndAssertUnlocked(tx, existing.MaLuotKham);
        await tx.phieuXetNghiem.delete({ where: { MaPhieuXN: maPhieuXN } });
        await assertTruBHYTBoundsForExam(tx, existing.MaLuotKham);

        return { deleted: true, MaPhieuXN: maPhieuXN, MaLuotKham: existing.MaLuotKham };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
