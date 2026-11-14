import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { TrangThaiPhatThuocEnum } from '@prisma/client';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async createPrescription(dto: CreatePrescriptionDto) {
    const maDon = dto.maDon || `DT${Date.now().toString().slice(-8)}`;

    // Verify examination
    const exam = await this.prisma.luotKham.findUnique({
      where: { MaLuotKham: dto.maLuotKham },
      include: { donThuoc: true },
    });
    if (!exam) {
      throw new NotFoundException(`Lượt khám ${dto.maLuotKham} không tồn tại`);
    }
    if (exam.donThuoc) {
      throw new BadRequestException(`Lượt khám ${dto.maLuotKham} đã được kê toa thuốc trước đó`);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Toa thuốc phải chứa ít nhất 1 loại dược phẩm');
    }

    return this.prisma.$transaction(async (tx) => {
      // Check stock and snapshot prices
      const itemsToCreate = [];
      for (const item of dto.items) {
        const thuoc = await tx.thuoc.findUnique({
          where: { MaThuoc: item.maThuoc },
        });
        if (!thuoc) {
          throw new NotFoundException(`Thuốc ${item.maThuoc} không tồn tại`);
        }
        if (thuoc.SoLuongTon < item.soLuong) {
          throw new BadRequestException(
            `Thuốc "${thuoc.TenThuoc}" không đủ tồn kho (Còn: ${thuoc.SoLuongTon}, Yêu cầu: ${item.soLuong})`,
          );
        }

        itemsToCreate.push({
          MaThuoc: item.maThuoc,
          SoLuong: item.soLuong,
          LieuDung: item.lieuDung,
          CachDung: item.cachDung,
          SoNgayUong: item.soNgayUong,
          DonGiaBan: thuoc.DonGiaHienHanh, // Snapshot price
        });
      }

      const donThuoc = await tx.donThuoc.create({
        data: {
          MaDon: maDon,
          NgayGioKe: new Date(),
          LoiDanBacSi: dto.loiDanBacSi || null,
          TrangThaiPhatThuoc: TrangThaiPhatThuocEnum.CHUA_PHAT,
          MaLuotKham: dto.maLuotKham,
          ctDonThuocs: {
            create: itemsToCreate,
          },
        },
        include: {
          ctDonThuocs: {
            include: { thuoc: true },
          },
        },
      });

      return donThuoc;
    });
  }

  // BR04: Atomic Inventory Deduction when dispensed
  async dispensePrescription(maDon: string) {
    return this.prisma.$transaction(async (tx) => {
      const don = await tx.donThuoc.findUnique({
        where: { MaDon: maDon },
        include: { ctDonThuocs: true },
      });

      if (!don) {
        throw new NotFoundException(`Đơn thuốc ${maDon} không tồn tại`);
      }

      if (don.TrangThaiPhatThuoc === TrangThaiPhatThuocEnum.DA_PHAT) {
        throw new BadRequestException('Đơn thuốc này đã được cấp phát trước đó');
      }

      if (don.TrangThaiPhatThuoc === TrangThaiPhatThuocEnum.DA_HUY) {
        throw new BadRequestException('Đơn thuốc này đã bị hủy, không thể cấp phát');
      }

      // Atomically check and deduct stock
      for (const item of don.ctDonThuocs) {
        const thuoc = await tx.thuoc.findUnique({
          where: { MaThuoc: item.MaThuoc },
        });

        if (!thuoc || thuoc.SoLuongTon < item.SoLuong) {
          throw new BadRequestException(
            `Không thể phát thuốc. Thuốc ${item.MaThuoc} không đủ số lượng tồn kho vật lý!`,
          );
        }

        await tx.thuoc.update({
          where: { MaThuoc: item.MaThuoc },
          data: {
            SoLuongTon: {
              decrement: item.SoLuong,
            },
          },
        });
      }

      return tx.donThuoc.update({
        where: { MaDon: maDon },
        data: {
          TrangThaiPhatThuoc: TrangThaiPhatThuocEnum.DA_PHAT,
        },
        include: {
          ctDonThuocs: {
            include: { thuoc: true },
          },
        },
      });
    });
  }

  async getAllMedicines() {
    return this.prisma.thuoc.findMany({
      orderBy: { TenThuoc: 'asc' },
    });
  }

  async getPrescriptionById(id: string) {
    const don = await this.prisma.donThuoc.findUnique({
      where: { MaDon: id },
      include: {
        luotKham: {
          include: {
            benhNhan: true,
            bacSi: {
              include: { nhanVien: true },
            },
          },
        },
        ctDonThuocs: {
          include: { thuoc: true },
        },
      },
    });

    if (!don) {
      throw new NotFoundException(`Đơn thuốc ${id} không tồn tại`);
    }

    return don;
  }
}
