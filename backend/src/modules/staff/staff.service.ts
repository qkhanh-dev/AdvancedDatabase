import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { Role } from '../../common/enums/role.enum';
import { formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';
import {
  registerPartialStaffRole,
  registerStaffPassword,
  resolveStaffRole,
} from '../../common/utils/staff-role.util';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  private async getYearsOfServiceMap(maNVs: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (maNVs.length === 0) return map;
    const rows = await this.prisma.$queryRaw<Array<{ MaNV: string; SoNamCongTac: number }>>`
      SELECT "MaNV", "SoNamCongTac" FROM "V_NHAN_VIEN"
    `;
    for (const r of rows) {
      map.set(r.MaNV, Number(r.SoNamCongTac));
    }
    return map;
  }

  private serializeStaff(nv: any, yearsMap: Map<string, number>) {
    return {
      MaNV: nv.MaNV,
      MaKhoa: nv.MaKhoa,
      HoTen: nv.HoTen,
      NgaySinh: formatDateOnly(nv.NgaySinh),
      GioiTinh: nv.GioiTinh,
      CCCD: nv.CCCD,
      DiaChi: nv.DiaChi,
      SoDienThoai: nv.SoDienThoai,
      NgayVaoLam: formatDateOnly(nv.NgayVaoLam),
      SoNamCongTac: yearsMap.get(nv.MaNV) ?? 0,
      role: resolveStaffRole(nv),
      khoa: nv.khoa,
      bacSi: nv.bacSi ?? null,
      dieuDuong: nv.dieuDuong ?? null,
      kyThuatVien: nv.kyThuatVien ?? null,
    };
  }

  async getAllStaff(loaiChuyenMon?: string, maKhoa?: string) {
    const where: any = {};
    if (maKhoa) {
      where.MaKhoa = maKhoa;
    }

    if (loaiChuyenMon === 'BAC_SI') {
      where.bacSi = { isNot: null };
    } else if (loaiChuyenMon === 'DIEU_DUONG') {
      where.dieuDuong = { isNot: null };
    } else if (loaiChuyenMon === 'KY_THUAT_VIEN') {
      where.kyThuatVien = { isNot: null };
    } else if (loaiChuyenMon === 'KHAC') {
      where.bacSi = null;
      where.dieuDuong = null;
      where.kyThuatVien = null;
    }

    const list = await this.prisma.nhanVien.findMany({
      where,
      include: {
        khoa: true,
        bacSi: true,
        dieuDuong: true,
        kyThuatVien: true,
      },
      orderBy: { MaNV: 'asc' },
    });

    const yearsMap = await this.getYearsOfServiceMap(list.map((i) => i.MaNV));
    return list.map((nv) => this.serializeStaff(nv, yearsMap));
  }

  async getDoctors() {
    const list = await this.prisma.bacSi.findMany({
      include: {
        nhanVien: { include: { khoa: true } },
      },
      orderBy: { MaNV: 'asc' },
    });
    const yearsMap = await this.getYearsOfServiceMap(list.map((i) => i.MaNV));
    return list.map((bs) => ({
      MaNV: bs.MaNV,
      ChuyenKhoa: bs.ChuyenKhoa,
      TrinhDoHocVan: bs.TrinhDoHocVan,
      SoChungChiHanhNghe: bs.SoChungChiHanhNghe,
      nhanVien: {
        ...bs.nhanVien,
        NgaySinh: formatDateOnly(bs.nhanVien.NgaySinh),
        NgayVaoLam: formatDateOnly(bs.nhanVien.NgayVaoLam),
        SoNamCongTac: yearsMap.get(bs.MaNV) ?? 0,
      },
    }));
  }

  async getNurses() {
    const list = await this.prisma.dieuDuong.findMany({
      include: {
        nhanVien: { include: { khoa: true } },
      },
      orderBy: { MaNV: 'asc' },
    });
    const yearsMap = await this.getYearsOfServiceMap(list.map((i) => i.MaNV));
    return list.map((dd) => ({
      MaNV: dd.MaNV,
      CapBac: dd.CapBac,
      ChungChiHanhNghe: dd.ChungChiHanhNghe,
      nhanVien: {
        ...dd.nhanVien,
        NgaySinh: formatDateOnly(dd.nhanVien.NgaySinh),
        NgayVaoLam: formatDateOnly(dd.nhanVien.NgayVaoLam),
        SoNamCongTac: yearsMap.get(dd.MaNV) ?? 0,
      },
    }));
  }

  async getTechnicians() {
    const list = await this.prisma.kyThuatVien.findMany({
      include: {
        nhanVien: { include: { khoa: true } },
      },
      orderBy: { MaNV: 'asc' },
    });
    const yearsMap = await this.getYearsOfServiceMap(list.map((i) => i.MaNV));
    return list.map((ktv) => ({
      MaNV: ktv.MaNV,
      ChuyenMonXetNghiem: ktv.ChuyenMonXetNghiem,
      BTD_ThietBiPhuTrach: ktv.BTD_ThietBiPhuTrach,
      nhanVien: {
        ...ktv.nhanVien,
        NgaySinh: formatDateOnly(ktv.nhanVien.NgaySinh),
        NgayVaoLam: formatDateOnly(ktv.nhanVien.NgayVaoLam),
        SoNamCongTac: yearsMap.get(ktv.MaNV) ?? 0,
      },
    }));
  }

  async getStaffById(maNV: string) {
    const staff = await this.prisma.nhanVien.findUnique({
      where: { MaNV: maNV },
      include: {
        khoa: true,
        bacSi: true,
        dieuDuong: true,
        kyThuatVien: true,
      },
    });
    if (!staff) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Nhân viên ${maNV} không tồn tại`,
      });
    }
    const yearsMap = await this.getYearsOfServiceMap([maNV]);
    return this.serializeStaff(staff, yearsMap);
  }

  // BR-V2-01: Tạo NHAN_VIEN và tối đa 1 vai trò chuyên môn (disjoint, partial d, p)
  async createStaff(dto: CreateStaffDto) {
    const subtypeCount = [dto.bacSi, dto.dieuDuong, dto.kyThuatVien].filter(Boolean).length;
    if (subtypeCount > 1) {
      throw new ConflictException({
        ruleCode: 'BR-V2-01',
        message: 'Mỗi nhân viên chỉ được thuộc tối đa 1 nhóm chuyên môn trong {BAC_SI, DIEU_DUONG, KY_THUAT_VIEN} (disjoint)',
      });
    }

    if (dto.role === Role.BAC_SI && !dto.bacSi) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-01',
        message: 'Vai trò BAC_SI bắt buộc phải có thông tin chuyên môn bacSi',
      });
    }
    if (dto.role === Role.DIEU_DUONG && !dto.dieuDuong) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-01',
        message: 'Vai trò DIEU_DUONG bắt buộc phải có thông tin chuyên môn dieuDuong',
      });
    }
    if (dto.role === Role.KY_THUAT_VIEN && !dto.kyThuatVien) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-01',
        message: 'Vai trò KY_THUAT_VIEN bắt buộc phải có thông tin chuyên môn kyThuatVien',
      });
    }
    if (
      dto.role &&
      ((dto.role !== Role.BAC_SI && dto.bacSi) ||
        (dto.role !== Role.DIEU_DUONG && dto.dieuDuong) ||
        (dto.role !== Role.KY_THUAT_VIEN && dto.kyThuatVien))
    ) {
      throw new ConflictException({
        ruleCode: 'BR-V2-01',
        message: `Vai trò ${dto.role} không khớp với thông tin chuyên môn được gửi kèm (BR-V2-01)`,
      });
    }

    const khoa = await this.prisma.khoa.findUnique({ where: { MaKhoa: dto.maKhoa } });
    if (!khoa) {
      throw new NotFoundException({
        ruleCode: 'NOT_FOUND',
        message: `Khoa ${dto.maKhoa} không tồn tại`,
      });
    }

    const created = await this.prisma.$transaction(async (tx) => {
      return tx.nhanVien.create({
        data: {
          MaNV: dto.maNV,
          MaKhoa: dto.maKhoa,
          HoTen: dto.hoTen,
          NgaySinh: parseDateOnlyUtc(dto.ngaySinh),
          GioiTinh: dto.gioiTinh,
          CCCD: dto.cccd,
          DiaChi: dto.diaChi,
          SoDienThoai: dto.soDienThoai,
          NgayVaoLam: parseDateOnlyUtc(dto.ngayVaoLam),
          ...(dto.bacSi
            ? {
                bacSi: {
                  create: {
                    ChuyenKhoa: dto.bacSi.chuyenKhoa,
                    TrinhDoHocVan: dto.bacSi.trinhDoHocVan,
                    SoChungChiHanhNghe: dto.bacSi.soChungChiHanhNghe,
                  },
                },
              }
            : {}),
          ...(dto.dieuDuong
            ? {
                dieuDuong: {
                  create: {
                    CapBac: dto.dieuDuong.capBac,
                    ChungChiHanhNghe: dto.dieuDuong.chungChiHanhNghe,
                  },
                },
              }
            : {}),
          ...(dto.kyThuatVien
            ? {
                kyThuatVien: {
                  create: {
                    ChuyenMonXetNghiem: dto.kyThuatVien.chuyenMonXetNghiem,
                    BTD_ThietBiPhuTrach: dto.kyThuatVien.btdThietBiPhuTrach,
                  },
                },
              }
            : {}),
        },
        include: {
          khoa: true,
          bacSi: true,
          dieuDuong: true,
          kyThuatVien: true,
        },
      });
    });

    if (subtypeCount === 0 && dto.role && [Role.ADMIN, Role.TIEP_NHAN, Role.THU_NGAN].includes(dto.role)) {
      registerPartialStaffRole(created.MaNV, dto.role);
    }
    if (dto.password) {
      await registerStaffPassword(created.MaNV, dto.password);
    }

    const yearsMap = await this.getYearsOfServiceMap([created.MaNV]);
    return this.serializeStaff(created, yearsMap);
  }
}
