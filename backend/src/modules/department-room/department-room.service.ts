import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentRoomService {
  constructor(private prisma: PrismaService) {}

  async getAllDepartments() {
    return this.prisma.khoa.findMany({
      include: {
        truongKhoa: {
          include: {
            nhanVien: {
              select: {
                HoTen: true,
                SoDienThoai: true,
                Email: true,
              },
            },
          },
        },
        _count: {
          select: {
            phongs: true,
            nhanViens: true,
          },
        },
      },
    });
  }

  async getDepartmentById(maKhoa: string) {
    const khoa = await this.prisma.khoa.findUnique({
      where: { MaKhoa: maKhoa },
      include: {
        truongKhoa: {
          include: {
            nhanVien: true,
          },
        },
        phongs: {
          include: {
            giuongBenhs: true,
          },
        },
      },
    });

    if (!khoa) {
      throw new NotFoundException(`Khoa với mã ${maKhoa} không tồn tại`);
    }

    return khoa;
  }

  async getAvailableRooms(maKhoa?: string) {
    const whereCondition: any = {};
    if (maKhoa) {
      whereCondition.MaKhoa = maKhoa;
    }

    const rooms = await this.prisma.phong.findMany({
      where: whereCondition,
      include: {
        khoa: {
          select: {
            TenKhoa: true,
          },
        },
        giuongBenhs: true,
      },
    });

    // Check available bed slots
    return rooms.map((room) => {
      const activeBeds = room.giuongBenhs.filter(
        (b) => b.TrangThaiGiuong === 'TRONG',
      ).length;
      return {
        ...room,
        soGiuongConTrong: activeBeds,
        tongSoGiuong: room.giuongBenhs.length,
      };
    });
  }

  async getBedMap() {
    return this.prisma.giuongBenh.findMany({
      include: {
        phong: {
          include: {
            khoa: {
              select: {
                TenKhoa: true,
              },
            },
          },
        },
        phanGiuongs: {
          where: {
            NgayKetThuc: null,
          },
          include: {
            bnNoiTru: {
              include: {
                benhNhan: {
                  select: {
                    HoTen: true,
                    GioiTinh: true,
                    NgaySinh: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { MaPhong: 'asc' },
        { SoGiuong: 'asc' },
      ],
    });
  }
}
