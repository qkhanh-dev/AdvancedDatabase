import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdmitPatientDto } from './dto/admit-patient.dto';
import { AssignBedDto, TransferBedDto } from './dto/assign-bed.dto';
import { Prisma, TrangThaiGiuongEnum } from '@prisma/client';

@Injectable()
export class InpatientStayService {
  constructor(private prisma: PrismaService) {}

  async admitPatient(dto: AdmitPatientDto) {
    const patient = await this.prisma.benhNhan.findUnique({
      where: { MaBN: dto.maBN },
      include: { bnNoiTru: true },
    });

    if (!patient) {
      throw new NotFoundException(`Bệnh nhân ${dto.maBN} không tồn tại`);
    }

    if (patient.bnNoiTru) {
      throw new BadRequestException(`Bệnh nhân ${dto.maBN} đã có hồ sơ bệnh án nội trú`);
    }

    // Verify doctor
    const doctor = await this.prisma.bacSi.findUnique({
      where: { MaNV: dto.maBSTheoDoi },
    });
    if (!doctor) {
      throw new BadRequestException(`Bác sĩ theo dõi ${dto.maBSTheoDoi} không tồn tại`);
    }

    const soHoSo = dto.soHoSoBenhAn || `HSBA_${dto.maBN}_${Date.now().toString().slice(-4)}`;

    return this.prisma.$transaction(async (tx) => {
      await tx.benhNhan.update({
        where: { MaBN: dto.maBN },
        data: { CoNoiTru: true },
      });

      return tx.bnNoiTru.create({
        data: {
          MaBN: dto.maBN,
          SoHoSoBenhAn: soHoSo,
          NgayNhapVien: new Date(),
          NgayXuatVienDuKien: dto.ngayXuatVienDuKien ? new Date(dto.ngayXuatVienDuKien) : null,
          ChanDoanNhapVien: dto.chanDoanNhapVien,
          TinhTrangNhapVien: dto.tinhTrangNhapVien,
          MaBSTheoDoi: dto.maBSTheoDoi,
        },
        include: {
          benhNhan: true,
          bacSiTheoDoi: {
            include: { nhanVien: true },
          },
        },
      });
    });
  }

  // BR02: Anti-Double-Bed Allocation Algorithm with Concurrency Safety (Serializable + SELECT FOR UPDATE)
  async assignBed(dto: AssignBedDto) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Verify inpatient profile
          const bnNoiTru = await tx.bnNoiTru.findUnique({
            where: { MaBN: dto.maBN },
          });
          if (!bnNoiTru) {
            throw new BadRequestException(`Bệnh nhân ${dto.maBN} chưa làm thủ tục nhập viện nội trú (C10)`);
          }

          // 2. Check if patient is already occupying a bed
          const currentPatientBed = await tx.phanGiuong.findFirst({
            where: {
              MaBN: dto.maBN,
              NgayKetThuc: null,
            },
          });
          if (currentPatientBed) {
            throw new BadRequestException(
              `Bệnh nhân đang nằm tại giường ${currentPatientBed.MaGiuong}. Cần chuyển giường hoặc trả giường trước khi phân mới!`,
            );
          }

          // 3. Acquire pessimistic row-level lock (SELECT ... FOR UPDATE) on target bed
          await tx.$queryRaw`SELECT "MaGiuong" FROM "GIUONG_BENH" WHERE "MaGiuong" = ${dto.maGiuong} FOR UPDATE`;

          const bed = await tx.giuongBenh.findUnique({
            where: { MaGiuong: dto.maGiuong },
            include: { phong: true },
          });

          if (!bed) {
            throw new NotFoundException(`Giường bệnh ${dto.maGiuong} không tồn tại`);
          }

          if (bed.phong.LoaiPhong !== 'NOI_TRU') {
            throw new BadRequestException(`Giường ${dto.maGiuong} không thuộc phòng nội trú (C02)`);
          }

          // Check active occupation
          const activeAllocation = await tx.phanGiuong.findFirst({
            where: {
              MaGiuong: dto.maGiuong,
              NgayKetThuc: null,
            },
          });

          if (activeAllocation || bed.TrangThaiGiuong !== TrangThaiGiuongEnum.TRONG) {
            throw new BadRequestException(
              `Giường bệnh ${dto.maGiuong} hiện không ở trạng thái TRỐNG hoặc đang có bệnh nhân khác nằm!`,
            );
          }

          // 4. Create PhanGiuong allocation record
          const now = new Date();
          const phanGiuong = await tx.phanGiuong.create({
            data: {
              MaBN: dto.maBN,
              MaGiuong: dto.maGiuong,
              NgayBatDau: now,
              GiaGiuongNgay: bed.DonGiaNgay, // Snapshot price
              GhiChuChuyenGiuong: dto.ghiChu || 'Nhận giường nội trú',
            },
          });

          // 5. Update Bed Status to DANG_SU_DUNG
          await tx.giuongBenh.update({
            where: { MaGiuong: dto.maGiuong },
            data: { TrangThaiGiuong: TrangThaiGiuongEnum.DANG_SU_DUNG },
          });

          return phanGiuong;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: any) {
      const isSerializationConflict =
        error?.code === 'P2034' ||
        (error?.code === 'P2010' && String(error?.meta?.code) === '40001') ||
        String(error?.message || '').includes('40001') ||
        String(error?.message || '').includes('serialize access');
      if (isSerializationConflict) {
        throw new ConflictException(
          `Giường bệnh ${dto.maGiuong} vừa được phân cho bệnh nhân khác trong giao dịch đồng thời (BR02). Vui lòng chọn giường khác!`,
        );
      }
      throw error;
    }
  }

  async transferBed(dto: TransferBedDto) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Find currently active bed of patient
          const currentAllocation = await tx.phanGiuong.findFirst({
            where: {
              MaBN: dto.maBN,
              NgayKetThuc: null,
            },
          });

          if (!currentAllocation) {
            throw new BadRequestException(`Bệnh nhân ${dto.maBN} hiện không được phân bất kỳ giường bệnh nào`);
          }

          if (currentAllocation.MaGiuong === dto.maGiuongMoi) {
            throw new BadRequestException('Giường mới không được trùng với giường bệnh hiện tại');
          }

          // 2. Lock target bed & check availability
          await tx.$queryRaw`SELECT "MaGiuong" FROM "GIUONG_BENH" WHERE "MaGiuong" = ${dto.maGiuongMoi} FOR UPDATE`;

          const targetBed = await tx.giuongBenh.findUnique({
            where: { MaGiuong: dto.maGiuongMoi },
            include: { phong: true },
          });

          if (!targetBed) {
            throw new NotFoundException(`Giường mới ${dto.maGiuongMoi} không tồn tại`);
          }

          if (targetBed.phong.LoaiPhong !== 'NOI_TRU') {
            throw new BadRequestException(`Giường mới ${dto.maGiuongMoi} không thuộc phòng nội trú (C02)`);
          }

          const activeTargetAllocation = await tx.phanGiuong.findFirst({
            where: {
              MaGiuong: dto.maGiuongMoi,
              NgayKetThuc: null,
            },
          });

          if (activeTargetAllocation || targetBed.TrangThaiGiuong !== TrangThaiGiuongEnum.TRONG) {
            throw new BadRequestException(`Giường mới ${dto.maGiuongMoi} đang có người nằm hoặc không khả dụng`);
          }

          const now = new Date();

          // 3. Close current bed assignment
          await tx.phanGiuong.update({
            where: {
              MaBN_MaGiuong_NgayBatDau: {
                MaBN: currentAllocation.MaBN,
                MaGiuong: currentAllocation.MaGiuong,
                NgayBatDau: currentAllocation.NgayBatDau,
              },
            },
            data: {
              NgayKetThuc: now,
            },
          });

          // Mark old bed as BAO_TRI (maintenance/cleanup before opening again)
          await tx.giuongBenh.update({
            where: { MaGiuong: currentAllocation.MaGiuong },
            data: { TrangThaiGiuong: TrangThaiGiuongEnum.BAO_TRI },
          });

          // 4. Create new bed assignment
          const newAllocation = await tx.phanGiuong.create({
            data: {
              MaBN: dto.maBN,
              MaGiuong: dto.maGiuongMoi,
              NgayBatDau: now,
              GiaGiuongNgay: targetBed.DonGiaNgay,
              GhiChuChuyenGiuong: dto.lyDoChuyen,
            },
          });

          // Mark target bed as DANG_SU_DUNG
          await tx.giuongBenh.update({
            where: { MaGiuong: dto.maGiuongMoi },
            data: { TrangThaiGiuong: TrangThaiGiuongEnum.DANG_SU_DUNG },
          });

          return newAllocation;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error: any) {
      const isSerializationConflict =
        error?.code === 'P2034' ||
        (error?.code === 'P2010' && String(error?.meta?.code) === '40001') ||
        String(error?.message || '').includes('40001') ||
        String(error?.message || '').includes('serialize access');
      if (isSerializationConflict) {
        throw new ConflictException(
          `Giường mới ${dto.maGiuongMoi} vừa được phân trong giao dịch đồng thời (BR02). Vui lòng thử lại!`,
        );
      }
      throw error;
    }
  }

  async getInpatientList() {
    return this.prisma.bnNoiTru.findMany({
      include: {
        benhNhan: true,
        bacSiTheoDoi: {
          include: {
            nhanVien: {
              select: { HoTen: true },
            },
          },
        },
        phanGiuongs: {
          where: { NgayKetThuc: null },
          include: {
            giuongBenh: {
              include: {
                phong: {
                  include: { khoa: true },
                },
              },
            },
          },
        },
      },
    });
  }
}
