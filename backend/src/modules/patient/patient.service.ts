import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceCardDto, CreatePatientDto } from './dto/patient.dto';
import { formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  private async getAgeMap(): Promise<Map<string, number>> {
    const rows = await this.prisma.$queryRaw<Array<{ MaBN: string; Tuoi: number }>>`
      SELECT "MaBN", "Tuoi" FROM "V_BENH_NHAN"
    `;
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.MaBN, Number(r.Tuoi));
    }
    return map;
  }

  private serializePatient(bn: any, ageMap: Map<string, number>) {
    return {
      MaBN: bn.MaBN,
      HoTen: bn.HoTen,
      NgaySinh: formatDateOnly(bn.NgaySinh),
      GioiTinh: bn.GioiTinh,
      CCCD: bn.CCCD,
      SDT: bn.SDT,
      DiaChi_Duong: bn.DiaChi_Duong,
      DiaChi_Phuong: bn.DiaChi_Phuong,
      DiaChi_Quan: bn.DiaChi_Quan,
      NhomMau: bn.NhomMau,
      Tuoi: ageMap.get(bn.MaBN) ?? 0,
      ...(bn.theBHYTs
        ? {
            theBHYTs: bn.theBHYTs.map((t: any) => ({
              MaTheBHYT: t.MaTheBHYT,
              MaBN: t.MaBN,
              MucHuong: Number(t.MucHuong),
              NgayBatDau: formatDateOnly(t.NgayBatDau),
              NgayHetHan: formatDateOnly(t.NgayHetHan),
            })),
          }
        : {}),
      ...(bn.dotNoiTrus
        ? {
            dotNoiTrus: bn.dotNoiTrus.map((d: any) => ({
              ...d,
              NgayNhapVien: formatDateOnly(d.NgayNhapVien),
              NgayRaVien: formatDateOnly(d.NgayRaVien),
            })),
          }
        : {}),
      ...(bn.luotKhams ? { luotKhams: bn.luotKhams } : {}),
    };
  }

  // BR-V2-09: Tạo hồ sơ BENH_NHAN, KHÔNG tạo BN_NGOAI_TRU
  async createPatient(dto: CreatePatientDto) {
    const maBN = dto.maBN || `BN_${Date.now().toString().slice(-8)}`;

    const created = await this.prisma.benhNhan.create({
      data: {
        MaBN: maBN,
        HoTen: dto.hoTen,
        NgaySinh: parseDateOnlyUtc(dto.ngaySinh),
        GioiTinh: dto.gioiTinh,
        CCCD: dto.cccd,
        SDT: dto.sdt,
        DiaChi_Duong: dto.diaChiDuong,
        DiaChi_Phuong: dto.diaChiPhuong,
        DiaChi_Quan: dto.diaChiQuan,
        NhomMau: dto.nhomMau,
      },
      include: { theBHYTs: true },
    });

    const ageMap = await this.getAgeMap();
    return this.serializePatient(created, ageMap);
  }

  async lookup(query: string) {
    const q = (query || '').trim();
    if (!q) {
      throw new BadRequestException({
        ruleCode: 'VALIDATION_ERROR',
        message: 'Vui lòng cung cấp từ khóa tra cứu q',
      });
    }

    const patients = await this.prisma.benhNhan.findMany({
      where: {
        OR: [
          { MaBN: { equals: q, mode: 'insensitive' } },
          { CCCD: { equals: q } },
          { SDT: { equals: q } },
          { HoTen: { contains: q, mode: 'insensitive' } },
          { theBHYTs: { some: { MaTheBHYT: { equals: q, mode: 'insensitive' } } } },
        ],
      },
      include: {
        theBHYTs: { orderBy: { NgayHetHan: 'desc' } },
        dotNoiTrus: { orderBy: { NgayNhapVien: 'desc' } },
        luotKhams: {
          orderBy: { NgayGioKham: 'desc' },
          include: { bacSi: { include: { nhanVien: true } } },
        },
      },
    });

    const ageMap = await this.getAgeMap();
    return patients.map((p) => this.serializePatient(p, ageMap));
  }

  async getAllPatients(page = 1, limit = 20) {
    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(100, Math.max(1, limit || 20));
    const skip = (safePage - 1) * safeLimit;

    const [total, data] = await Promise.all([
      this.prisma.benhNhan.count(),
      this.prisma.benhNhan.findMany({
        skip,
        take: safeLimit,
        include: { theBHYTs: true },
        orderBy: { MaBN: 'asc' },
      }),
    ]);

    const ageMap = await this.getAgeMap();
    return {
      total,
      page: safePage,
      limit: safeLimit,
      data: data.map((p) => this.serializePatient(p, ageMap)),
    };
  }

  // BR-V2-06: THE_BHYT (MucHuong trong [0, 1], NgayHetHan >= NgayBatDau)
  async createInsuranceCard(maBN: string, dto: CreateInsuranceCardDto) {
    const patient = await this.prisma.benhNhan.findUnique({ where: { MaBN: maBN } });
    if (!patient) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Bệnh nhân ${maBN} không tồn tại`,
      });
    }

    const start = parseDateOnlyUtc(dto.ngayBatDau);
    const end = parseDateOnlyUtc(dto.ngayHetHan);

    if (end < start) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-06',
        message: 'Ngày hết hạn thẻ BHYT phải >= ngày bắt đầu (BR-V2-06)',
      });
    }

    if (dto.mucHuong < 0 || dto.mucHuong > 1) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-06',
        message: 'Mức hưởng BHYT phải nằm trong đoạn [0, 1] (BR-V2-06)',
      });
    }

    const created = await this.prisma.theBHYT.create({
      data: {
        MaTheBHYT: dto.maTheBHYT,
        MaBN: maBN,
        MucHuong: dto.mucHuong,
        NgayBatDau: start,
        NgayHetHan: end,
      },
    });

    return {
      MaTheBHYT: created.MaTheBHYT,
      MaBN: created.MaBN,
      MucHuong: Number(created.MucHuong),
      NgayBatDau: formatDateOnly(created.NgayBatDau),
      NgayHetHan: formatDateOnly(created.NgayHetHan),
    };
  }

  async getInsuranceCards(maBN: string, validAt?: string) {
    const patient = await this.prisma.benhNhan.findUnique({ where: { MaBN: maBN } });
    if (!patient) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Bệnh nhân ${maBN} không tồn tại`,
      });
    }

    let where: any = { MaBN: maBN };
    if (validAt) {
      let targetDate: Date;
      try {
        targetDate = parseDateOnlyUtc(validAt);
      } catch {
        throw new BadRequestException({
          ruleCode: 'VALIDATION_ERROR',
          message: `Định dạng validAt không hợp lệ (cần YYYY-MM-DD): ${validAt}`,
        });
      }
      where = {
        MaBN: maBN,
        NgayBatDau: { lte: targetDate },
        NgayHetHan: { gte: targetDate },
      };
    }

    const cards = await this.prisma.theBHYT.findMany({
      where,
      orderBy: { NgayHetHan: 'desc' },
    });

    return cards.map((c) => ({
      MaTheBHYT: c.MaTheBHYT,
      MaBN: c.MaBN,
      MucHuong: Number(c.MucHuong),
      NgayBatDau: formatDateOnly(c.NgayBatDau),
      NgayHetHan: formatDateOnly(c.NgayHetHan),
    }));
  }
}
