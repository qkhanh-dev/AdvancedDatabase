import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';
import { TrangThaiGiuong, TrangThaiThanhToan } from '../../common/enums/role.enum';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(dateStr?: string) {
    let targetDate: Date;
    try {
      targetDate = dateStr ? parseDateOnlyUtc(dateStr) : parseDateOnlyUtc(new Date());
    } catch {
      throw new BadRequestException({
        ruleCode: 'VALIDATION_ERROR',
        message: `Định dạng ngày không hợp lệ (cần YYYY-MM-DD): ${dateStr}`,
      });
    }

    const [
      tongBenhNhan,
      tongLuotKham,
      soDotNoiTruDangMo,
      beds,
      occupiedBedRows,
      revenueRows,
    ] = await Promise.all([
      this.prisma.benhNhan.count(),
      this.prisma.luotKham.count(),
      this.prisma.dotNoiTru.count({ where: { NgayRaVien: null } }),
      this.prisma.giuongBenh.findMany(),
      this.prisma.phanGiuong.findMany({
        where: {
          TuNgay: { lte: targetDate },
          OR: [{ DenNgay: null }, { DenNgay: { gt: targetDate } }],
        },
        select: { MaGiuong: true },
        distinct: ['MaGiuong'],
      }),
      this.prisma.$queryRaw<
        Array<{
          TrangThaiThanhToan: string;
          tong_tien_thuoc: string;
          tong_tien_dich_vu: string;
          tong_tru_bhyt: string;
          tong_thuc_thu: string;
          so_hoa_don: bigint;
        }>
      >`
        SELECT
          "TrangThaiThanhToan",
          COALESCE(SUM("TongTienThuoc"), 0)::DECIMAL(18,2) AS tong_tien_thuoc,
          COALESCE(SUM("TongTienDichVu"), 0)::DECIMAL(18,2) AS tong_tien_dich_vu,
          COALESCE(SUM("TruBHYT"), 0)::DECIMAL(18,2) AS tong_tru_bhyt,
          COALESCE(SUM("ThucThu"), 0)::DECIMAL(18,2) AS tong_thuc_thu,
          COUNT(*) AS so_hoa_don
        FROM "V_VIEN_PHI"
        GROUP BY "TrangThaiThanhToan"
      `,
    ]);

    const tongGiuong = beds.length;
    const giuongSanSang = beds.filter((b) => b.TrangThai === TrangThaiGiuong.SAN_SANG).length;
    const giuongBaoTri = beds.filter((b) => b.TrangThai === TrangThaiGiuong.BAO_TRI).length;
    const giuongNgungSuDung = beds.filter(
      (b) => b.TrangThai === TrangThaiGiuong.NGUNG_SU_DUNG,
    ).length;
    const giuongDangCoNguoiNam = occupiedBedRows.length;
    const tyLeLapDay =
      giuongSanSang > 0 ? Math.round((giuongDangCoNguoiNam / giuongSanSang) * 10000) / 100 : 0;

    let daThanhToan = {
      soHoaDon: 0,
      TongTienThuoc: 0,
      TongTienDichVu: 0,
      TruBHYT: 0,
      ThucThu: 0,
    };
    let chuaThanhToan = {
      soHoaDon: 0,
      TongTienThuoc: 0,
      TongTienDichVu: 0,
      TruBHYT: 0,
      ThucThu: 0,
    };

    for (const row of revenueRows) {
      const target =
        row.TrangThaiThanhToan === TrangThaiThanhToan.DA_THANH_TOAN
          ? daThanhToan
          : chuaThanhToan;
      target.soHoaDon = Number(row.so_hoa_don);
      target.TongTienThuoc = Number(row.tong_tien_thuoc);
      target.TongTienDichVu = Number(row.tong_tien_dich_vu);
      target.TruBHYT = Number(row.tong_tru_bhyt);
      target.ThucThu = Number(row.tong_thuc_thu);
    }

    return {
      date: formatDateOnly(targetDate),
      tongBenhNhan,
      tongLuotKham,
      soDotNoiTruDangMo,
      congSuatGiuong: {
        tongGiuong,
        giuongSanSang,
        giuongBaoTri,
        giuongNgungSuDung,
        giuongDangCoNguoiNam,
        tyLeLapDay,
      },
      doanhThu: {
        TongTienThuoc: daThanhToan.TongTienThuoc + chuaThanhToan.TongTienThuoc,
        TongTienDichVu: daThanhToan.TongTienDichVu + chuaThanhToan.TongTienDichVu,
        TruBHYT: daThanhToan.TruBHYT + chuaThanhToan.TruBHYT,
        ThucThu: daThanhToan.ThucThu + chuaThanhToan.ThucThu,
        daThanhToan,
        chuaThanhToan,
      },
    };
  }
}
