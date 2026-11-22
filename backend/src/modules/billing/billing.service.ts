import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, PayInvoiceDto } from './dto/billing.dto';
import { TrangThaiThanhToan } from '../../common/enums/role.enum';
import { formatDateOnly, parseDateOnlyUtc, roundMoney2 } from '../../common/utils/date.util';
import {
  assertTruBHYTBoundsForExam,
  computeExamCostSummary,
  lockLuotKhamAndAssertUnlocked,
} from '../../common/utils/cost-lock.util';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  private async readVienPhiView(tx: Prisma.TransactionClient, maHoaDon: string) {
    const rows = await tx.$queryRaw<
      Array<{
        MaHoaDon: string;
        MaLuotKham: string;
        NgayLap: Date;
        HinhThucThanhToan: string;
        TruBHYT: string;
        TrangThaiThanhToan: string;
        TongTienDichVu: string;
        TongTienThuoc: string;
        ThucThu: string;
      }>
    >`
      SELECT "MaHoaDon", "MaLuotKham", "NgayLap", "HinhThucThanhToan", "TruBHYT",
             "TrangThaiThanhToan", "TongTienDichVu", "TongTienThuoc", "ThucThu"
      FROM "V_VIEN_PHI"
      WHERE "MaHoaDon" = ${maHoaDon}
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      MaHoaDon: r.MaHoaDon,
      MaLuotKham: r.MaLuotKham,
      NgayLap: formatDateOnly(r.NgayLap),
      HinhThucThanhToan: r.HinhThucThanhToan,
      TruBHYT: Number(r.TruBHYT),
      TrangThaiThanhToan: r.TrangThaiThanhToan,
      TongTienDichVu: Number(r.TongTienDichVu),
      TongTienThuoc: Number(r.TongTienThuoc),
      ThucThu: Number(r.ThucThu),
    };
  }

  // BR-V2-08: Tính xem trước từ VIEW / Query (chỉ tính phiếu XN có NgayGioXN IS NOT NULL, không tính tiền giường/khám)
  async previewBilling(maLuotKham: string) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: maLuotKham },
      include: {
        benhNhan: {
          include: { theBHYTs: { orderBy: { MucHuong: 'desc' } } },
        },
        donThuoc: {
          include: { chiTietDonThuocs: { include: { thuoc: true } } },
        },
        phieuXetNghiems: {
          include: { loaiXetNghiem: true },
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

    const summary = await computeExamCostSummary(this.prisma, maLuotKham);
    const examDate = parseDateOnlyUtc(exam.NgayGioKham);

    const validCards = exam.benhNhan.theBHYTs
      .filter((c) => {
        const start = parseDateOnlyUtc(c.NgayBatDau);
        const end = parseDateOnlyUtc(c.NgayHetHan);
        return start <= examDate && examDate <= end;
      })
      .map((c) => ({
        MaTheBHYT: c.MaTheBHYT,
        MaBN: c.MaBN,
        MucHuong: Number(c.MucHuong),
        NgayBatDau: formatDateOnly(c.NgayBatDau),
        NgayHetHan: formatDateOnly(c.NgayHetHan),
      }));

    const vienPhi = exam.vienPhi
      ? await this.readVienPhiView(this.prisma, exam.vienPhi.MaHoaDon)
      : null;

    return {
      MaLuotKham: exam.MaLuotKham,
      MaBN: exam.MaBN,
      NgayKham: formatDateOnly(examDate),
      TongTienThuoc: summary.TongTienThuoc,
      TongTienDichVu: summary.TongTienDichVu,
      TongChiPhi: summary.TongChiPhi,
      theBHYTHopLe: validCards,
      vienPhi,
    };
  }

  // BR-V2-05, BR-V2-08, BR-V2-13: Lập VIEN_PHI cho MaLuotKham với khóa dữ liệu chi phí
  async createInvoice(dto: CreateInvoiceDto) {
    const maHoaDon = dto.maHoaDon || `HD_${Date.now().toString().slice(-8)}`;
    const ngayLap = dto.ngayLap ? parseDateOnlyUtc(dto.ngayLap) : parseDateOnlyUtc(new Date());

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await lockLuotKhamAndAssertUnlocked(tx, dto.maLuotKham);

          const exam = await tx.luotKham.findUnique({
            where: { MaLuotKham: dto.maLuotKham },
            include: { vienPhi: true },
          });
          if (!exam) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Lượt khám ${dto.maLuotKham} không tồn tại`,
            });
          }

          if (exam.vienPhi) {
            throw new ConflictException({
              ruleCode: 'BR-V2-05',
              message: `Lượt khám ${dto.maLuotKham} đã có hóa đơn viện phí ${exam.vienPhi.MaHoaDon} (quan hệ 1 - 0..1)`,
            });
          }

          const { TongTienThuoc, TongTienDichVu, TongChiPhi } =
            await computeExamCostSummary(tx, dto.maLuotKham);

          let truBHYT = 0;
          if (dto.maTheBHYT) {
            const card = await tx.theBHYT.findUnique({
              where: { MaTheBHYT: dto.maTheBHYT },
            });
            if (!card) {
              throw new NotFoundException({
                ruleCode: 'NOT_FOUND',
                message: `Thẻ BHYT ${dto.maTheBHYT} không tồn tại`,
              });
            }
            if (card.MaBN !== exam.MaBN) {
              throw new BadRequestException({
                ruleCode: 'BR-V2-08',
                message: `Thẻ BHYT ${dto.maTheBHYT} không thuộc bệnh nhân ${exam.MaBN} của lượt khám`,
              });
            }

            const examDate = parseDateOnlyUtc(exam.NgayGioKham);
            const start = parseDateOnlyUtc(card.NgayBatDau);
            const end = parseDateOnlyUtc(card.NgayHetHan);
            if (examDate < start || examDate > end) {
              throw new BadRequestException({
                ruleCode: 'BR-V2-08',
                message: `Thẻ BHYT ${dto.maTheBHYT} không còn hiệu lực tại ngày khám ${formatDateOnly(examDate)}`,
              });
            }

            truBHYT = roundMoney2(TongChiPhi * Number(card.MucHuong));
          }

          if (truBHYT < 0 || truBHYT > TongChiPhi) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-08',
              message: `TruBHYT (${truBHYT}) vượt quá tổng chi phí hợp lệ (${TongChiPhi})`,
            });
          }

          await tx.vienPhi.create({
            data: {
              MaHoaDon: maHoaDon,
              MaLuotKham: dto.maLuotKham,
              NgayLap: ngayLap,
              HinhThucThanhToan: dto.hinhThucThanhToan,
              TruBHYT: truBHYT,
              TrangThaiThanhToan: TrangThaiThanhToan.CHUA_THANH_TOAN,
            },
          });

          const viewData = await this.readVienPhiView(tx, maHoaDon);
          return (
            viewData ?? {
              MaHoaDon: maHoaDon,
              MaLuotKham: dto.maLuotKham,
              NgayLap: formatDateOnly(ngayLap),
              HinhThucThanhToan: dto.hinhThucThanhToan,
              TruBHYT: truBHYT,
              TrangThaiThanhToan: TrangThaiThanhToan.CHUA_THANH_TOAN,
              TongTienDichVu,
              TongTienThuoc,
              ThucThu: roundMoney2(TongChiPhi - truBHYT),
            }
          );
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException({
          ruleCode: 'BR-V2-08',
          message: 'Xung đột đồng thời khi lập hóa đơn viện phí',
        });
      }
      throw error;
    }
  }

  // BR-V2-08 & BR-V2-13: Chốt thanh toán dùng cùng cơ chế khóa với thay đổi chi phí
  async payInvoice(maHoaDon: string, dto: PayInvoiceDto) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const existing = await tx.vienPhi.findUnique({
            where: { MaHoaDon: maHoaDon },
          });
          if (!existing) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Hóa đơn ${maHoaDon} không tồn tại`,
            });
          }

          await lockLuotKhamAndAssertUnlocked(tx, existing.MaLuotKham);
          await assertTruBHYTBoundsForExam(tx, existing.MaLuotKham);

          await tx.vienPhi.update({
            where: { MaHoaDon: maHoaDon },
            data: {
              TrangThaiThanhToan: TrangThaiThanhToan.DA_THANH_TOAN,
              ...(dto.hinhThucThanhToan ? { HinhThucThanhToan: dto.hinhThucThanhToan } : {}),
            },
          });

          return this.readVienPhiView(tx, maHoaDon);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new ConflictException({
          ruleCode: 'BR-V2-08',
          message: 'Xung đột đồng thời khi chốt thanh toán viện phí',
        });
      }
      throw error;
    }
  }

  async getInvoiceById(maHoaDon: string) {
    const viewData = await this.readVienPhiView(this.prisma, maHoaDon);
    if (!viewData) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Hóa đơn ${maHoaDon} không tồn tại`,
      });
    }

    const detail = await this.prisma.vienPhi.findUnique({
      where: { MaHoaDon: maHoaDon },
      include: {
        luotKham: {
          include: {
            benhNhan: true,
            bacSi: { include: { nhanVien: true } },
          },
        },
      },
    });

    return {
      ...viewData,
      luotKham: detail?.luotKham,
    };
  }
}
