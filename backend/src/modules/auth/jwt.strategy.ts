import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  maNV: string;
  hoTen: string;
  role: string;
  maKhoa: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-hospital-management-jwt-token-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    const nhanVien = await this.prisma.nhanVien.findUnique({
      where: { MaNV: payload.maNV },
      include: {
        bacSi: true,
        dieuDuong: true,
        nvHanhChinh: true,
        khoa: true,
      },
    });

    if (!nhanVien) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc người dùng không tồn tại');
    }

    let userRole: string = payload.role;
    if (!userRole) {
      userRole = nhanVien.LoaiNV === 'HANH_CHINH' ? 'NV_HANH_CHINH' : nhanVien.LoaiNV.toString();
      const boPhan = nhanVien.nvHanhChinh?.BoPhanPhuTrach?.toLowerCase() || '';
      if (boPhan.includes('thu ngan') || boPhan.includes('thu ngân')) {
        userRole = 'THU_NGAN';
      }
    }

    return {
      maNV: nhanVien.MaNV,
      hoTen: nhanVien.HoTen,
      role: userRole,
      maKhoa: nhanVien.MaKhoa,
      tenKhoa: nhanVien.khoa.TenKhoa,
      detail: nhanVien.bacSi || nhanVien.dieuDuong || nhanVien.nvHanhChinh,
    };
  }
}
