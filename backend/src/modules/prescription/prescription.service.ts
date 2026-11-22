import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePrescriptionDto,
  PrescriptionItemDto,
  UpdatePrescriptionDto,
} from './dto/prescription.dto';
import { formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';
import {
  assertTruBHYTBoundsForExam,
  lockLuotKhamAndAssertUnlocked,
} from '../../common/utils/cost-lock.util';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async getAllMedicines() {
    const meds = await this.prisma.thuoc.findMany({ orderBy: { MaThuoc: 'asc' } });
    return meds.map((m) => ({
      ...m,
      DonGia: Number(m.DonGia),
    }));
  }

  private async buildPrescriptionDetails(
    tx: Prisma.TransactionClient,
    items: PrescriptionItemDto[],
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-06',
        message: 'Đơn thuốc phải có ít nhất 1 dòng chi tiết thuốc (BR-V2-06)',
      });
    }

    const seen = new Set<string>();
    const details: Array<{
      MaThuoc: string;
      SoLuong: number;
      LieuDung: string;
      DonGiaKe: Prisma.Decimal;
    }> = [];

    for (const item of items) {
      if (seen.has(item.maThuoc)) {
        throw new BadRequestException({
          ruleCode: 'VALIDATION_ERROR',
          message: `Thuốc ${item.maThuoc} bị trùng lặp trong cùng đơn thuốc`,
        });
      }
      seen.add(item.maThuoc);

      if (!item.soLuong || item.soLuong <= 0) {
        throw new BadRequestException({
          ruleCode: 'BR-V2-06',
          message: `Số lượng thuốc ${item.maThuoc} phải > 0`,
        });
      }

      const thuoc = await tx.thuoc.findUnique({ where: { MaThuoc: item.maThuoc } });
      if (!thuoc) {
        throw new NotFoundException({
          ruleCode: 'NOT_FOUND',
          message: `Thuốc ${item.maThuoc} không tồn tại trong danh mục`,
        });
      }

      details.push({
        MaThuoc: thuoc.MaThuoc,
        SoLuong: item.soLuong,
        LieuDung: item.lieuDung,
        DonGiaKe: thuoc.DonGia,
      });
    }

    return details;
  }

  async createPrescription(dto: CreatePrescriptionDto) {
    const maDonThuoc = dto.maDonThuoc || `DT_${Date.now().toString().slice(-8)}`;
    const ngayKeDon = dto.ngayKeDon ? parseDateOnlyUtc(dto.ngayKeDon) : parseDateOnlyUtc(new Date());

    await this.prisma.$transaction(
      async (tx) => {
        await lockLuotKhamAndAssertUnlocked(tx, dto.maLuotKham);

        const existing = await tx.donThuoc.findUnique({
          where: { MaLuotKham: dto.maLuotKham },
        });
        if (existing) {
          throw new ConflictException({
            ruleCode: 'BR-V2-05',
            message: `Lượt khám ${dto.maLuotKham} đã có đơn thuốc ${existing.MaDonThuoc} (quan hệ 1 - 0..1)`,
          });
        }

        const details = await this.buildPrescriptionDetails(tx, dto.items);

        await tx.donThuoc.create({
          data: {
            MaDonThuoc: maDonThuoc,
            MaLuotKham: dto.maLuotKham,
            NgayKeDon: ngayKeDon,
            LoiDanCuaBacSi: dto.loiDanCuaBacSi,
            chiTietDonThuocs: {
              create: details,
            },
          },
        });

        await assertTruBHYTBoundsForExam(tx, dto.maLuotKham);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.getPrescriptionById(maDonThuoc);
  }

  async updatePrescription(maDonThuoc: string, dto: UpdatePrescriptionDto) {
    await this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.donThuoc.findUnique({
          where: { MaDonThuoc: maDonThuoc },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Đơn thuốc ${maDonThuoc} không tồn tại`,
          });
        }

        const targetLuotKham = dto.maLuotKham ?? existing.MaLuotKham;
        const examIds = Array.from(new Set([existing.MaLuotKham, targetLuotKham])).sort();

        for (const examId of examIds) {
          await lockLuotKhamAndAssertUnlocked(tx, examId);
        }

        if (dto.maLuotKham && dto.maLuotKham !== existing.MaLuotKham) {
          const dup = await tx.donThuoc.findUnique({
            where: { MaLuotKham: dto.maLuotKham },
          });
          if (dup) {
            throw new ConflictException({
              ruleCode: 'BR-V2-05',
              message: `Lượt khám đích ${dto.maLuotKham} đã có đơn thuốc ${dup.MaDonThuoc}`,
            });
          }
        }

        if (dto.items !== undefined) {
          const details = await this.buildPrescriptionDetails(tx, dto.items);
          await tx.chiTietDonThuoc.deleteMany({ where: { MaDonThuoc: maDonThuoc } });
          await tx.chiTietDonThuoc.createMany({
            data: details.map((d) => ({
              MaDonThuoc: maDonThuoc,
              ...d,
            })),
          });
        }

        await tx.donThuoc.update({
          where: { MaDonThuoc: maDonThuoc },
          data: {
            ...(dto.ngayKeDon !== undefined ? { NgayKeDon: parseDateOnlyUtc(dto.ngayKeDon) } : {}),
            ...(dto.loiDanCuaBacSi !== undefined ? { LoiDanCuaBacSi: dto.loiDanCuaBacSi } : {}),
            ...(dto.maLuotKham !== undefined ? { MaLuotKham: dto.maLuotKham } : {}),
          },
        });

        for (const examId of examIds) {
          await assertTruBHYTBoundsForExam(tx, examId);
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.getPrescriptionById(maDonThuoc);
  }

  async deletePrescription(maDonThuoc: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.donThuoc.findUnique({
          where: { MaDonThuoc: maDonThuoc },
        });
        if (!existing) {
          throw new NotFoundException({
            ruleCode: 'NOT_FOUND',
            message: `Đơn thuốc ${maDonThuoc} không tồn tại`,
          });
        }

        await lockLuotKhamAndAssertUnlocked(tx, existing.MaLuotKham);

        await tx.chiTietDonThuoc.deleteMany({ where: { MaDonThuoc: maDonThuoc } });
        await tx.donThuoc.delete({ where: { MaDonThuoc: maDonThuoc } });

        await assertTruBHYTBoundsForExam(tx, existing.MaLuotKham);

        return {
          deleted: true,
          MaDonThuoc: maDonThuoc,
          MaLuotKham: existing.MaLuotKham,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async getPrescriptionById(maDonThuoc: string) {
    const don = await this.prisma.donThuoc.findUnique({
      where: { MaDonThuoc: maDonThuoc },
      include: {
        luotKham: { include: { benhNhan: true } },
        chiTietDonThuocs: {
          include: { thuoc: true },
          orderBy: { MaThuoc: 'asc' },
        },
      },
    });

    if (!don) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Đơn thuốc ${maDonThuoc} không tồn tại`,
      });
    }

    const viewRows = await this.prisma.$queryRaw<Array<{ TongTienThuoc: string }>>`
      SELECT "TongTienThuoc" FROM "V_DON_THUOC" WHERE "MaDonThuoc" = ${maDonThuoc}
    `;

    return {
      MaDonThuoc: don.MaDonThuoc,
      MaLuotKham: don.MaLuotKham,
      NgayKeDon: formatDateOnly(don.NgayKeDon),
      LoiDanCuaBacSi: don.LoiDanCuaBacSi,
      TongTienThuoc: Number(viewRows[0]?.TongTienThuoc ?? 0),
      luotKham: don.luotKham,
      chiTietDonThuocs: don.chiTietDonThuocs.map((ct) => ({
        MaDonThuoc: ct.MaDonThuoc,
        MaThuoc: ct.MaThuoc,
        SoLuong: ct.SoLuong,
        LieuDung: ct.LieuDung,
        DonGiaKe: Number(ct.DonGiaKe),
        thuoc: {
          ...ct.thuoc,
          DonGia: Number(ct.thuoc.DonGia),
        },
      })),
    };
  }
}
