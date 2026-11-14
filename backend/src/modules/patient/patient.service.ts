import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceptionDto } from './dto/reception.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async reception(dto: ReceptionDto) {
    const maBN = dto.maBN || `BN${Date.now().toString().slice(-8)}`;

    return this.prisma.$transaction(async (tx) => {
      // Check existing patient with CCCD or SoBHYT if provided
      if (dto.cccd) {
        const exist = await tx.benhNhan.findUnique({ where: { CCCD: dto.cccd } });
        if (exist) {
          throw new BadRequestException(`Bệnh nhân với CCCD ${dto.cccd} đã tồn tại trong hệ thống (Mã: ${exist.MaBN})`);
        }
      }

      if (dto.soBHYT) {
        const exist = await tx.benhNhan.findUnique({ where: { SoBHYT: dto.soBHYT } });
        if (exist) {
          throw new BadRequestException(`Bệnh nhân với số BHYT ${dto.soBHYT} đã tồn tại trong hệ thống`);
        }
      }

      const benhNhan = await tx.benhNhan.create({
        data: {
          MaBN: maBN,
          HoTen: dto.hoTen,
          NgaySinh: new Date(dto.ngaySinh),
          GioiTinh: dto.gioiTinh,
          CCCD: dto.cccd || null,
          SoDienThoai: dto.soDienThoai || null,
          SoBHYT: dto.soBHYT || null,
          MucHuongBHYT: dto.mucHuongBHYT || null,
          DiaChi: dto.diaChi,
          NhomMau: dto.nhomMau || null,
          CoNgoaiTru: dto.isNgoaiTru ?? true,
          CoNoiTru: false,
        },
      });

      if (dto.isNgoaiTru ?? true) {
        await tx.bnNgoaiTru.create({
          data: {
            MaBN: maBN,
            SoSoKhamBenh: `SO_${maBN}`,
            NgayDangKyDau: new Date(),
            TinhTrangTheoDoi: 'Hồ sơ khám ngoại trú mới tạo',
          },
        });
      }

      return tx.benhNhan.findUnique({
        where: { MaBN: maBN },
        include: {
          bnNgoaiTru: true,
          bnNoiTru: true,
        },
      });
    });
  }

  async lookup(query: string) {
    if (!query) {
      throw new BadRequestException('Vui lòng cung cấp MaBN, CCCD hoặc SoBHYT để tra cứu');
    }

    const patient = await this.prisma.benhNhan.findFirst({
      where: {
        OR: [
          { MaBN: query },
          { CCCD: query },
          { SoBHYT: query },
          { SoDienThoai: query },
        ],
      },
      include: {
        bnNgoaiTru: true,
        bnNoiTru: {
          include: {
            bacSiTheoDoi: {
              include: {
                nhanVien: true,
              },
            },
            phanGiuongs: {
              include: {
                giuongBenh: {
                  include: {
                    phong: true,
                  },
                },
              },
            },
          },
        },
        luotKhams: {
          orderBy: { ThoiGianKham: 'desc' },
          include: {
            bacSi: {
              include: {
                nhanVien: true,
              },
            },
            phongKham: true,
            donThuoc: {
              include: {
                ctDonThuocs: {
                  include: {
                    thuoc: true,
                  },
                },
              },
            },
            suDungDvs: {
              include: {
                dichVu: true,
              },
            },
            hoaDon: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Không tìm thấy bệnh nhân khớp với từ khóa: ${query}`);
    }

    return patient;
  }

  async getAllPatients(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.benhNhan.findMany({
        skip,
        take: limit,
        orderBy: { MaBN: 'desc' },
        include: {
          bnNgoaiTru: true,
          bnNoiTru: true,
        },
      }),
      this.prisma.benhNhan.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
