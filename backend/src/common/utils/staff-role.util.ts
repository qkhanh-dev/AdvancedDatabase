import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';

const partialRoleOverrides = new Map<string, Role>();
const runtimePasswordHashes = new Map<string, string>();

export function registerPartialStaffRole(maNV: string, role: Role): void {
  partialRoleOverrides.set(maNV, role);
}

export async function registerStaffPassword(maNV: string, rawPassword: string): Promise<void> {
  const hash = await bcrypt.hash(rawPassword, 10);
  runtimePasswordHashes.set(maNV, hash);
}

export async function verifyStaffPassword(maNV: string, inputPassword: string): Promise<boolean> {
  const customHash = runtimePasswordHashes.get(maNV);
  if (customHash) {
    return bcrypt.compare(inputPassword, customHash);
  }
  const defaultPassword = process.env.DEFAULT_STAFF_PASSWORD || '123456';
  return inputPassword === defaultPassword;
}

export function resolveStaffRole(nhanVien: {
  MaNV: string;
  HoTen?: string;
  bacSi?: unknown | null;
  dieuDuong?: unknown | null;
  kyThuatVien?: unknown | null;
}): Role {
  if (nhanVien.bacSi) return Role.BAC_SI;
  if (nhanVien.dieuDuong) return Role.DIEU_DUONG;
  if (nhanVien.kyThuatVien) return Role.KY_THUAT_VIEN;

  const override = partialRoleOverrides.get(nhanVien.MaNV);
  if (override) return override;

  const id = nhanVien.MaNV.toUpperCase();
  if (id.startsWith('ADMIN') || id.includes('ADMIN') || id.startsWith('QT')) {
    return Role.ADMIN;
  }
  if (id.startsWith('NV_TN') || id.startsWith('TN') || id.includes('THU_NGAN')) {
    return Role.THU_NGAN;
  }
  return Role.TIEP_NHAN;
}
