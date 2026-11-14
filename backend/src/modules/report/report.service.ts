import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const [
      totalPatients,
      totalInpatients,
      totalDoctors,
      totalBeds,
      occupiedBeds,
      invoices,
      examCount,
    ] = await Promise.all([
      this.prisma.benhNhan.count(),
      this.prisma.bnNoiTru.count(),
      this.prisma.bacSi.count(),
      this.prisma.giuongBenh.count(),
      this.prisma.giuongBenh.count({
        where: { TrangThaiGiuong: 'DANG_SU_DUNG' },
      }),
      this.prisma.hoaDon.findMany({
        select: {
          TongTienGoc: true,
          TienBHYTChiTra: true,
          TienBenhNhanTra: true,
          TrangThaiTT: true,
        },
      }),
      this.prisma.luotKham.count(),
    ]);

    let tongDoanhThu = 0;
    let tongBHYT = 0;
    let tongThuThucTe = 0;

    for (const inv of invoices) {
      if (inv.TrangThaiTT === 'DA_THANH_TOAN') {
        tongDoanhThu += Number(inv.TongTienGoc);
        tongBHYT += Number(inv.TienBHYTChiTra);
        tongThuThucTe += Number(inv.TienBenhNhanTra);
      }
    }

    const bedOccupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

    return {
      overview: {
        totalPatients,
        totalInpatients,
        totalDoctors,
        totalBeds,
        occupiedBeds,
        bedOccupancyRate: `${bedOccupancyRate}%`,
        totalExaminations: examCount,
      },
      revenue: {
        tongDoanhThu,
        tongBHYTChiTra: tongBHYT,
        tongBenhNhanThanhToan: tongThuThucTe,
        soHoaDonDaThu: invoices.filter((i) => i.TrangThaiTT === 'DA_THANH_TOAN').length,
        soHoaDonChuaThu: invoices.filter((i) => i.TrangThaiTT === 'CHUA_THANH_TOAN').length,
      },
    };
  }
}
