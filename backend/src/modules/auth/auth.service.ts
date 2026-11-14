import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

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
        OR: [
          { MaNV: username },
          { CCCD: username },
          { Email: username },
        ],
      },
      include: {
        bacSi: true,
        dieuDuong: true,
        nvHanhChinh: true,
        khoa: true,
      },
    });

    if (!nhanVien) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Check password if set; if MatKhau is null in synthetic data, allow default password '123456'
    let isMatch = false;
    if (nhanVien.MatKhau) {
      isMatch = await bcrypt.compare(password, nhanVien.MatKhau);
    } else {
      isMatch = password === '123456' || password === 'password123';
    }

    if (!isMatch) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    let roleName = nhanVien.LoaiNV.toString();
    if (nhanVien.nvHanhChinh?.BoPhanPhuTrach?.toLowerCase().includes('thu ngân')) {
      roleName = 'THU_NGAN';
    }

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
        loaiNV: nhanVien.LoaiNV,
        role: roleName,
        maKhoa: nhanVien.MaKhoa,
        tenKhoa: nhanVien.khoa.TenKhoa,
        email: nhanVien.Email,
        soDienThoai: nhanVien.SoDienThoai,
      },
    };
  }

  async getProfile(maNV: string) {
    const nhanVien = await this.prisma.nhanVien.findUnique({
      where: { MaNV: maNV },
      include: {
        bacSi: true,
        dieuDuong: true,
        nvHanhChinh: true,
        khoa: true,
      },
    });

    if (!nhanVien) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return nhanVien;
  }
}
