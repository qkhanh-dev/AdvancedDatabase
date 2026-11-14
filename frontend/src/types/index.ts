// ============================================================================
// HỆ THỐNG QUẢN LÝ BỆNH VIỆN (QLBV) - FRONTEND TYPES (MÔ HÌNH BCNF VÀ API DTO)
// ============================================================================

export enum LoaiPhongEnum {
  KHAM = 'KHAM',
  NOI_TRU = 'NOI_TRU',
  CAP_CUU = 'CAP_CUU',
  XET_NGHIEM = 'XET_NGHIEM',
}

export enum LoaiGiuongEnum {
  TIEU_CHUAN = 'TIEU_CHUAN',
  VIP = 'VIP',
  CAP_CUU = 'CAP_CUU',
  HOI_SUC = 'HOI_SUC',
}

export enum TrangThaiGiuongEnum {
  TRONG = 'TRONG',
  DANG_SU_DUNG = 'DANG_SU_DUNG',
  BAO_TRI = 'BAO_TRI',
}

export enum LoaiNVEnum {
  BAC_SI = 'BAC_SI',
  DIEU_DUONG = 'DIEU_DUONG',
  HANH_CHINH = 'HANH_CHINH',
}

export enum GioiTinhEnum {
  NAM = 'NAM',
  NU = 'NU',
  KHAC = 'KHAC',
  CHUA_RO = 'CHUA_RO',
}

export enum NhomMauEnum {
  A = 'A',
  B = 'B',
  AB = 'AB',
  O = 'O',
  CHUA_RO = 'CHUA_RO',
}

export enum HuongXuTriEnum {
  KE_DON_VE = 'KE_DON_VE',
  NHAP_VIEN = 'NHAP_VIEN',
  CHUYEN_VIEN = 'CHUYEN_VIEN',
}

export enum TrangThaiPhatThuocEnum {
  CHUA_PHAT = 'CHUA_PHAT',
  DA_PHAT = 'DA_PHAT',
  DA_HUY = 'DA_HUY',
}

export enum LoaiDichVuEnum {
  XET_NGHIEM = 'XET_NGHIEM',
  CDHA = 'CDHA',
  THU_THUAT = 'THU_THUAT',
  KHAM = 'KHAM',
}

export enum PhuongThucTTEnum {
  TIEN_MAT = 'TIEN_MAT',
  CHUYEN_KHOAN = 'CHUYEN_KHOAN',
  THE = 'THE',
}

export enum TrangThaiTTEnum {
  CHUA_THANH_TOAN = 'CHUA_THANH_TOAN',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
}

export enum CaTrucEnum {
  SANG = 'SANG',
  CHIEU = 'CHIEU',
  TOI = 'TOI',
  DEM = 'DEM',
}

export enum TrangThaiDiemDanhEnum {
  CHUA_DIEM_DANH = 'CHUA_DIEM_DANH',
  CO_MAT = 'CO_MAT',
  VANG_MAT = 'VANG_MAT',
  VANG = 'VANG',
  DI_TRE = 'DI_TRE',
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  BAC_SI = 'BAC_SI',
  DIEU_DUONG = 'DIEU_DUONG',
  NV_HANH_CHINH = 'NV_HANH_CHINH',
  THU_NGAN = 'THU_NGAN',
  DUOC_SI = 'DUOC_SI',
  QUAN_TRI = 'QUAN_TRI',
}

export enum LoaiTiepNhanEnum {
  DUNG_TUYEN = 'DUNG_TUYEN',
  TRAI_TUYEN = 'TRAI_TUYEN',
  CAP_CUU = 'CAP_CUU',
  KHONG_BHYT = 'KHONG_BHYT',
}

export enum TrangThaiKhamEnum {
  CHO_KHAM = 'CHO_KHAM',
  DANG_KHAM = 'DANG_KHAM',
  HOAN_THANH = 'HOAN_THANH',
  NHAP_VIEN = 'NHAP_VIEN',
  CHUYEN_VIEN = 'CHUYEN_VIEN',
}

export enum TrangThaiDonThuocEnum {
  CHUA_PHAT = 'CHUA_PHAT',
  DA_PHAT = 'DA_PHAT',
  DA_HUY = 'DA_HUY',
}

export enum TrangThaiDichVuEnum {
  CHO_THUC_HIEN = 'CHO_THUC_HIEN',
  DA_CO_KET_QUA = 'DA_CO_KET_QUA',
  DA_HUY = 'DA_HUY',
}

export enum HinhThucTTEnum {
  TIEN_MAT = 'TIEN_MAT',
  CHUYEN_KHOAN = 'CHUYEN_KHOAN',
  THE_ATM = 'THE_ATM',
  DONG_CHI_TRA = 'DONG_CHI_TRA',
}

export enum TrangThaiHoaDonEnum {
  CHUA_THANH_TOAN = 'CHUA_THANH_TOAN',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
  DA_HUY = 'DA_HUY',
}

// ============================================================================
// THỰC THỂ CƠ SỞ DỮ LIỆU BCNF
// ============================================================================

export interface Khoa {
  MaKhoa: string;
  TenKhoa: string;
  ViTri: string | null;
  SoDienThoaiKhoa: string | null;
  MaTruongKhoa: string;
  NgayBoNhiem: string;
  truongKhoa?: BacSi;
  _count?: {
    phongs: number;
    nhanViens: number;
  };
}

export interface Phong {
  MaPhong: string;
  SoPhong: string;
  LoaiPhong: LoaiPhongEnum;
  Tang: number | null;
  SucChuaToiDa: number;
  MaKhoa: string;
  khoa?: { TenKhoa: string };
  soGiuongConTrong?: number;
  tongSoGiuong?: number;
  giuongBenhs?: GiuongBenh[];
}

export interface GiuongBenh {
  MaGiuong: string;
  SoGiuong: string;
  LoaiGiuong: LoaiGiuongEnum;
  DonGiaNgay: string | number;
  TrangThaiGiuong: TrangThaiGiuongEnum;
  MaPhong: string;
  phong?: Phong & { khoa?: { TenKhoa: string } };
  phanGiuongs?: PhanGiuong[];
  // alias for convenience
  TrangThai?: TrangThaiGiuongEnum;
}

export interface NhanVien {
  MaNV: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: GioiTinhEnum;
  CCCD: string;
  SoDienThoai: string;
  Email: string | null;
  DiaChi: string | null;
  NgayVaoLam: string;
  HeSoLuong: string | number;
  LoaiNV: LoaiNVEnum;
  MaKhoa: string;
  khoa?: { TenKhoa: string };
  bacSi?: BacSi | null;
  dieuDuong?: DieuDuong | null;
  nvHanhChinh?: NvHanhChinh | null;
}

export interface BacSi {
  MaNV: string;
  HocVi: string | null;
  ChuyenKhoa: string | null;
  SoCCHN: string;
  PhuCapKham: string | number;
  nhanVien?: NhanVien;
  NhanVien?: NhanVien;
}

export interface DieuDuong {
  MaNV: string;
  TrinhDoChuyenMon: string | null;
  SoCCHN_DD: string;
  PhuCapTruc: string | number;
  nhanVien?: NhanVien;
  NhanVien?: NhanVien;
}

export interface NvHanhChinh {
  MaNV: string;
  BoPhanPhuTrach: string | null;
  ChucVuHC: string | null;
  BacKyThuat: number | null;
  nhanVien?: NhanVien;
  NhanVien?: NhanVien;
}

export interface BenhNhan {
  MaBN: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: GioiTinhEnum;
  CCCD: string | null;
  SoDienThoai: string | null;
  SoBHYT: string | null;
  BHYT?: string | null;
  MucHuongBHYT: number | null;
  DiaChi: string | null;
  NhomMau: NhomMauEnum | null;
  CoNgoaiTru: boolean;
  CoNoiTru: boolean;
  bnNgoaiTru?: BnNgoaiTru | null;
  bnNoiTru?: BnNoiTru | null;
  luotKhams?: LuotKham[];
}

export interface BnNgoaiTru {
  MaBN: string;
  SoSoKhamBenh: string;
  NgayDangKyDau: string;
  TinhTrangTheoDoi: string | null;
}

export interface BnNoiTru {
  MaBN: string;
  SoHoSoBenhAn: string;
  NgayNhapVien: string;
  NgayXuatVienDuKien: string | null;
  ChanDoanNhapVien: string;
  TinhTrangNhapVien: string;
  MaBSTheoDoi: string;
  benhNhan?: BenhNhan;
  bacSiTheoDoi?: BacSi & { nhanVien?: NhanVien };
  phanGiuongs?: PhanGiuong[];
}

export interface LuotKham {
  MaLuotKham: string;
  MaLK?: string;
  ThoiGianKham: string;
  TrieuChung: string;
  HuyetAp: string | null;
  NhietDo: string | number | null;
  Mach: number | null;
  ChanDoanSoBo: string;
  ChanDoanXacDinh: string | null;
  ChanDoan?: string | null;
  MaICD?: string | null;
  HuongXuTri: HuongXuTriEnum;
  TrangThai?: string;
  HuongDieuTri?: string;
  NgayTaiKham: string | null;
  MaBN: string;
  MaBS: string;
  MaPhongKham: string;
  MaPhong?: string;
  benhNhan?: BenhNhan;
  bacSi?: BacSi & { nhanVien?: NhanVien };
  phongKham?: Phong;
  donThuoc?: DonThuoc | null;
  suDungDvs?: SuDungDv[];
  hoaDon?: HoaDon | null;
}

export interface Thuoc {
  MaThuoc: string;
  TenThuoc: string;
  HoatChatChinh: string | null;
  DonViTinh: string;
  DonGiaHienHanh: string | number;
  DonGia?: string | number;
  SoLuongTon: number;
  HamLuong?: string | null;
  NuocSanXuat: string | null;
  HanSuDung: string;
}

export interface CtDonThuoc {
  MaDon: string;
  MaThuoc: string;
  SoLuong: number;
  LieuDung: string | null;
  CachDung: string | null;
  SoNgayUong: number;
  DonGiaBan: string | number;
  thuoc?: Thuoc;
  Thuoc?: Thuoc;
}

export interface DonThuoc {
  MaDon: string;
  MaDT?: string;
  NgayGioKe: string;
  NgayKe?: string;
  LoiDanBacSi: string | null;
  GhiChu?: string | null;
  TrangThaiPhatThuoc: TrangThaiPhatThuocEnum;
  TrangThai?: TrangThaiPhatThuocEnum;
  MaLuotKham: string;
  MaLK?: string;
  MaBS?: string;
  ctDonThuocs?: CtDonThuoc[];
  ChiTiet?: CtDonThuoc[];
}

export interface DichVu {
  MaDV: string;
  TenDV: string;
  LoaiDichVu: LoaiDichVuEnum;
  DonViTinhDV: string;
  DonGiaHienHanh: string | number;
  DonGia?: string | number;
  ThuocBHYTChiTra: boolean;
}

export interface SuDungDv {
  MaLuotKham: string;
  MaLK?: string;
  MaDV: string;
  MaSD?: string;
  ThoiGianChiDinh: string;
  ThoiGian?: string;
  SoLuong: number;
  KetQuaCLS: string | null;
  KetQua?: string | null;
  DonGiaDV: string | number;
  MaKTVThucHien: string | null;
  BacSiChiDinh?: string;
  GhiChu?: string;
  TrangThai?: string;
  dichVu?: DichVu;
  ktvThucHien?: DieuDuong & { nhanVien?: NhanVien };
  luotKham?: LuotKham;
}

export interface PhanGiuong {
  MaBN: string;
  MaGiuong: string;
  NgayBatDau: string;
  NgayKetThuc: string | null;
  GiaGiuongNgay: string | number;
  GhiChuChuyenGiuong: string | null;
  giuongBenh?: GiuongBenh;
  bnNoiTru?: BnNoiTru;
}

export interface HoaDon {
  MaHD: string;
  NgayLap: string;
  TongTienGoc: string | number;
  TienBHYTChiTra: string | number;
  TienBenhNhanTra: string | number;
  SoTien?: string | number;
  PhuongThucTT: PhuongThucTTEnum;
  HinhThucTT?: PhuongThucTTEnum | HinhThucTTEnum;
  TrangThaiTT: TrangThaiTTEnum;
  TrangThai?: TrangThaiTTEnum | TrangThaiHoaDonEnum;
  MaLuotKham: string;
  MaLK?: string;
  MaNVThuNgan: string;
  NhanVienThu?: string;
  luotKham?: LuotKham;
  thuNgan?: NvHanhChinh & { nhanVien?: NhanVien };
}

export interface LichTruc {
  MaNV: string;
  NgayTruc: string;
  CaTruc: CaTrucEnum;
  MaPhong: string;
  MaKhoa?: string;
  VaiTroTruc: string | null;
  GhiChu?: string | null;
  TrangThaiDiemDanh: TrangThaiDiemDanhEnum;
  nhanVien?: NhanVien;
  phong?: Phong;
}

// ============================================================================
// DTO REQUESTS VÀ SPECIAL RESPONSES
// ============================================================================

export interface LoginRequestDto {
  username: string;
  password: string;
  role?: RoleEnum;
}

export interface LoginResponseDto {
  access_token: string;
  user: {
    maNV: string;
    hoTen: string;
    loaiNV: LoaiNVEnum;
    role: RoleEnum;
    maKhoa: string;
    tenKhoa: string;
    email: string | null;
    soDienThoai: string;
  };
}

export interface ReceptionRequestDto {
  maBN?: string;
  MaBN?: string;
  hoTen?: string;
  HoTen?: string;
  ngaySinh?: string;
  NgaySinh?: string;
  gioiTinh?: GioiTinhEnum;
  GioiTinh?: GioiTinhEnum;
  cccd?: string;
  CCCD?: string;
  soDienThoai?: string;
  SoDienThoai?: string;
  soBHYT?: string;
  BHYT?: string;
  mucHuongBHYT?: number;
  diaChi?: string;
  DiaChi?: string;
  nhomMau?: NhomMauEnum;
  isNgoaiTru?: boolean;
  MaKhoa?: string;
  LyDoKham?: string;
  LoaiTiepNhan?: LoaiTiepNhanEnum;
}

export interface CreateExaminationDto {
  maLuotKham?: string;
  MaLK?: string;
  maBN?: string;
  MaBN?: string;
  maBS?: string;
  MaBS?: string;
  maPhongKham?: string;
  MaPhong?: string;
  trieuChung?: string;
  TrieuChung?: string;
  huyetAp?: string;
  HuyetAp?: string;
  nhietDo?: number;
  NhietDo?: number;
  mach?: number;
  Mach?: number;
  chanDoanSoBo?: string;
  huongXuTri?: HuongXuTriEnum;
  ngayTaiKham?: string;
}

export interface UpdateDiagnosisDto {
  chanDoanXacDinh?: string;
  ChanDoan?: string;
  MaICD?: string;
  huongXuTri?: HuongXuTriEnum;
  TrangThai?: string;
  HuongDieuTri?: string;
  HuyetAp?: string;
  Mach?: number;
  NhietDo?: number;
  ngayTaiKham?: string;
}

export interface PrescriptionItemDto {
  maThuoc?: string;
  MaThuoc?: string;
  soLuong?: number;
  SoLuong?: number;
  lieuDung?: string;
  cachDung?: string;
  CachDung?: string;
  soNgayUong?: number;
}

export interface CreatePrescriptionDto {
  maDon?: string;
  maLuotKham?: string;
  MaLK?: string;
  MaBS?: string;
  loiDanBacSi?: string;
  GhiChu?: string;
  items?: PrescriptionItemDto[];
  ChiTiet?: PrescriptionItemDto[];
}

export interface AssignServiceDto {
  maLuotKham?: string;
  MaLK?: string;
  maDV?: string;
  MaDV?: string;
  soLuong?: number;
  BacSiChiDinh?: string;
  GhiChu?: string;
}

export interface UpdateServiceResultDto {
  id?: string;
  maLuotKham?: string;
  maDV?: string;
  thoiGianChiDinh?: string;
  ketQuaCLS?: string;
  KetQua?: string;
  maKTVThucHien?: string;
  NhanVienThucHien?: string;
}

export interface AdmitPatientDto {
  maBN?: string;
  MaBN?: string;
  soHoSoBenhAn?: string;
  ngayXuatVienDuKien?: string;
  chanDoanNhapVien?: string;
  ChanDoanVaoVien?: string;
  tinhTrangNhapVien?: string;
  maBSTheoDoi?: string;
  KhoaDieuTri?: string;
  BacSiDieuTri?: string;
}

export interface AssignBedDto {
  maBN?: string;
  MaBN?: string;
  maGiuong?: string;
  MaGiuong?: string;
  ghiChu?: string;
}

export interface TransferBedDto {
  maBN?: string;
  MaBN?: string;
  maGiuongMoi?: string;
  GiuongMoi?: string;
  GiuongCu?: string;
  lyDoChuyen?: string;
  LyDoChuyen?: string;
}

export interface FeeCalculationResponse {
  maLuotKham?: string;
  examId?: string;
  patientName?: string;
  bhytNumber?: string | null;
  coverageRate?: number;
  examFee?: number;
  medicineFee?: number;
  serviceFee?: number;
  totalCost?: number;
  bhytPaid?: number;
  patientPaid?: number;
  benhNhan?: {
    maBN: string;
    hoTen: string;
    soBHYT: string | null;
    mucHuongBHYT: number;
  };
  chiTiet?: {
    tienKham: number;
    tienThuoc: number;
    tienDichVu: number;
    tienGiuong: number;
  };
  tongTienGoc?: number;
  tienBHYTChiTra?: number;
  tienBenhNhanTra?: number;
}

export interface CreateInvoiceDto {
  maHD?: string;
  maLuotKham?: string;
  MaLK?: string;
  maNVThuNgan?: string;
  NhanVienThu?: string;
  phuongThucTT?: PhuongThucTTEnum;
  HinhThucTT?: HinhThucTTEnum | PhuongThucTTEnum;
}

export interface VietQrWebhookDto {
  maHD?: string;
  invoiceId?: string;
  amount: number;
  transactionId: string;
  signature?: string;
}

export interface CreateDutyScheduleDto {
  maNV?: string;
  MaNV?: string;
  ngayTruc?: string;
  NgayTruc?: string;
  caTruc?: CaTrucEnum;
  CaTruc?: CaTrucEnum;
  maPhong?: string;
  MaKhoa?: string;
  vaiTroTruc?: string;
  GhiChu?: string;
  trangThaiDiemDanh?: TrangThaiDiemDanhEnum;
}

export interface DashboardSummaryResponse {
  totalRevenue?: number;
  todayRevenue?: number;
  totalExaminations?: number;
  activeInpatients?: number;
  bedOccupancy?: number | string;
  roomStats?: any[];
  overview?: {
    totalPatients: number;
    totalInpatients: number;
    totalDoctors: number;
    totalBeds: number;
    occupiedBeds: number;
    bedOccupancyRate: string;
    totalExaminations: number;
  };
  revenue?: {
    tongDoanhThu: number;
    tongBHYTChiTra: number;
    tongBenhNhanThanhToan: number;
    soHoaDonDaThu: number;
    soHoaDonChuaThu: number;
  };
}
