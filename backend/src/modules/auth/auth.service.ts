import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { resolveStaffRole, verifyStaffPassword } from '../../common/utils/staff-role.util';
import { formatDateOnly } from '../../common/utils/date.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const nhanVien = await this.prisma.nhanVien.findFirst({
      where: {
        OR: [{ MaNV: username }, { CCCD: username }],
      },
      include: {
        bacSi: true,
        dieuDuong: true,
        kyThuatVien: true,
        khoa: true,
      },
    });

    if (!nhanVien) {
      throw new UnauthorizedException({
        ruleCode: 'UNAUTHORIZED',
        message: 'Thông tin đăng nhập không chính xác',
      });
    }

    const isMatch = await verifyStaffPassword(nhanVien.MaNV, password);
    if (!isMatch) {
      throw new UnauthorizedException({
        ruleCode: 'UNAUTHORIZED',
        message: 'Thông tin đăng nhập không chính xác',
      });
    }

    const viewRows = await this.prisma.$queryRaw<Array<{ SoNamCongTac: number }>>`
      SELECT "SoNamCongTac" FROM "V_NHAN_VIEN" WHERE "MaNV" = ${nhanVien.MaNV}
    `;
    const soNamCongTac = viewRows[0]?.SoNamCongTac ?? 0;

    const roleName = resolveStaffRole(nhanVien);

    const payload = {
      sub: nhanVien.MaNV,
      maNV: nhanVien.MaNV,
      hoTen: nhanVien.HoTen,
      role: roleName,
      maKhoa: nhanVien.MaKhoa,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        maNV: nhanVien.MaNV,
        hoTen: nhanVien.HoTen,
        maKhoa: nhanVien.MaKhoa,
        soDienThoai: nhanVien.SoDienThoai,
        MaNV: nhanVien.MaNV,
        MaKhoa: nhanVien.MaKhoa,
        HoTen: nhanVien.HoTen,
        NgaySinh: formatDateOnly(nhanVien.NgaySinh),
        GioiTinh: nhanVien.GioiTinh,
        CCCD: nhanVien.CCCD,
        DiaChi: nhanVien.DiaChi,
        SoDienThoai: nhanVien.SoDienThoai,
        NgayVaoLam: formatDateOnly(nhanVien.NgayVaoLam),
        SoNamCongTac: soNamCongTac,
        role: roleName,
        tenKhoa: nhanVien.khoa.TenKhoa,
        bacSi: nhanVien.bacSi,
        dieuDuong: nhanVien.dieuDuong,
        kyThuatVien: nhanVien.kyThuatVien,
      },
    };
  }

  async getProfile(maNV: string) {
    const nhanVien = await this.prisma.nhanVien.findUnique({
      where: { MaNV: maNV },
      include: {
        bacSi: true,
        dieuDuong: true,
        kyThuatVien: true,
        khoa: true,
      },
    });

    if (!nhanVien) {
      throw new UnauthorizedException({
        ruleCode: 'UNAUTHORIZED',
        message: 'Người dùng không tồn tại',
      });
    }

    const viewRows = await this.prisma.$queryRaw<Array<{ SoNamCongTac: number }>>`
      SELECT "SoNamCongTac" FROM "V_NHAN_VIEN" WHERE "MaNV" = ${maNV}
    `;

    return {
      MaNV: nhanVien.MaNV,
      MaKhoa: nhanVien.MaKhoa,
      HoTen: nhanVien.HoTen,
      NgaySinh: formatDateOnly(nhanVien.NgaySinh),
      GioiTinh: nhanVien.GioiTinh,
      CCCD: nhanVien.CCCD,
      DiaChi: nhanVien.DiaChi,
      SoDienThoai: nhanVien.SoDienThoai,
      NgayVaoLam: formatDateOnly(nhanVien.NgayVaoLam),
      SoNamCongTac: viewRows[0]?.SoNamCongTac ?? 0,
      role: resolveStaffRole(nhanVien),
      khoa: nhanVien.khoa,
      bacSi: nhanVien.bacSi,
      dieuDuong: nhanVien.dieuDuong,
      kyThuatVien: nhanVien.kyThuatVien,
    };
  }
}
