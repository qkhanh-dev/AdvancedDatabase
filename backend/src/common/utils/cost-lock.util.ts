import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { roundMoney2 } from './date.util';

export async function lockLuotKhamAndAssertUnlocked(
  tx: Prisma.TransactionClient,
  maLuotKham: string,
) {
  const locked = await tx.$queryRaw<Array<{ MaLuotKham: string }>>`
    SELECT "MaLuotKham" FROM "LUOT_KHAM" WHERE "MaLuotKham" = ${maLuotKham} FOR UPDATE
  `;
  if (!locked || locked.length === 0) {
    throw new NotFoundException({
      ruleCode: 'NOT_FOUND',
      message: `Lượt khám ${maLuotKham} không tồn tại`,
    });
  }

  const vienPhi = await tx.vienPhi.findUnique({
    where: { MaLuotKham: maLuotKham },
  });

  if (vienPhi && vienPhi.TrangThaiThanhToan === 'DA_THANH_TOAN') {
    throw new ConflictException({
      ruleCode: 'BR-V2-08',
      message: `Viện phí ${vienPhi.MaHoaDon} của lượt khám ${maLuotKham} đã thanh toán, khóa mọi thao tác thay đổi chi phí`,
    });
  }

  return vienPhi;
}

export async function computeExamCostSummary(
  tx: Prisma.TransactionClient,
  maLuotKham: string,
): Promise<{ TongTienThuoc: number; TongTienDichVu: number; TongChiPhi: number }> {
  const rows = await tx.$queryRaw<Array<{ TongTienThuoc: string; TongTienDichVu: string }>>`
    SELECT "TongTienThuoc", "TongTienDichVu"
    FROM "V_LUOT_KHAM_CHI_PHI"
    WHERE "MaLuotKham" = ${maLuotKham}
  `;

  const tongTienThuoc = roundMoney2(Number(rows[0]?.TongTienThuoc ?? 0));
  const tongTienDichVu = roundMoney2(Number(rows[0]?.TongTienDichVu ?? 0));
  const tongChiPhi = roundMoney2(tongTienThuoc + tongTienDichVu);

  return {
    TongTienThuoc: tongTienThuoc,
    TongTienDichVu: tongTienDichVu,
    TongChiPhi: tongChiPhi,
  };
}

export async function assertTruBHYTBoundsForExam(
  tx: Prisma.TransactionClient,
  maLuotKham: string,
): Promise<void> {
  const vienPhi = await tx.vienPhi.findUnique({
    where: { MaLuotKham: maLuotKham },
  });
  if (!vienPhi) return;

  const { TongChiPhi } = await computeExamCostSummary(tx, maLuotKham);
  const truBHYT = Number(vienPhi.TruBHYT);

  if (truBHYT < 0 || truBHYT > TongChiPhi) {
    throw new ConflictException({
      ruleCode: 'BR-V2-13',
      message: `Thao tác làm tổng chi phí (${TongChiPhi}) nhỏ hơn TruBHYT đã lập (${truBHYT}) trên hóa đơn ${vienPhi.MaHoaDon}`,
    });
  }
}
