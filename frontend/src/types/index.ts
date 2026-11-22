// ============================================================================
// ENUMS & MIỀN GIÁ TRỊ CHUẨN v2 (18 BẢNG · 13 NHÓM QUY TẮC · API_Contract_v2)
// ============================================================================

export enum GioiTinhEnum {
  NAM = "NAM",
  NU = "NU",
  KHAC = "KHAC",
}

export enum RoleEnum {
  ADMIN = "ADMIN",
  BAC_SI = "BAC_SI",
  DIEU_DUONG = "DIEU_DUONG",
  KY_THUAT_VIEN = "KY_THUAT_VIEN",
  TIEP_NHAN = "TIEP_NHAN",
  THU_NGAN = "THU_NGAN",
}

// BR-V2-11: Chỉ phản ánh tình trạng khai thác; có người nằm được suy diễn từ PHAN_GIUONG theo ngày
export enum TrangThaiGiuongEnum {
  SAN_SANG = "SAN_SANG",
  BAO_TRI = "BAO_TRI",
  NGUNG_SU_DUNG = "NGUNG_SU_DUNG",
}

export enum TrangThaiKhamEnum {
  CHO_KHAM = "CHO_KHAM",
  DANG_KHAM = "DANG_KHAM",
  CHO_XET_NGHIEM = "CHO_XET_NGHIEM",
  HOAN_TAT = "HOAN_TAT",
  HUY = "HUY",
}

export enum HinhThucTTEnum {
  TIEN_MAT = "TIEN_MAT",
  CHUYEN_KHOAN = "CHUYEN_KHOAN",
  THE = "THE",
}

export enum TrangThaiTTEnum {
  CHUA_THANH_TOAN = "CHUA_THANH_TOAN",
  DA_THANH_TOAN = "DA_THANH_TOAN",
}

export type LoaiChuyenMonFilter = "BAC_SI" | "DIEU_DUONG" | "KY_THUAT_VIEN" | "KHAC";

// ============================================================================
// GLOBAL ERROR CONTRACT (API_Contract_v2 Mục 4)
// ============================================================================

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  ruleCode: string;
  message: string | string[];
}

// ============================================================================
// 18 THỰC THỂ LƯU TRỮ (103 CỘT) + 6 THUỘC TÍNH DẪN XUẤT (VIEW / QUERY)
// ============================================================================

export interface Khoa {
  MaKhoa: string;
  TenKhoa: string;
  DiaDiem: string;
  SoDienThoai: string;
  phongs?: Phong[];
  _count?: {
    nhanViens: number;
    phongs: number;
  };
}

export interface Phong {
  MaPhong: string;
  MaKhoa: string;
  TenPhong: string;
  LoaiPhong: string;
  ViTri: string;
  khoa?: Khoa;
  giuongBenhs?: GiuongBenh[];
}

export interface GiuongBenh {
  MaGiuong: string;
  MaPhong: string;
  SoGiuong: string;
  LoaiGiuong: string;
  TrangThai: TrangThaiGiuongEnum | string;
  DonGiaNgay: number | string;
  phong?: Phong;
  date?: string;
  // Thuộc tính suy diễn tại ngày tra cứu D từ PHAN_GIUONG (không lưu cột):
  dangCoNguoiNam?: boolean;
  phanGiuongHienTai?: PhanGiuong | null;
}

export interface BacSi {
  MaNV: string;
  ChuyenKhoa: string;
  TrinhDoHocVan: string;
  SoChungChiHanhNghe: string;
  nhanVien?: NhanVien;
}

export interface DieuDuong {
  MaNV: string;
  CapBac: string;
  ChungChiHanhNghe: string;
  nhanVien?: NhanVien;
}

export interface KyThuatVien {
  MaNV: string;
  ChuyenMonXetNghiem: string;
  BTD_ThietBiPhuTrach: string;
  nhanVien?: NhanVien;
}

export interface NhanVien {
  MaNV: string;
  MaKhoa: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string;
  CCCD: string;
  DiaChi: string;
  SoDienThoai: string;
  NgayVaoLam: string;
  SoNamCongTac?: number; // Dẫn xuất (V_NHAN_VIEN)
  role?: RoleEnum;
  khoa?: Khoa;
  bacSi?: BacSi | null;
  dieuDuong?: DieuDuong | null;
  kyThuatVien?: KyThuatVien | null;
}

export interface TheBHYT {
  MaTheBHYT: string;
  MaBN: string;
  MucHuong: number | string; // DECIMAL(5,4) trong [0, 1]
  NgayBatDau: string;
  NgayHetHan: string;
}

export interface BenhNhan {
  MaBN: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string;
  CCCD: string;
  SDT: string;
  DiaChi_Duong: string;
  DiaChi_Phuong: string;
  DiaChi_Quan: string;
  NhomMau: string;
  Tuoi?: number; // Dẫn xuất (V_BENH_NHAN)
  theBHYTs?: TheBHYT[];
  dotNoiTrus?: DotNoiTru[];
  luotKhams?: LuotKham[];
}

export interface DotNoiTru {
  MaDotNT: string;
  MaBN: string;
  NgayNhapVien: string;
  NguoiNhaLienHe: string;
  TinhTrangNhapVien: string;
  NgayRaVien: string | null;
  benhNhan?: BenhNhan;
  phanGiuongs?: PhanGiuong[];
  luotKhams?: LuotKham[];
}

export interface PhanGiuong {
  MaDotNT: string;
  MaGiuong: string;
  TuNgay: string;
  DenNgay: string | null;
  dotNoiTru?: DotNoiTru;
  giuongBenh?: GiuongBenh;
}

export interface Thuoc {
  MaThuoc: string;
  TenThuoc: string;
  HoatChat: string;
  HamLuong: string;
  DonViTinh: string;
  DonGia: number | string;
  HuongDanSD: string;
}

export interface ChiTietDonThuoc {
  MaDonThuoc: string;
  MaThuoc: string;
  SoLuong: number;
  LieuDung: string;
  DonGiaKe: number | string; // Giá lịch sử snapshot tại thời điểm kê đơn
  thuoc?: Thuoc;
}

export interface DonThuoc {
  MaDonThuoc: string;
  MaLuotKham: string;
  NgayKeDon: string;
  LoiDanCuaBacSi: string;
  TongTienThuoc?: number; // Dẫn xuất (V_DON_THUOC)
  chiTietDonThuocs?: ChiTietDonThuoc[];
}

export interface LoaiXetNghiem {
  MaLoaiXN: string;
  TenXN: string;
  ChiTieuBinhThuong: string;
  DonGia: number | string;
}

export interface PhieuXetNghiem {
  MaPhieuXN: string;
  MaLuotKham: string;
  MaLoaiXN: string;
  MaNV_KTV: string | null;
  NgayGioXN: string | null;
  NgayGioTraKQ: string | null;
  KetQua: string | null;
  DanhGia: string | null;
  DonGiaXN: number | string; // Giá lịch sử snapshot tại thời điểm chỉ định
  loaiXetNghiem?: LoaiXetNghiem;
  kyThuatVien?: KyThuatVien | null;
  luotKham?: LuotKham;
}

export interface VienPhi {
  MaHoaDon: string;
  MaLuotKham: string;
  MaTheBHYT?: string | null;
  MaNV_ThuNgan: string;
  NgayLap: string;
  HinhThucThanhToan: HinhThucTTEnum | string;
  TruBHYT: number | string;
  TrangThaiThanhToan: TrangThaiTTEnum | string;
  TongTienThuoc?: number; // Dẫn xuất (V_VIEN_PHI)
  TongTienDichVu?: number; // Dẫn xuất (V_VIEN_PHI)
  ThucThu?: number; // Dẫn xuất (V_VIEN_PHI)
  theBHYT?: TheBHYT | null;
  nhanVienThuNgan?: NhanVien | null;
  luotKham?: LuotKham;
}

export interface LuotKham {
  MaLuotKham: string;
  MaBN: string;
  MaNV_BacSi: string;
  NgayGioKham: string;
  LyDoKham: string;
  TrieuChung: string;
  ChanDoanSoBo: string;
  TrangThai: TrangThaiKhamEnum | string;
  MaDotNT: string | null;
  benhNhan?: BenhNhan;
  bacSi?: BacSi;
  dotNoiTru?: DotNoiTru | null;
  donThuoc?: DonThuoc | null;
  phieuXetNghiems?: PhieuXetNghiem[];
  vienPhi?: VienPhi | null;
}

// ============================================================================
// AUTH, BILLING PREVIEW & REPORT PAYLOADS
// ============================================================================

export interface AuthUserPayload {
  maNV: string;
  hoTen: string;
  maKhoa: string;
  soDienThoai: string;
  MaNV: string;
  MaKhoa: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: string;
  CCCD: string;
  DiaChi: string;
  SoDienThoai: string;
  NgayVaoLam: string;
  SoNamCongTac: number;
  role: RoleEnum;
  tenKhoa: string;
  bacSi?: BacSi | null;
  dieuDuong?: DieuDuong | null;
  kyThuatVien?: KyThuatVien | null;
}

export interface AuthLoginResponse {
  access_token: string;
  user: AuthUserPayload;
}

export interface BillingPreviewResponse {
  MaLuotKham: string;
  MaBN: string;
  NgayKham: string;
  TongTienThuoc: number;
  TongTienDichVu: number;
  TongChiPhi: number;
  theBHYTHopLe: TheBHYT[];
  vienPhi: VienPhi | null;
}

export interface RevenueGroupSummary {
  soHoaDon: number;
  TongTienThuoc: number;
  TongTienDichVu: number;
  TruBHYT: number;
  ThucThu: number;
}

export interface DashboardReportResponse {
  date: string;
  tongBenhNhan: number;
  tongLuotKham: number;
  soDotNoiTruDangMo: number;
  congSuatGiuong: {
    tongGiuong: number;
    giuongSanSang: number;
    giuongBaoTri: number;
    giuongNgungSuDung: number;
    giuongDangCoNguoiNam: number;
    tyLeLapDay: number;
  };
  doanhThu: {
    TongTienThuoc: number;
    TongTienDichVu: number;
    TruBHYT: number;
    ThucThu: number;
    daThanhToan: RevenueGroupSummary;
    chuaThanhToan: RevenueGroupSummary;
  };
}

// ============================================================================
// REQUEST DTOs (camelCase chuẩn DTO NestJS v2)
// ============================================================================

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface CreateDepartmentDto {
  maKhoa: string;
  tenKhoa: string;
  diaDiem: string;
  soDienThoai: string;
}

export interface UpdateDepartmentDto {
  tenKhoa?: string;
  diaDiem?: string;
  soDienThoai?: string;
}

export interface CreateRoomDto {
  maPhong: string;
  maKhoa: string;
  tenPhong: string;
  loaiPhong: string;
  viTri: string;
}

export interface UpdateRoomDto {
  maKhoa?: string;
  tenPhong?: string;
  loaiPhong?: string;
  viTri?: string;
}

export interface UpdateBedStatusDto {
  trangThai: TrangThaiGiuongEnum;
  donGiaNgay?: number;
}

export interface CreateStaffDto {
  maNV: string;
  maKhoa: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinhEnum | string;
  cccd: string;
  diaChi: string;
  soDienThoai: string;
  ngayVaoLam: string;
  role?: RoleEnum;
  password?: string;
  bacSi?: {
    chuyenKhoa: string;
    trinhDoHocVan: string;
    soChungChiHanhNghe: string;
  };
  dieuDuong?: {
    capBac: string;
    chungChiHanhNghe: string;
  };
  kyThuatVien?: {
    chuyenMonXetNghiem: string;
    btdThietBiPhuTrach: string;
  };
}

export interface CreatePatientDto {
  maBN?: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinhEnum | string;
  cccd: string;
  sdt: string;
  diaChiDuong: string;
  diaChiPhuong: string;
  diaChiQuan: string;
  nhomMau: string;
}

export interface CreateInsuranceCardDto {
  maTheBHYT: string;
  mucHuong: number;
  ngayBatDau: string;
  ngayHetHan: string;
}

export interface CreateExaminationDto {
  maLuotKham?: string;
  maBN: string;
  maNV_BacSi: string;
  ngayGioKham?: string;
  lyDoKham: string;
  trieuChung: string;
  chanDoanSoBo: string;
  trangThai?: TrangThaiKhamEnum;
  maDotNT?: string | null;
}

export interface UpdateExaminationDto {
  lyDoKham?: string;
  trieuChung?: string;
  chanDoanSoBo?: string;
  trangThai?: TrangThaiKhamEnum;
  maDotNT?: string | null;
}

export interface PrescriptionItemDto {
  maThuoc: string;
  soLuong: number;
  lieuDung: string;
}

export interface CreatePrescriptionDto {
  maDonThuoc?: string;
  maLuotKham: string;
  ngayKeDon?: string;
  loiDanCuaBacSi: string;
  items: PrescriptionItemDto[];
}

export interface UpdatePrescriptionDto {
  ngayKeDon?: string;
  loiDanCuaBacSi?: string;
  items?: PrescriptionItemDto[];
}

export interface CreateLabRequestDto {
  maPhieuXN?: string;
  maLuotKham: string;
  maLoaiXN: string;
}

export interface StartLabRequestDto {
  maNV_KTV?: string;
  ngayGioXN?: string;
}

export interface CompleteLabRequestDto {
  maNV_KTV?: string;
  ngayGioXN?: string;
  ngayGioTraKQ?: string;
  ketQua: string;
  danhGia?: string | null;
}

export interface CreateAdmissionDto {
  maDotNT?: string;
  maBN: string;
  ngayNhapVien: string;
  nguoiNhaLienHe: string;
  tinhTrangNhapVien: string;
}

export interface CreateBedAllocationDto {
  maDotNT: string;
  maGiuong: string;
  tuNgay: string;
  denNgay?: string | null;
}

export interface TransferBedDto {
  maDotNT: string;
  maGiuongMoi: string;
  ngayChuyen: string;
}

export interface DischargeAdmissionDto {
  ngayRaVien: string;
}

export interface CreateInvoiceDto {
  maHoaDon?: string;
  maLuotKham: string;
  ngayLap?: string;
  hinhThucThanhToan: HinhThucTTEnum;
  maTheBHYT?: string | null;
}

export interface PayInvoiceDto {
  hinhThucThanhToan?: HinhThucTTEnum;
}
