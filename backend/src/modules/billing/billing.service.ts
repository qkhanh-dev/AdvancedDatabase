import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { VietQrWebhookDto } from './dto/vietqr-webhook.dto';
import { PhuongThucTTEnum, TrangThaiTTEnum } from '@prisma/client';
import PDFDocument from 'pdfkit';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  // BR03: Formula for Total Cost & BHYT Deduction
  async calculateFee(examId: string) {
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: examId },
      include: {
        benhNhan: {
          include: {
            bnNoiTru: {
              include: {
                phanGiuongs: {
                  include: { giuongBenh: true },
                },
              },
            },
          },
        },
        donThuoc: {
          include: {
            ctDonThuocs: {
              include: { thuoc: true },
            },
          },
        },
        suDungDvs: {
          include: { dichVu: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException(`Lượt khám ${examId} không tồn tại`);
    }

    const tienKham = 50000; // Standard clinical consultation fee

    // 1. Medicines cost
    let tienThuoc = 0;
    if (exam.donThuoc) {
      for (const item of exam.donThuoc.ctDonThuocs) {
        tienThuoc += Number(item.DonGiaBan) * item.SoLuong;
      }
    }

    // 2. Clinical services cost
    let tienDichVu = 0;
    let tienDichVuBHYT = 0;
    for (const dv of exam.suDungDvs) {
      const itemCost = Number(dv.DonGiaDV) * dv.SoLuong;
      tienDichVu += itemCost;
      if (dv.dichVu.ThuocBHYTChiTra) {
        tienDichVuBHYT += itemCost;
      }
    }

    // 3. Inpatient Bed cost
    let tienGiuong = 0;
    if (exam.benhNhan.bnNoiTru) {
      for (const pg of exam.benhNhan.bnNoiTru.phanGiuongs) {
        const start = new Date(pg.NgayBatDau).getTime();
        const end = pg.NgayKetThuc ? new Date(pg.NgayKetThuc).getTime() : Date.now();
        const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        tienGiuong += Number(pg.GiaGiuongNgay) * diffDays;
      }
    }

    // TongTienGoc
    const tongTienGoc = tienKham + tienThuoc + tienDichVu + tienGiuong;

    // BHYT calculation based on MucHuongBHYT (80%, 95%, 100%)
    const mucHuong = exam.benhNhan.MucHuongBHYT ? exam.benhNhan.MucHuongBHYT / 100 : 0;
    const tienBHYTChiTra = Math.round((tienKham + tienDichVuBHYT) * mucHuong);
    const tienBenhNhanTra = Math.max(0, tongTienGoc - tienBHYTChiTra);

    return {
      maLuotKham: examId,
      benhNhan: {
        maBN: exam.benhNhan.MaBN,
        hoTen: exam.benhNhan.HoTen,
        soBHYT: exam.benhNhan.SoBHYT,
        mucHuongBHYT: exam.benhNhan.MucHuongBHYT || 0,
      },
      chiTiet: {
        tienKham,
        tienThuoc,
        tienDichVu,
        tienGiuong,
      },
      tongTienGoc,
      tienBHYTChiTra,
      tienBenhNhanTra,
    };
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const maHD = dto.maHD || `HD${Date.now().toString().slice(-8)}`;

    // Verify existing invoice
    const existing = await this.prisma.hoaDon.findUnique({
      where: { MaLuotKham: dto.maLuotKham },
    });
    if (existing) {
      throw new BadRequestException(`Lượt khám ${dto.maLuotKham} đã được lập hóa đơn`);
    }

    // Verify cashier
    const cashier = await this.prisma.nvHanhChinh.findUnique({
      where: { MaNV: dto.maNVThuNgan },
    });
    if (!cashier) {
      throw new BadRequestException(`Thu ngân ${dto.maNVThuNgan} không hợp lệ (Phải là NV_HANH_CHINH)`);
    }

    const calculation = await this.calculateFee(dto.maLuotKham);

    return this.prisma.hoaDon.create({
      data: {
        MaHD: maHD,
        NgayLap: new Date(),
        TongTienGoc: calculation.tongTienGoc,
        TienBHYTChiTra: calculation.tienBHYTChiTra,
        TienBenhNhanTra: calculation.tienBenhNhanTra,
        PhuongThucTT: dto.phuongThucTT,
        TrangThaiTT: TrangThaiTTEnum.CHUA_THANH_TOAN,
        MaLuotKham: dto.maLuotKham,
        MaNVThuNgan: dto.maNVThuNgan,
      },
      include: {
        luotKham: {
          include: { benhNhan: true },
        },
        thuNgan: {
          include: { nhanVien: true },
        },
      },
    });
  }

  // BR06: Idempotent Webhook Processing for VietQR
  async handleVietQrWebhook(dto: VietQrWebhookDto) {
    const invoice = await this.prisma.hoaDon.findUnique({
      where: { MaHD: dto.maHD },
    });

    if (!invoice) {
      throw new NotFoundException(`Hóa đơn ${dto.maHD} không tồn tại`);
    }

    // Idempotency: If already paid, return OK immediately without double accounting
    if (invoice.TrangThaiTT === TrangThaiTTEnum.DA_THANH_TOAN) {
      return {
        success: true,
        message: 'Hóa đơn đã được thanh toán trước đó (Idempotent response)',
        maHD: invoice.MaHD,
        trangThai: invoice.TrangThaiTT,
      };
    }

    const updated = await this.prisma.hoaDon.update({
      where: { MaHD: dto.maHD },
      data: {
        TrangThaiTT: TrangThaiTTEnum.DA_THANH_TOAN,
        PhuongThucTT: PhuongThucTTEnum.CHUYEN_KHOAN,
      },
    });

    return {
      success: true,
      message: 'Gạch nợ hóa đơn thành công qua VietQR',
      maHD: updated.MaHD,
      trangThai: updated.TrangThaiTT,
    };
  }

  async generateInvoicePdf(maHD: string): Promise<Buffer> {
    const invoice = await this.prisma.hoaDon.findUnique({
      where: { MaHD: maHD },
      include: {
        luotKham: {
          include: {
            benhNhan: true,
            bacSi: { include: { nhanVien: true } },
            donThuoc: {
              include: {
                ctDonThuocs: { include: { thuoc: true } },
              },
            },
            suDungDvs: { include: { dichVu: true } },
          },
        },
        thuNgan: {
          include: { nhanVien: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Hóa đơn ${maHD} không tồn tại`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(18).text('BENH VIEN DA KHOA DAI HOC SAI GON (SGU)', { align: 'center' });
      doc.fontSize(10).text('105 Ba Huyen Thanh Quan, Quan 3, TP. Ho Chi Minh', { align: 'center' });
      doc.fontSize(14).text('HOA DON VIEN PHI & BIEN LAI THANH TOAN', { align: 'center' });
      doc.moveDown();

      // Invoice info
      doc.fontSize(10);
      doc.text(`Ma hoa don: ${invoice.MaHD} | Ngay lap: ${new Date(invoice.NgayLap).toLocaleString('vi-VN')}`);
      doc.text(`Benh nhan: ${invoice.luotKham.benhNhan.HoTen} (Ma BN: ${invoice.luotKham.benhNhan.MaBN})`);
      doc.text(`So the BHYT: ${invoice.luotKham.benhNhan.SoBHYT || 'Khong co'} | Muc huong: ${invoice.luotKham.benhNhan.MucHuongBHYT || 0}%`);
      doc.text(`Bac si kham: ${invoice.luotKham.bacSi.nhanVien.HoTen}`);
      doc.text(`Thu ngan lap phieu: ${invoice.thuNgan.nhanVien.HoTen}`);
      doc.moveDown();

      // Financial breakdown
      doc.fontSize(12).text('CHI TIET THANH TOAN:');
      doc.fontSize(10);
      doc.text(`- Tong chi phi goc (A): ${Number(invoice.TongTienGoc).toLocaleString('vi-VN')} VND`);
      doc.text(`- Quy BHYT chi tra (B): ${Number(invoice.TienBHYTChiTra).toLocaleString('vi-VN')} VND`);
      doc.text(`- So tien nguoi benh phai tra (A - B): ${Number(invoice.TienBenhNhanTra).toLocaleString('vi-VN')} VND`);
      doc.moveDown();
      doc.text(`Hinh thuc thanh toan: ${invoice.PhuongThucTT}`);
      doc.text(`Trang thai thanh toan: ${invoice.TrangThaiTT}`);
      doc.moveDown();

      doc.fontSize(9).text('Cam on quy khach da tin tuong kham chua benh tai Benh vien!', { align: 'center' });
      doc.end();
    });
  }

  async getInvoiceById(maHD: string) {
    const invoice = await this.prisma.hoaDon.findUnique({
      where: { MaHD: maHD },
      include: {
        luotKham: {
          include: {
            benhNhan: true,
            bacSi: { include: { nhanVien: true } },
          },
        },
        thuNgan: {
          include: { nhanVien: true },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Hóa đơn ${maHD} không tồn tại`);
    }

    return invoice;
  }
}
