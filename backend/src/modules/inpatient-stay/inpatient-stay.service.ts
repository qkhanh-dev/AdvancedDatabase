import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAdmissionDto,
  CreateBedAllocationDto,
  DischargeAdmissionDto,
  TransferBedDto,
} from './dto/inpatient.dto';
import { addUtcDays, formatDateOnly, parseDateOnlyUtc } from '../../common/utils/date.util';
import { TrangThaiGiuong } from '../../common/enums/role.enum';

function rangesOverlap(
  aStart: Date,
  aEndExclusive: Date | null,
  bStart: Date,
  bEndExclusive: Date | null,
): boolean {
  const maxDate = 8640000000000000;
  const aS = aStart.getTime();
  const aE = aEndExclusive ? aEndExclusive.getTime() : maxDate;
  const bS = bStart.getTime();
  const bE = bEndExclusive ? bEndExclusive.getTime() : maxDate;
  return aS < bE && bS < aE;
}

@Injectable()
export class InpatientStayService {
  constructor(private prisma: PrismaService) {}

  private rethrowConcurrency(error: unknown, ruleCode: string, message: string): never {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2034' || error.code === 'P2002') {
        throw new ConflictException({ ruleCode, message });
      }
      if (error.code === 'P2010' || error.code === 'P2004') {
        const match = error.message.match(/\[(BR-V2-\d{2})\]/);
        const code = match ? match[1] : ruleCode;
        throw new ConflictException({ ruleCode: code, message: error.message });
      }
    }
    throw error;
  }

  async getAdmissions(openOnly?: boolean, maBN?: string) {
    const list = await this.prisma.dotNoiTru.findMany({
      where: {
        ...(openOnly ? { NgayRaVien: null } : {}),
        ...(maBN ? { MaBN: maBN } : {}),
      },
      include: {
        benhNhan: true,
        phanGiuongs: {
          include: { giuongBenh: { include: { phong: true } } },
          orderBy: { TuNgay: 'asc' },
        },
        luotKhams: { orderBy: { NgayGioKham: 'desc' } },
      },
      orderBy: { NgayNhapVien: 'desc' },
    });

    return list.map((d) => ({
      ...d,
      NgayNhapVien: formatDateOnly(d.NgayNhapVien),
      NgayRaVien: formatDateOnly(d.NgayRaVien),
      benhNhan: {
        ...d.benhNhan,
        NgaySinh: formatDateOnly(d.benhNhan.NgaySinh),
      },
      phanGiuongs: d.phanGiuongs.map((pg) => ({
        ...pg,
        TuNgay: formatDateOnly(pg.TuNgay),
        DenNgay: formatDateOnly(pg.DenNgay),
        giuongBenh: {
          ...pg.giuongBenh,
          DonGiaNgay: Number(pg.giuongBenh.DonGiaNgay),
        },
      })),
    }));
  }

  // BR-V2-02 & BR-V2-12: Mở DOT_NOI_TRU với khóa theo MaBN, tối đa 1 đợt mở và không chồng khoảng
  async createAdmission(dto: CreateAdmissionDto) {
    const ngayNhapVien = parseDateOnlyUtc(dto.ngayNhapVien);
    const maDotNT = dto.maDotNT || `DOT_${Date.now().toString().slice(-8)}`;

    try {
      const created = await this.prisma.$transaction(
        async (tx) => {
          const lockedPatient = await tx.$queryRaw<Array<{ MaBN: string }>>`
            SELECT "MaBN" FROM "BENH_NHAN" WHERE "MaBN" = ${dto.maBN} FOR UPDATE
          `;
          if (!lockedPatient || lockedPatient.length === 0) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Bệnh nhân ${dto.maBN} không tồn tại`,
            });
          }

          const existingDots = await tx.dotNoiTru.findMany({
            where: { MaBN: dto.maBN },
          });

          const openDot = existingDots.find((d) => d.NgayRaVien === null);
          if (openDot) {
            throw new ConflictException({
              ruleCode: 'BR-V2-12',
              message: `Bệnh nhân ${dto.maBN} đang có đợt nội trú mở (${openDot.MaDotNT}) chưa ra viện`,
            });
          }

          for (const d of existingDots) {
            const dStart = parseDateOnlyUtc(d.NgayNhapVien);
            const dEnd = d.NgayRaVien ? addUtcDays(parseDateOnlyUtc(d.NgayRaVien), 1) : null;
            if (rangesOverlap(ngayNhapVien, null, dStart, dEnd)) {
              throw new ConflictException({
                ruleCode: 'BR-V2-12',
                message: `Khoảng điều trị từ ${formatDateOnly(ngayNhapVien)} chồng lấn với đợt ${d.MaDotNT} (${formatDateOnly(dStart)} .. ${formatDateOnly(d.NgayRaVien)})`,
              });
            }
          }

          return tx.dotNoiTru.create({
            data: {
              MaDotNT: maDotNT,
              MaBN: dto.maBN,
              NgayNhapVien: ngayNhapVien,
              NguoiNhaLienHe: dto.nguoiNhaLienHe,
              TinhTrangNhapVien: dto.tinhTrangNhapVien,
              NgayRaVien: null,
            },
            include: { benhNhan: true },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return {
        ...created,
        NgayNhapVien: formatDateOnly(created.NgayNhapVien),
        NgayRaVien: formatDateOnly(created.NgayRaVien),
      };
    } catch (error) {
      this.rethrowConcurrency(
        error,
        'BR-V2-12',
        `Xung đột tạo đợt nội trú cho bệnh nhân ${dto.maBN}`,
      );
    }
  }

  // BR-V2-03 & BR-V2-11: Phân giường [TuNgay, DenNgay) với khóa đồng thời trên DOT_NOI_TRU & GIUONG_BENH
  async allocateBed(dto: CreateBedAllocationDto) {
    const tuNgay = parseDateOnlyUtc(dto.tuNgay);
    const denNgay = dto.denNgay ? parseDateOnlyUtc(dto.denNgay) : null;

    if (denNgay && denNgay <= tuNgay) {
      throw new BadRequestException({
        ruleCode: 'BR-V2-03',
        message: 'DenNgay phải > TuNgay theo quy ước khoảng nửa mở [TuNgay, DenNgay)',
      });
    }

    try {
      const created = await this.prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT "MaDotNT" FROM "DOT_NOI_TRU" WHERE "MaDotNT" = ${dto.maDotNT} FOR UPDATE
          `;
          await tx.$queryRaw`
            SELECT "MaGiuong" FROM "GIUONG_BENH" WHERE "MaGiuong" = ${dto.maGiuong} FOR UPDATE
          `;

          const dot = await tx.dotNoiTru.findUnique({ where: { MaDotNT: dto.maDotNT } });
          if (!dot) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Đợt nội trú ${dto.maDotNT} không tồn tại`,
            });
          }

          const bed = await tx.giuongBenh.findUnique({
            where: { MaGiuong: dto.maGiuong },
            include: { phong: true },
          });
          if (!bed) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Giường bệnh ${dto.maGiuong} không tồn tại`,
            });
          }

          if (bed.TrangThai !== TrangThaiGiuong.SAN_SANG) {
            throw new ConflictException({
              ruleCode: 'BR-V2-11',
              message: `Giường ${dto.maGiuong} đang ở trạng thái ${bed.TrangThai}, không thể phân giường`,
            });
          }

          const dotStart = parseDateOnlyUtc(dot.NgayNhapVien);
          if (tuNgay < dotStart) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-03',
              message: `TuNgay (${formatDateOnly(tuNgay)}) phải >= NgayNhapVien (${formatDateOnly(dotStart)})`,
            });
          }

          if (dot.NgayRaVien) {
            const maxEnd = addUtcDays(parseDateOnlyUtc(dot.NgayRaVien), 1);
            if (!denNgay || denNgay > maxEnd) {
              throw new BadRequestException({
                ruleCode: 'BR-V2-03',
                message: `Đợt ${dto.maDotNT} đã ra viện, DenNgay phải khác NULL và <= ${formatDateOnly(maxEnd)}`,
              });
            }
          }

          const bedAllocs = await tx.phanGiuong.findMany({
            where: { MaGiuong: dto.maGiuong },
          });
          for (const a of bedAllocs) {
            if (rangesOverlap(tuNgay, denNgay, parseDateOnlyUtc(a.TuNgay), a.DenNgay ? parseDateOnlyUtc(a.DenNgay) : null)) {
              throw new ConflictException({
                ruleCode: 'BR-V2-03',
                message: `Giường ${dto.maGiuong} đã có khoảng phân giường [${formatDateOnly(a.TuNgay)}, ${formatDateOnly(a.DenNgay) ?? 'NULL'}) giao nhau`,
              });
            }
          }

          const dotAllocs = await tx.phanGiuong.findMany({
            where: { MaDotNT: dto.maDotNT },
          });
          for (const a of dotAllocs) {
            if (rangesOverlap(tuNgay, denNgay, parseDateOnlyUtc(a.TuNgay), a.DenNgay ? parseDateOnlyUtc(a.DenNgay) : null)) {
              throw new ConflictException({
                ruleCode: 'BR-V2-03',
                message: `Đợt nội trú ${dto.maDotNT} đã nằm giường ${a.MaGiuong} trong khoảng giao nhau [${formatDateOnly(a.TuNgay)}, ${formatDateOnly(a.DenNgay) ?? 'NULL'})`,
              });
            }
          }

          return tx.phanGiuong.create({
            data: {
              MaDotNT: dto.maDotNT,
              MaGiuong: dto.maGiuong,
              TuNgay: tuNgay,
              DenNgay: denNgay,
            },
            include: {
              dotNoiTru: true,
              giuongBenh: { include: { phong: true } },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return {
        ...created,
        TuNgay: formatDateOnly(created.TuNgay),
        DenNgay: formatDateOnly(created.DenNgay),
      };
    } catch (error) {
      this.rethrowConcurrency(
        error,
        'BR-V2-03',
        `Xung đột đồng thời khi phân giường ${dto.maGiuong}`,
      );
    }
  }

  // BR-V2-03 & BR-V2-11: Chuyển giường trong 1 transaction có khóa (không chuyển cùng ngày)
  async transferBed(dto: TransferBedDto) {
    const ngayChuyen = parseDateOnlyUtc(dto.ngayChuyen);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT "MaDotNT" FROM "DOT_NOI_TRU" WHERE "MaDotNT" = ${dto.maDotNT} FOR UPDATE
          `;

          const dot = await tx.dotNoiTru.findUnique({ where: { MaDotNT: dto.maDotNT } });
          if (!dot) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Đợt nội trú ${dto.maDotNT} không tồn tại`,
            });
          }
          if (dot.NgayRaVien) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-03',
              message: `Đợt nội trú ${dto.maDotNT} đã ra viện, không thể chuyển giường`,
            });
          }

          const currentAlloc = await tx.phanGiuong.findFirst({
            where: { MaDotNT: dto.maDotNT, DenNgay: null },
          });
          if (!currentAlloc) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-03',
              message: `Đợt nội trú ${dto.maDotNT} chưa có phân giường đang mở để chuyển`,
            });
          }

          if (currentAlloc.MaGiuong === dto.maGiuongMoi) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-03',
              message: 'Giường mới phải khác giường hiện tại',
            });
          }

          const currentStart = parseDateOnlyUtc(currentAlloc.TuNgay);
          if (ngayChuyen <= currentStart) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-03',
              message: `NgayChuyen (${formatDateOnly(ngayChuyen)}) phải > TuNgay hiện tại (${formatDateOnly(currentStart)}), không hỗ trợ chuyển nhiều lần trong ngày`,
            });
          }

          // Lock cả 2 giường theo thứ tự mã giường để tránh deadlock
          const bedIds = [currentAlloc.MaGiuong, dto.maGiuongMoi].sort();
          for (const id of bedIds) {
            await tx.$queryRaw`SELECT "MaGiuong" FROM "GIUONG_BENH" WHERE "MaGiuong" = ${id} FOR UPDATE`;
          }

          const targetBed = await tx.giuongBenh.findUnique({
            where: { MaGiuong: dto.maGiuongMoi },
          });
          if (!targetBed) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Giường mới ${dto.maGiuongMoi} không tồn tại`,
            });
          }
          if (targetBed.TrangThai !== TrangThaiGiuong.SAN_SANG) {
            throw new ConflictException({
              ruleCode: 'BR-V2-11',
              message: `Giường mới ${dto.maGiuongMoi} đang ở trạng thái ${targetBed.TrangThai}, không thể nhận bệnh nhân`,
            });
          }

          const targetBedAllocs = await tx.phanGiuong.findMany({
            where: { MaGiuong: dto.maGiuongMoi },
          });
          for (const a of targetBedAllocs) {
            if (rangesOverlap(ngayChuyen, null, parseDateOnlyUtc(a.TuNgay), a.DenNgay ? parseDateOnlyUtc(a.DenNgay) : null)) {
              throw new ConflictException({
                ruleCode: 'BR-V2-03',
                message: `Giường mới ${dto.maGiuongMoi} đã có lịch phân giường giao nhau với [${formatDateOnly(ngayChuyen)}, NULL)`,
              });
            }
          }

          const closedOld = await tx.phanGiuong.update({
            where: {
              MaDotNT_MaGiuong_TuNgay: {
                MaDotNT: currentAlloc.MaDotNT,
                MaGiuong: currentAlloc.MaGiuong,
                TuNgay: currentAlloc.TuNgay,
              },
            },
            data: { DenNgay: ngayChuyen },
          });

          const createdNew = await tx.phanGiuong.create({
            data: {
              MaDotNT: dto.maDotNT,
              MaGiuong: dto.maGiuongMoi,
              TuNgay: ngayChuyen,
              DenNgay: null,
            },
          });

          return {
            closedAllocation: {
              ...closedOld,
              TuNgay: formatDateOnly(closedOld.TuNgay),
              DenNgay: formatDateOnly(closedOld.DenNgay),
            },
            newAllocation: {
              ...createdNew,
              TuNgay: formatDateOnly(createdNew.TuNgay),
              DenNgay: formatDateOnly(createdNew.DenNgay),
            },
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.rethrowConcurrency(
        error,
        'BR-V2-03',
        `Xung đột đồng thời khi chuyển sang giường ${dto.maGiuongMoi}`,
      );
    }
  }

  // BR-V2-02, BR-V2-03, BR-V2-04, BR-V2-12: Đóng đợt nội trú & đóng mọi phân giường mở trong cùng transaction
  async dischargeAdmission(maDotNT: string, dto: DischargeAdmissionDto) {
    const ngayRaVien = parseDateOnlyUtc(dto.ngayRaVien);
    const closeDenNgay = addUtcDays(ngayRaVien, 1);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const dot = await tx.dotNoiTru.findUnique({ where: { MaDotNT: maDotNT } });
          if (!dot) {
            throw new NotFoundException({
              ruleCode: 'NOT_FOUND',
              message: `Đợt nội trú ${maDotNT} không tồn tại`,
            });
          }

          await tx.$queryRaw`SELECT "MaBN" FROM "BENH_NHAN" WHERE "MaBN" = ${dot.MaBN} FOR UPDATE`;
          await tx.$queryRaw`SELECT "MaDotNT" FROM "DOT_NOI_TRU" WHERE "MaDotNT" = ${maDotNT} FOR UPDATE`;

          const ngayNhapVien = parseDateOnlyUtc(dot.NgayNhapVien);
          if (ngayRaVien < ngayNhapVien) {
            throw new BadRequestException({
              ruleCode: 'BR-V2-02',
              message: `NgayRaVien (${formatDateOnly(ngayRaVien)}) phải >= NgayNhapVien (${formatDateOnly(ngayNhapVien)})`,
            });
          }

          const otherDots = await tx.dotNoiTru.findMany({
            where: { MaBN: dot.MaBN, MaDotNT: { not: maDotNT } },
          });
          for (const d of otherDots) {
            const dStart = parseDateOnlyUtc(d.NgayNhapVien);
            const dEnd = d.NgayRaVien ? addUtcDays(parseDateOnlyUtc(d.NgayRaVien), 1) : null;
            if (rangesOverlap(ngayNhapVien, closeDenNgay, dStart, dEnd)) {
              throw new ConflictException({
                ruleCode: 'BR-V2-12',
                message: `Khoảng điều trị [${formatDateOnly(ngayNhapVien)}, ${formatDateOnly(closeDenNgay)}) chồng lấn với đợt ${d.MaDotNT}`,
              });
            }
          }

          const exams = await tx.luotKham.findMany({ where: { MaDotNT: maDotNT } });
          for (const ex of exams) {
            if (ex.NgayGioKham >= closeDenNgay) {
              throw new ConflictException({
                ruleCode: 'BR-V2-04',
                message: `Lượt khám nội trú ${ex.MaLuotKham} (${ex.NgayGioKham.toISOString()}) nằm sau ngày ra viện ${formatDateOnly(ngayRaVien)}`,
              });
            }
          }

          const allocs = await tx.phanGiuong.findMany({ where: { MaDotNT: maDotNT } });
          const closedAllocations = [];
          for (const a of allocs) {
            const tuNgay = parseDateOnlyUtc(a.TuNgay);
            if (a.DenNgay) {
              const denNgay = parseDateOnlyUtc(a.DenNgay);
              if (denNgay > closeDenNgay) {
                throw new BadRequestException({
                  ruleCode: 'BR-V2-03',
                  message: `Phân giường (${a.MaGiuong}, ${formatDateOnly(tuNgay)}) có DenNgay (${formatDateOnly(denNgay)}) > NgayRaVien + 1 (${formatDateOnly(closeDenNgay)})`,
                });
              }
            } else {
              if (closeDenNgay <= tuNgay) {
                throw new BadRequestException({
                  ruleCode: 'BR-V2-03',
                  message: `NgayRaVien (${formatDateOnly(ngayRaVien)}) khiến DenNgay (${formatDateOnly(closeDenNgay)}) <= TuNgay (${formatDateOnly(tuNgay)})`,
                });
              }

              await tx.$queryRaw`
                SELECT "MaGiuong" FROM "GIUONG_BENH" WHERE "MaGiuong" = ${a.MaGiuong} FOR UPDATE
              `;

              const updatedPg = await tx.phanGiuong.update({
                where: {
                  MaDotNT_MaGiuong_TuNgay: {
                    MaDotNT: a.MaDotNT,
                    MaGiuong: a.MaGiuong,
                    TuNgay: a.TuNgay,
                  },
                },
                data: { DenNgay: closeDenNgay },
              });
              closedAllocations.push({
                ...updatedPg,
                TuNgay: formatDateOnly(updatedPg.TuNgay),
                DenNgay: formatDateOnly(updatedPg.DenNgay),
              });
            }
          }

          const updatedDot = await tx.dotNoiTru.update({
            where: { MaDotNT: maDotNT },
            data: { NgayRaVien: ngayRaVien },
          });

          return {
            ...updatedDot,
            NgayNhapVien: formatDateOnly(updatedDot.NgayNhapVien),
            NgayRaVien: formatDateOnly(updatedDot.NgayRaVien),
            closedBedAllocations: closedAllocations,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.rethrowConcurrency(
        error,
        'BR-V2-03',
        `Xung đột đồng thời khi xuất viện đợt ${maDotNT}`,
      );
    }
  }
}
