> [!NOTE]
> **Lưu ý phiên bản:** Tài liệu này mô tả bản `v1.0` (lược đồ 19 bảng cũ trên Prisma/PostgreSQL). Đối với thiết kế **EER v2 (18 bảng · 103 cột · 20 FK · 13 nhóm quy tắc)** và bộ sơ đồ mới trong [docs/diagrams/](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/README.md), vui lòng xem [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md) và [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md).

# API CONTRACT SPECIFICATION (v1.0)
## Hệ Thống Quản Lý Bệnh Viện (Hospital Management System – QLBV)
### Tài Liệu Đặc Tả Giao Tiếp Tích Hợp Backend (NestJS) ⟷ Frontend (Next.js)

- **Phiên bản:** `v1.0` | **Ngày ban hành:** `14/11/2026 17:05 (GMT+7)` | **Trạng thái:** Chính thức (Ready for FE-BE Integration)
- **Học phần:** Cơ sở dữ liệu nâng cao (Advanced Database Systems) – Khoa CNTT, Đại học Sài Gòn (SGU)
- **Nhóm phát triển:** Nhóm 5 thành viên (Trưởng nhóm / Tech Lead: Cao Nguyễn Quốc Khánh)

---

## MỤC LỤC
1. [Chuẩn Kết Nối & Giao Thức Chung (Connection & Protocol Standards)](#1-chuẩn-kết-nối--giao-thức-chung-connection--protocol-standards)
2. [Hệ Thống Phân Quyền RBAC & Tài Khoản Mẫu](#2-hệ-thống-phân-quyền-rbac--tài-khoản-mẫu)
3. [Hệ Thống 13 Enums & TypeScript Interfaces Dùng Chung](#3-hệ-thống-13-enums--typescript-interfaces-dùng-chung)
4. [Chuẩn Cấu Trúc Phản Hồi Lỗi Toàn Cục (Global Error Format)](#4-chuẩn-cấu-trúc-phản-hồi-lỗi-toàn-cục-global-error-format)
5. [Đặc Tả Chi Tiết 11 Phân Hệ RESTful API](#5-đặc-tả-chi-tiết-11-phân-hệ-restful-api)
   - [5.1. Phân hệ 1: Xác thực & Phiên làm việc (`AuthModule`)](#51-phân-hệ-1-xác-thực--phiên-làm-việc-authmodule)
   - [5.2. Phân hệ 2: Cơ sở vật chất – Khoa, Phòng & Giường (`DepartmentRoomModule`)](#52-phân-hệ-2-cơ-sở-vật-chất--khoa-phòng--giường-departmentroommodule)
   - [5.3. Phân hệ 3: Nhân sự y tế (`StaffModule`)](#53-phân-hệ-3-nhân-sự-y-tế-staffmodule)
   - [5.4. Phân hệ 4: Tiếp đón & Hồ sơ Bệnh nhân (`PatientModule`)](#54-phân-hệ-4-tiếp-đón--hồ-sơ-bệnh-nhân-patientmodule)
   - [5.5. Phân hệ 5: Khám bệnh lâm sàng & Chẩn đoán (`ExaminationModule`)](#55-phân-hệ-5-khám-bệnh-lâm-sàng--chẩn-đoán-examinationmodule)
   - [5.6. Phân hệ 6: Dược phẩm & Kê toa thuốc (`PrescriptionModule`)](#56-phân-hệ-6-dược-phẩm--kê-toa-thuốc-prescriptionmodule)
   - [5.7. Phân hệ 7: Cận lâm sàng & Dịch vụ kỹ thuật (`ClinicalServiceModule`)](#57-phân-hệ-7-cận-lâm-sàng--dịch-vụ-kỹ-thuật-clinicalservicemodule)
   - [5.8. Phân hệ 8: Điều trị Nội trú & Phân giường (`InpatientStayModule`)](#58-phân-hệ-8-điều-trị-nội-trú--phân-giường-inpatientstaymodule)
   - [5.9. Phân hệ 9: Thu ngân, Viện phí BHYT & VietQR (`BillingModule`)](#59-phân-hệ-9-thu-ngân-viện-phí-bhyt--vietqr-billingmodule)
   - [5.10. Phân hệ 10: Lịch trực & Điểm danh (`DutyScheduleModule`)](#510-phân-hệ-10-lịch-trực--điểm-danh-dutyschedulemodule)
   - [5.11. Phân hệ 11: Báo cáo thống kê & Dashboard (`ReportModule`)](#511-phân-hệ-11-báo-cáo-thống-kê--dashboard-reportmodule)
6. [Ma Trận Ánh Xạ Giao Diện Frontend ⟷ API Backend & React Query Keys](#6-ma-trận-ánh-xạ-giao-diện-frontend--api-backend--react-query-keys)

---

## 1. Chuẩn Kết Nối & Giao Thức Chung (Connection & Protocol Standards)

| Thông số kỹ thuật | Giá trị quy ước chuẩn | Ghi chú tích hợp cho Frontend & Backend |
| :--- | :--- | :--- |
| **Backend Base URL** | `http://localhost:3001/api` | Cấu hình trong `frontend/.env.local` qua biến `NEXT_PUBLIC_API_URL=http://localhost:3001/api` |
| **Swagger OpenAPI UI** | `http://localhost:3001/api/docs` | Giao diện thử nghiệm trực tiếp toàn bộ API |
| **Frontend Origin (CORS)** | `http://localhost:3000` | Backend đã bật CORS hỗ trợ `credentials: true` và đầy đủ HTTP verbs (`GET, POST, PATCH, PUT, DELETE`) |
| **Authentication Scheme** | `Bearer <JWT_Token>` | Gửi qua HTTP Header: `Authorization: Bearer <access_token>`. Tự động đính kèm bởi `frontend/src/lib/api.ts` |
| **Content-Type mặc định** | `application/json; charset=utf-8` | Ngoại trừ API xuất biên lai PDF trả về luồng nhị phân `application/pdf` |
| **Định dạng Ngày (Date)** | `YYYY-MM-DD` | Ví dụ: `"2026-11-14"` (Áp dụng cho `NgaySinh`, `NgayTruc`, `NgayTaiKham`, `HanSuDung`) |
| **Định dạng Thời gian (DateTime)** | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Ví dụ: `"2026-11-14T08:30:00.000Z"` (Áp dụng cho `ThoiGianKham`, `NgayBatDau`, `ThoiGianChiDinh`) |
| **Định dạng Tiền tệ** | `VNĐ` (Số nguyên hoặc chuỗi Decimal) | Prisma trả cột `Decimal(18,2)` dưới dạng chuỗi số (ví dụ `"200000"` hoặc `"200000.00"`) hoặc `number` trong các DTO tính toán. Khi hiển thị ở FE sử dụng `Number(val).toLocaleString('vi-VN')` |
| **Quy ước Đặt tên Trường (Case)** |- **Request Body (DTO):** `camelCase`<br/>- **Response Entity (Prisma):** `PascalCase` | - Khi **gửi dữ liệu lên (POST/PATCH)**: dùng `camelCase` theo DTO (`maBN`, `hoTen`, `maLuotKham`).<br/>- Khi **nhận bản ghi thực thể từ Prisma**: các cột giữ đúng tên chuẩn trong Từ điển dữ liệu (`MaBN`, `HoTen`, `MaLuotKham`), các quan hệ nested giữ `camelCase` (`benhNhan`, `bacSi`, `phongKham`). |

---

## 2. Hệ Thống Phân Quyền RBAC & Tài Khoản Mẫu

### 2.1. Danh mục Vai trò (`Role` Enum)
Hệ thống sử dụng `JwtAuthGuard` kết hợp `RolesGuard` kiểm soát truy cập theo 5 mã quyền:
- **`ADMIN`**: Toàn quyền truy cập mọi phân hệ (Superuser bypass trong `RolesGuard`).
- **`BAC_SI`**: Khám lâm sàng, cập nhật chẩn đoán, kê đơn thuốc, chỉ định cận lâm sàng, lập hồ sơ nhập viện, phân giường, lập lịch trực.
- **`DIEU_DUONG`**: Đo sinh hiệu, thực hiện và trả kết quả cận lâm sàng, phân bổ/chuyển giường nội trú, cấp phát thuốc, điểm danh ca trực.
- **`NV_HANH_CHINH`**: Tiếp đón bệnh nhân, đăng ký sổ khám, quản lý hành chính, cấp phát thuốc, xem báo cáo.
- **`THU_NGAN`**: (Tự động gán cho `NV_HANH_CHINH` có `BoPhanPhuTrach` chứa từ khóa `"thu ngân"`) Tính toán viện phí BHYT, lập hóa đơn, gạch nợ VietQR, in biên lai PDF.

### 2.2. Tài khoản Cán bộ Y tế Mẫu (Đã nạp sẵn trong Seed DB)

| Mã NV (`username`) | Mật khẩu (`password`) | Họ tên | Loại NV (`LoaiNV`) | Quyền JWT (`role`) | Khoa trực thuộc |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **`BS01`** | `123456` | BS. CKI Trần Văn Nam | `BAC_SI` | `BAC_SI` | `K01` (Khoa Nội Tổng Hợp – Trưởng khoa) |
| **`BS02`** | `123456` | ThS. BS Nguyễn Thị Mai | `BAC_SI` | `BAC_SI` | `K02` (Khoa Ngoại Tổng Hợp – Trưởng khoa) |
| **`DD01`** | `123456` | CN. Lê Thị Lan | `DIEU_DUONG` | `DIEU_DUONG` | `K01` (Khoa Nội Tổng Hợp) |
| **`NV_TN_01`** | `123456` | Phạm Minh Hoàng | `HANH_CHINH` | `THU_NGAN` | `K01` (Thu ngân viện phí & Tiếp đón) |

---

## 3. Hệ Thống 13 Enums & TypeScript Interfaces Dùng Chung

Frontend có thể sao chép trực tiếp khối khai báo dưới đây vào tệp `frontend/src/types/api.types.ts` để đảm bảo Type-Safety 100% với Backend:

```typescript
// ============================================================================
// 13 ENUMS CHUẨN HÓA Y TẾ (ĐỒNG BỘ 1-1 VỚI PRISMA SCHEMA)
// ============================================================================

export type LoaiPhongEnum = 'KHAM' | 'NOI_TRU' | 'CAP_CUU' | 'XET_NGHIEM';
export type LoaiGiuongEnum = 'TIEU_CHUAN' | 'VIP' | 'CAP_CUU' | 'HOI_SUC';
export type TrangThaiGiuongEnum = 'TRONG' | 'DANG_SU_DUNG' | 'BAO_TRI';
export type LoaiNVEnum = 'BAC_SI' | 'DIEU_DUONG' | 'HANH_CHINH';
export type GioiTinhEnum = 'NAM' | 'NU' | 'KHAC' | 'CHUA_RO';
export type NhomMauEnum = 'A' | 'B' | 'AB' | 'O' | 'CHUA_RO';
export type HuongXuTriEnum = 'KE_DON_VE' | 'NHAP_VIEN' | 'CHUYEN_VIEN';
export type TrangThaiPhatThuocEnum = 'CHUA_PHAT' | 'DA_PHAT' | 'DA_HUY';
export type LoaiDichVuEnum = 'XET_NGHIEM' | 'CDHA' | 'THU_THUAT' | 'KHAM';
export type PhuongThucTTEnum = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE';
export type TrangThaiTTEnum = 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN';
export type CaTrucEnum = 'SANG' | 'CHIEU' | 'TOI' | 'DEM';
export type TrangThaiDiemDanhEnum = 'CHUA_DIEM_DANH' | 'CO_MAT' | 'VANG_MAT';
export type RoleEnum = 'ADMIN' | 'BAC_SI' | 'DIEU_DUONG' | 'NV_HANH_CHINH' | 'THU_NGAN';

// ============================================================================
// INTERFACES CÁC THỰC THỂ CỐT LÕI (RESPONSE MODELS)
// ============================================================================

export interface Khoa {
  MaKhoa: string;
  TenKhoa: string;
  ViTri: string | null;
  SoDienThoaiKhoa: string | null;
  MaTruongKhoa: string;
  NgayBoNhiem: string;
}

export interface Phong {
  MaPhong: string;
  SoPhong: string;
  LoaiPhong: LoaiPhongEnum;
  Tang: number | null;
  SucChuaToiDa: number;
  MaKhoa: string;
  soGiuongConTrong?: number;
  tongSoGiuong?: number;
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
}

export interface DieuDuong {
  MaNV: string;
  TrinhDoChuyenMon: string | null;
  SoCCHN_DD: string;
  PhuCapTruc: string | number;
  nhanVien?: NhanVien;
}

export interface NvHanhChinh {
  MaNV: string;
  BoPhanPhuTrach: string | null;
  ChucVuHC: string | null;
  BacKyThuat: number | null;
  nhanVien?: NhanVien;
}

export interface BenhNhan {
  MaBN: string;
  HoTen: string;
  NgaySinh: string;
  GioiTinh: GioiTinhEnum;
  CCCD: string | null;
  SoDienThoai: string | null;
  SoBHYT: string | null;
  MucHuongBHYT: number | null; // 80 | 95 | 100
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
  TinhTrangNhapVien: string; // 'Nhe' | 'Vua' | 'Nang' | 'Nguy_kich'
  MaBSTheoDoi: string;
  benhNhan?: BenhNhan;
  bacSiTheoDoi?: BacSi;
  phanGiuongs?: PhanGiuong[];
}

export interface LuotKham {
  MaLuotKham: string;
  ThoiGianKham: string;
  TrieuChung: string;
  HuyetAp: string | null;
  NhietDo: string | number | null;
  Mach: number | null;
  ChanDoanSoBo: string;
  ChanDoanXacDinh: string | null;
  HuongXuTri: HuongXuTriEnum;
  NgayTaiKham: string | null;
  MaBN: string;
  MaBS: string;
  MaPhongKham: string;
  benhNhan?: BenhNhan;
  bacSi?: BacSi;
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
  SoLuongTon: number;
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
}

export interface DonThuoc {
  MaDon: string;
  NgayGioKe: string;
  LoiDanBacSi: string | null;
  TrangThaiPhatThuoc: TrangThaiPhatThuocEnum;
  MaLuotKham: string;
  ctDonThuocs?: CtDonThuoc[];
}

export interface DichVu {
  MaDV: string;
  TenDV: string;
  LoaiDichVu: LoaiDichVuEnum;
  DonViTinhDV: string;
  DonGiaHienHanh: string | number;
  ThuocBHYTChiTra: boolean;
}

export interface SuDungDv {
  MaLuotKham: string;
  MaDV: string;
  ThoiGianChiDinh: string;
  SoLuong: number;
  KetQuaCLS: string | null;
  DonGiaDV: string | number;
  MaKTVThucHien: string | null;
  dichVu?: DichVu;
  ktvThucHien?: DieuDuong | null;
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
  PhuongThucTT: PhuongThucTTEnum;
  TrangThaiTT: TrangThaiTTEnum;
  MaLuotKham: string;
  MaNVThuNgan: string;
}

export interface LichTruc {
  MaNV: string;
  NgayTruc: string;
  CaTruc: CaTrucEnum;
  MaPhong: string;
  VaiTroTruc: string | null;
  TrangThaiDiemDanh: TrangThaiDiemDanhEnum;
  nhanVien?: NhanVien;
  phong?: Phong;
}
```

---

## 4. Chuẩn Cấu Trúc Phản Hồi Lỗi Toàn Cục (Global Error Format)

Mọi ngoại lệ trong hệ thống đều được chuẩn hóa qua 2 bộ lọc toàn cục: `HttpExceptionFilter` và `PrismaClientExceptionFilter`.

### 4.1. Lỗi Nghiệp Vụ & Validation (`HttpExceptionFilter`)
```json
{
  "statusCode": 400,
  "timestamp": "2026-11-14T10:00:00.000Z",
  "path": "/api/inpatient/assign-bed",
  "message": "Giường bệnh G01 hiện không ở trạng thái TRỐNG hoặc đang có bệnh nhân khác nằm!"
}
```
*(Nếu lỗi từ `ValidationPipe`, trường `message` có thể là mảng chuỗi `string[]` mô tả từng trường không hợp lệ).*

### 4.2. Lỗi Ràng Buộc Cơ Sở Dữ Liệu (`PrismaClientExceptionFilter`)
```json
{
  "statusCode": 409,
  "timestamp": "2026-11-14T10:05:00.000Z",
  "path": "/api/patients/reception",
  "errorCode": "P2002",
  "message": "Dữ liệu bị trùng lặp khóa duy nhất trên trường: CCCD"
}
```

| HTTP Status | Mã Prisma | Nguyên nhân & Cách xử lý ở Frontend |
| :---: | :---: | :--- |
| **`400 Bad Request`** | `P2003` | Vi phạm quy tắc nghiệp vụ (BR01–BR06), thiếu trường bắt buộc hoặc sai khóa ngoại. Hiển thị Toast cảnh báo `error.response.data.message`. |
| **`401 Unauthorized`** | - | Chưa đăng nhập, sai mật khẩu hoặc JWT hết hạn. Xóa `localStorage` và điều hướng về `/login`. |
| **`403 Forbidden`** | - | Tài khoản không đủ quyền chuyên môn (`RolesGuard`). Hiển thị thông báo `"Bạn không đủ quyền hạn chuyên môn"`. |
| **`404 Not Found`** | `P2025` | Không tìm thấy bản ghi theo mã (`MaBN`, `MaLuotKham`, `MaHD`,...). |
| **`409 Conflict`** | `P2002` | Trùng khóa duy nhất (`CCCD`, `SoBHYT`, `SoCCHN`, `TenKhoa`,...). |

---

## 5. Đặc Tả Chi Tiết 11 Phân Hệ RESTful API

---

### 5.1. Phân hệ 1: Xác thực & Phiên làm việc (`AuthModule`)

#### 1) Đăng nhập cán bộ y tế
- **Endpoint:** `POST /api/auth/login`
- **Quyền truy cập:** `@Public()` (Không cần JWT)
- **Mô tả:** Cho phép cán bộ y tế đăng nhập bằng `MaNV`, `CCCD` hoặc `Email`.
- **Request Body (`LoginDto`):**
```json
{
  "username": "BS01",
  "password": "123456"
}
```
- **Response `200 OK` / `201 Created`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "maNV": "BS01",
    "hoTen": "BS. CKI Tran Van Nam",
    "loaiNV": "BAC_SI",
    "role": "BAC_SI",
    "maKhoa": "K01",
    "tenKhoa": "Khoa Noi Tong Hop",
    "email": "dr.nam@hospital.sgu.vn",
    "soDienThoai": "0908000001"
  }
}
```

#### 2) Lấy thông tin hồ sơ người dùng hiện tại
- **Endpoint:** `GET /api/auth/profile`
- **Quyền truy cập:** `@UseGuards(JwtAuthGuard)` (Mọi cán bộ đã đăng nhập)
- **Response `200 OK`:** Trả về thực thể `NhanVien` đầy đủ kèm `bacSi`, `dieuDuong`, `nvHanhChinh`, và `khoa`.

---

### 5.2. Phân hệ 2: Cơ sở vật chất – Khoa, Phòng & Giường (`DepartmentRoomModule`)

#### 1) Danh sách tất cả chuyên khoa
- **Endpoint:** `GET /api/departments`
- **Quyền truy cập:** Đã đăng nhập (`JwtAuthGuard`)
- **Response `200 OK`:**
```json
[
  {
    "MaKhoa": "K01",
    "TenKhoa": "Khoa Noi Tong Hop",
    "ViTri": "Tang 2 - Toa Nha A",
    "SoDienThoaiKhoa": "02838381111",
    "MaTruongKhoa": "BS01",
    "NgayBoNhiem": "2025-01-01T00:00:00.000Z",
    "truongKhoa": {
      "MaNV": "BS01",
      "HocVi": "Bac si CKI",
      "ChuyenKhoa": "Noi khoa",
      "nhanVien": {
        "HoTen": "BS. CKI Tran Van Nam",
        "SoDienThoai": "0908000001",
        "Email": "dr.nam@hospital.sgu.vn"
      }
    },
    "_count": {
      "phongs": 2,
      "nhanViens": 3
    }
  }
]
```

#### 2) Chi tiết một chuyên khoa kèm danh sách phòng và giường
- **Endpoint:** `GET /api/departments/:maKhoa`
- **Path Params:** `maKhoa` (string, ví dụ: `K01`)
- **Response `200 OK`:** Trả về chi tiết `Khoa` kèm mảng `phongs` (mỗi phòng kèm mảng `giuongBenhs`).

#### 3) Tra cứu danh sách phòng & số lượng giường trống
- **Endpoint:** `GET /api/rooms/available`
- **Query Params:** `maKhoa` *(optional, string – lọc theo khoa, ví dụ `?maKhoa=K01`)*
- **Response `200 OK`:**
```json
[
  {
    "MaPhong": "P02",
    "SoPhong": "A201",
    "LoaiPhong": "NOI_TRU",
    "Tang": 2,
    "SucChuaToiDa": 4,
    "MaKhoa": "K01",
    "khoa": { "TenKhoa": "Khoa Noi Tong Hop" },
    "giuongBenhs": [
      {
        "MaGiuong": "G01",
        "SoGiuong": "Giuong 01",
        "LoaiGiuong": "TIEU_CHUAN",
        "DonGiaNgay": "200000",
        "TrangThaiGiuong": "TRONG",
        "MaPhong": "P02"
      }
    ],
    "soGiuongConTrong": 2,
    "tongSoGiuong": 2
  }
]
```

#### 4) Sơ đồ trạng thái toàn bộ giường bệnh nội trú (Real-time Bed Map)
- **Endpoint:** `GET /api/beds/map`
- **Mô tả:** Phục vụ màn hình Sơ đồ giường bệnh trực quan theo màu (`TRONG` = Xanh lá, `DANG_SU_DUNG` = Đỏ, `BAO_TRI` = Vàng). Nếu giường đang có bệnh nhân nằm (`NgayKetThuc: null`), trả kèm thông tin bệnh nhân.
- **Response `200 OK`:**
```json
[
  {
    "MaGiuong": "G01",
    "SoGiuong": "Giuong 01",
    "LoaiGiuong": "TIEU_CHUAN",
    "DonGiaNgay": "200000",
    "TrangThaiGiuong": "DANG_SU_DUNG",
    "MaPhong": "P02",
    "phong": {
      "MaPhong": "P02",
      "SoPhong": "A201",
      "LoaiPhong": "NOI_TRU",
      "Tang": 2,
      "khoa": { "TenKhoa": "Khoa Noi Tong Hop" }
    },
    "phanGiuongs": [
      {
        "MaBN": "BN001",
        "MaGiuong": "G01",
        "NgayBatDau": "2026-11-14T09:00:00.000Z",
        "NgayKetThuc": null,
        "GiaGiuongNgay": "200000",
        "bnNoiTru": {
          "SoHoSoBenhAn": "HSBA_BN001_1234",
          "ChanDoanNhapVien": "Viêm phổi thùy cấp",
          "benhNhan": {
            "HoTen": "Nguyen Van An",
            "GioiTinh": "NAM",
            "NgaySinh": "1988-03-25T00:00:00.000Z"
          }
        }
      }
    ]
  }
]
```

---

### 5.3. Phân hệ 3: Nhân sự y tế (`StaffModule`)

#### 1) Danh sách cán bộ y tế toàn viện
- **Endpoint:** `GET /api/staff`
- **Query Params:**
  - `loaiNV` *(optional: `BAC_SI` | `DIEU_DUONG` | `HANH_CHINH`)*
  - `maKhoa` *(optional: mã khoa, ví dụ `K01`)*
- **Response `200 OK`:** Mảng `NhanVien[]` kèm `khoa`, `bacSi`, `dieuDuong`, `nvHanhChinh`.

#### 2) Danh sách Bác sĩ điều trị
- **Endpoint:** `GET /api/staff/doctors`
- **Response `200 OK`:** Mảng `BacSi[]` kèm `nhanVien` và `khoa`. Dùng để đổ dữ liệu vào Dropdown chọn bác sĩ khám / bác sĩ theo dõi nội trú.

#### 3) Danh sách Điều dưỡng / Kỹ thuật viên
- **Endpoint:** `GET /api/staff/nurses`
- **Response `200 OK`:** Mảng `DieuDuong[]` kèm `nhanVien` và `khoa`. Dùng để chọn KTV thực hiện cận lâm sàng.

#### 4) Chi tiết nhân sự & 10 ca trực gần nhất
- **Endpoint:** `GET /api/staff/:maNV`
- **Path Params:** `maNV` (string, ví dụ `BS01`)
- **Response `200 OK`:** Trả về `NhanVien` kèm thông tin chuyên môn và mảng `lichTrucs` (10 ca trực mới nhất).

---

### 5.4. Phân hệ 4: Tiếp đón & Hồ sơ Bệnh nhân (`PatientModule`)

#### 1) Tiếp đón người bệnh mới & Mở sổ khám ngoại trú
- **Endpoint:** `POST /api/patients/reception`
- **Quyền truy cập:** Đã đăng nhập (`JwtAuthGuard`)
- **Ràng buộc kiểm tra:** Tự động kiểm tra chống trùng `CCCD` và `SoBHYT` trong một Database Transaction; tự động khởi tạo bản ghi `BN_NGOAI_TRU` nếu `isNgoaiTru = true`.
- **Request Body (`ReceptionDto`):**
```json
{
  "maBN": "BN002",
  "hoTen": "Trần Thị Bích Ngọc",
  "ngaySinh": "1995-08-20",
  "gioiTinh": "NU",
  "cccd": "079195000888",
  "soDienThoai": "0909112233",
  "soBHYT": "GD47995000888",
  "mucHuongBHYT": 80,
  "diaChi": "250 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
  "nhomMau": "A",
  "isNgoaiTru": true
}
```
*(Ghi chú: `maBN` là optional; nếu bỏ trống hệ thống tự sinh theo mẫu `BN<timestamp>`).*
- **Response `201 Created`:**
```json
{
  "MaBN": "BN002",
  "HoTen": "Trần Thị Bích Ngọc",
  "NgaySinh": "1995-08-20T00:00:00.000Z",
  "GioiTinh": "NU",
  "CCCD": "079195000888",
  "SoDienThoai": "0909112233",
  "SoBHYT": "GD47995000888",
  "MucHuongBHYT": 80,
  "DiaChi": "250 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
  "NhomMau": "A",
  "CoNgoaiTru": true,
  "CoNoiTru": false,
  "bnNgoaiTru": {
    "MaBN": "BN002",
    "SoSoKhamBenh": "SO_BN002",
    "NgayDangKyDau": "2026-11-14T00:00:00.000Z",
    "TinhTrangTheoDoi": "Hồ sơ khám ngoại trú mới tạo"
  },
  "bnNoiTru": null
}
```

#### 2) Tra cứu đa năng lịch sử khám chữa bệnh của bệnh nhân
- **Endpoint:** `GET /api/patients/lookup?q=<tu_khoa>`
- **Query Params:** `q` (**bắt buộc** – có thể truyền `MaBN`, `CCCD`, `SoBHYT` hoặc `SoDienThoai`)
- **Response `200 OK`:** Trả về toàn bộ cây hồ sơ bệnh nhân gồm `bnNgoaiTru`, `bnNoiTru` (kèm bác sĩ theo dõi, lịch sử phân giường) và danh sách `luotKhams` (kèm đơn thuốc, dịch vụ CLS, hóa đơn viện phí).

#### 3) Danh sách bệnh nhân có phân trang
- **Endpoint:** `GET /api/patients?page=1&limit=20`
- **Query Params:** `page` (default `1`), `limit` (default `20`)
- **Response `200 OK`:**
```json
{
  "data": [ /* Mảng BenhNhan[] */ ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

---

### 5.5. Phân hệ 5: Khám bệnh lâm sàng & Chẩn đoán (`ExaminationModule`)

#### 1) Khởi tạo lượt khám & Ghi nhận sinh hiệu
- **Endpoint:** `POST /api/examinations`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Ràng buộc nghiệp vụ:**
  - **C02:** `maPhongKham` bắt buộc phải là phòng có `LoaiPhong == 'KHAM'`.
  - **C03:** `maBS` bắt buộc phải tồn tại trong bảng `BAC_SI`.
- **Request Body (`CreateExaminationDto`):**
```json
{
  "maLuotKham": "LK001",
  "maBN": "BN001",
  "maBS": "BS01",
  "maPhongKham": "P01",
  "trieuChung": "Sốt cao 38.5 độ, đau rát họng, ho khan 3 ngày",
  "huyetAp": "120/80",
  "nhietDo": 38.5,
  "mach": 84,
  "chanDoanSoBo": "Viêm họng cấp / Theo dõi nhiễm siêu vi",
  "huongXuTri": "KE_DON_VE",
  "ngayTaiKham": "2026-11-21"
}
```
*(Ghi chú: `maLuotKham` là optional; nếu không truyền hệ thống tự sinh `LK<timestamp>`).*
- **Response `201 Created`:** Trả về bản ghi `LuotKham` kèm `benhNhan`, `bacSi.nhanVien`, `phongKham`.

#### 2) Cập nhật chẩn đoán xác định & Hướng xử trí
- **Endpoint:** `PATCH /api/examinations/:id/diagnose`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Path Params:** `id` (`MaLuotKham`, ví dụ `LK001`)
- **Request Body (`UpdateDiagnosisDto`):**
```json
{
  "chanDoanXacDinh": "J02 - Viêm họng cấp tính do liên cầu khuẩn",
  "huongXuTri": "KE_DON_VE",
  "ngayTaiKham": "2026-11-21"
}
```
- **Response `200 OK`:** Trả về `LuotKham` đã cập nhật kèm `donThuoc` và `suDungDvs`.

#### 3) Xem chi tiết một lượt khám
- **Endpoint:** `GET /api/examinations/:id`
- **Response `200 OK`:** Trả về đầy đủ `LuotKham` kèm `benhNhan`, `bacSi`, `phongKham`, `donThuoc.ctDonThuocs.thuoc`, `suDungDvs.dichVu`, `hoaDon`.

#### 4) Danh sách các lượt khám
- **Endpoint:** `GET /api/examinations`
- **Query Params:** `maBS` *(optional)*, `maBN` *(optional)*
- **Response `200 OK`:** Mảng `LuotKham[]` sắp xếp giảm dần theo `ThoiGianKham`.

---

### 5.6. Phân hệ 6: Dược phẩm & Kê toa thuốc (`PrescriptionModule`)

#### 1) Bác sĩ kê đơn thuốc điện tử
- **Endpoint:** `POST /api/prescriptions`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Ràng buộc nghiệp vụ (BR04 & Snapshot Pricing):**
  - Kiểm tra mỗi lượt khám chỉ có tối đa 1 đơn thuốc (`1:0..1`).
  - Kiểm tra tồn kho tức thời cho từng thuốc: `SoLuongTon >= soLuong`.
  - Tự động chụp lại đơn giá hiện hành của thuốc vào `DonGiaBan` (`Snapshot Pricing`), FE không cần gửi giá.
- **Request Body (`CreatePrescriptionDto`):**
```json
{
  "maDon": "DT001",
  "maLuotKham": "LK001",
  "loiDanBacSi": "Uống thuốc đúng giờ sau ăn, uống nhiều nước ấm, tái khám nếu còn sốt",
  "items": [
    {
      "maThuoc": "TH01",
      "soLuong": 15,
      "lieuDung": "Sáng 1 viên, Trưa 1 viên, Tối 1 viên",
      "cachDung": "Uống sau ăn 30 phút",
      "soNgayUong": 5
    },
    {
      "maThuoc": "TH02",
      "soLuong": 10,
      "lieuDung": "Sáng 1 viên, Tối 1 viên",
      "cachDung": "Uống sau ăn",
      "soNgayUong": 5
    }
  ]
}
```
- **Response `201 Created`:** Trả về `DonThuoc` ở trạng thái `CHUA_PHAT` kèm mảng `ctDonThuocs` (đã có `DonGiaBan` chụp lại và thông tin `thuoc`).

#### 2) Dược sĩ duyệt phát thuốc & Trừ tồn kho nguyên tử (BR04)
- **Endpoint:** `PATCH /api/prescriptions/:id/dispense`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.DIEU_DUONG, Role.NV_HANH_CHINH)`
- **Path Params:** `id` (`MaDon`, ví dụ `DT001`)
- **Ràng buộc nghiệp vụ (BR04):** Thực thi trong một `prisma.$transaction` nguyên tử: kiểm tra lại tồn kho vật lý từng dòng thuốc, trừ `SoLuongTon` (`decrement`), và đổi trạng thái đơn sang `DA_PHAT`. Nếu bất kỳ thuốc nào thiếu tồn kho, toàn bộ giao dịch Rollback.
- **Response `200 OK`:** Trả về `DonThuoc` với `TrangThaiPhatThuoc: "DA_PHAT"`.

#### 3) Danh mục dược phẩm & Tồn kho hiện hành
- **Endpoint:** `GET /api/prescriptions/medicines`
- **Response `200 OK`:** Mảng `Thuoc[]` sắp xếp theo tên thuốc.

#### 4) Chi tiết một đơn thuốc
- **Endpoint:** `GET /api/prescriptions/:id`
- **Response `200 OK`:** Trả về `DonThuoc` kèm `luotKham.benhNhan`, `luotKham.bacSi` và `ctDonThuocs.thuoc`.

---

### 5.7. Phân hệ 7: Cận lâm sàng & Dịch vụ kỹ thuật (`ClinicalServiceModule`)

#### 1) Danh mục dịch vụ kỹ thuật & Bảng giá
- **Endpoint:** `GET /api/services`
- **Response `200 OK`:** Mảng `DichVu[]` (Xét nghiệm, CĐHA, Thủ thuật, Khám).

#### 2) Bác sĩ chỉ định dịch vụ cận lâm sàng
- **Endpoint:** `POST /api/services/assign`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Mô tả:** Tự động chụp lại `DonGiaHienHanh` của dịch vụ vào `DonGiaDV` tại thời điểm chỉ định.
- **Request Body (`AssignServiceDto`):**
```json
{
  "maLuotKham": "LK001",
  "maDV": "DV01",
  "soLuong": 1
}
```
- **Response `201 Created`:**
```json
{
  "MaLuotKham": "LK001",
  "MaDV": "DV01",
  "ThoiGianChiDinh": "2026-11-14T08:30:00.000Z",
  "SoLuong": 1,
  "KetQuaCLS": null,
  "DonGiaDV": "80000",
  "MaKTVThucHien": null,
  "dichVu": {
    "MaDV": "DV01",
    "TenDV": "Tong phan tich te bao mau ngoai vi (CBC)",
    "LoaiDichVu": "XET_NGHIEM",
    "DonViTinhDV": "Lan",
    "DonGiaHienHanh": "80000",
    "ThuocBHYTChiTra": true
  }
}
```
*(Lưu ý quan trọng cho FE: Khóa chính hợp thành của `SU_DUNG_DV` gồm 3 trường `[MaLuotKham, MaDV, ThoiGianChiDinh]`. FE cần lưu lại giá trị `ThoiGianChiDinh` từ response này hoặc từ API `/services/pending` để truyền lên khi cập nhật kết quả).*

#### 3) Danh sách chỉ định cận lâm sàng đang chờ thực hiện
- **Endpoint:** `GET /api/services/pending`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.DIEU_DUONG)`
- **Mô tả:** Trả về tất cả các bản ghi `SuDungDv` có `KetQuaCLS == null`.

#### 4) Điều dưỡng / KTV cập nhật kết quả cận lâm sàng
- **Endpoint:** `PATCH /api/services/result`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.DIEU_DUONG)`
- **Ràng buộc (FK19):** `maKTVThucHien` bắt buộc phải tồn tại trong bảng `DIEU_DUONG`.
- **Request Body (`UpdateServiceResultDto`):**
```json
{
  "maLuotKham": "LK001",
  "maDV": "DV01",
  "thoiGianChiDinh": "2026-11-14T08:30:00.000Z",
  "ketQuaCLS": "WBC: 12.5 G/L (Tăng nhẹ), RBC: 4.7 T/L, PLT: 260 G/L, HGB: 142 g/L",
  "maKTVThucHien": "DD01"
}
```
- **Response `200 OK`:** Trả về bản ghi `SuDungDv` đã có kết quả và thông tin `ktvThucHien`.

---

### 5.8. Phân hệ 8: Điều trị Nội trú & Phân giường (`InpatientStayModule`)

#### 1) Tiếp nhận bệnh nhân nhập viện nội trú
- **Endpoint:** `POST /api/inpatient/admit`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Mô tả (C10):** Tạo hồ sơ `BN_NOI_TRU` và đồng thời bật cờ `CoNoiTru = true` trên bảng `BENH_NHAN` trong cùng một Transaction.
- **Request Body (`AdmitPatientDto`):**
```json
{
  "maBN": "BN001",
  "soHoSoBenhAn": "BA2026_001",
  "ngayXuatVienDuKien": "2026-11-20",
  "chanDoanNhapVien": "Viêm phổi thùy dưới phổi phải mức độ vừa",
  "tinhTrangNhapVien": "Vua",
  "maBSTheoDoi": "BS01"
}
```
*(Ghi chú: `tinhTrangNhapVien` nhận một trong 4 giá trị chuẩn: `"Nhe"`, `"Vua"`, `"Nang"`, `"Nguy_kich"`).*
- **Response `201 Created`:** Trả về `BnNoiTru` kèm `benhNhan` và `bacSiTheoDoi`.

#### 2) Phân bổ giường bệnh nội trú (Chống trùng giường BR02)
- **Endpoint:** `POST /api/inpatient/assign-bed`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)`
- **Ràng buộc nghiệp vụ (BR02, C02, C04, C10):**
  - Kiểm tra bệnh nhân đã có hồ sơ `BN_NOI_TRU`.
  - Kiểm tra bệnh nhân chưa có giường nào đang nằm (`NgayKetThuc: null`).
  - Kiểm tra giường thuộc phòng `NOI_TRU` và đang ở trạng thái `TRONG`.
  - Tạo bản ghi `PHAN_GIUONG` (chụp giá `GiaGiuongNgay`) và chuyển trạng thái giường sang `DANG_SU_DUNG`.
- **Request Body (`AssignBedDto`):**
```json
{
  "maBN": "BN001",
  "maGiuong": "G01",
  "ghiChu": "Nhập viện khoa Nội tầng 2"
}
```
- **Response `201 Created`:** Trả về bản ghi `PhanGiuong` mới tạo.

#### 3) Chuyển giường / Đổi buồng bệnh nội trú
- **Endpoint:** `POST /api/inpatient/transfer-bed`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI, Role.DIEU_DUONG)`
- **Mô tả (BR01):** Chốt `NgayKetThuc = NOW()` cho giường cũ, đổi trạng thái giường cũ sang `BAO_TRI` (để vệ sinh/khử khuẩn), tạo bản ghi `PHAN_GIUONG` mới tại giường đích và đổi trạng thái giường mới sang `DANG_SU_DUNG`.
- **Request Body (`TransferBedDto`):**
```json
{
  "maBN": "BN001",
  "maGiuongMoi": "G02",
  "lyDoChuyen": "Bệnh nhân yêu cầu chuyển sang giường VIP theo dõi"
}
```
- **Response `201 Created`:** Trả về bản ghi `PhanGiuong` tại giường mới.

#### 4) Danh sách bệnh nhân đang điều trị nội trú
- **Endpoint:** `GET /api/inpatient/patients`
- **Response `200 OK`:** Mảng `BnNoiTru[]` kèm `benhNhan`, `bacSiTheoDoi` và giường đang nằm hiện tại (`phanGiuongs` có `NgayKetThuc: null`).

---

### 5.9. Phân hệ 9: Thu ngân, Viện phí BHYT & VietQR (`BillingModule`)

#### 1) Tính toán chi phí viện phí & Khấu trừ BHYT tự động (BR03)
- **Endpoint:** `POST /api/billing/calculate/:examId`
- **Path Params:** `examId` (`MaLuotKham`, ví dụ `LK001`)
- **Công thức tính (BR03):**
  - `tienKham` = `50,000 VNĐ` (Định mức khám chuẩn)
  - `tienThuoc` = $\sum (\text{DonGiaBan} \times \text{SoLuong})$
  - `tienDichVu` = $\sum (\text{DonGiaDV} \times \text{SoLuong})$
  - `tienGiuong` = $\sum (\text{GiaGiuongNgay} \times \max(1, \lceil \text{SoNgayLuuTru} \rceil))$
  - `tongTienGoc` = `tienKham + tienThuoc + tienDichVu + tienGiuong`
  - `tienBHYTChiTra` = $\text{round}((\text{tienKham} + \text{tienDichVuBHYT}) \times \frac{\text{MucHuongBHYT}}{100})$
  - `tienBenhNhanTra` = `tongTienGoc - tienBHYTChiTra`
- **Response `200 OK` / `201 Created`:**
```json
{
  "maLuotKham": "LK001",
  "benhNhan": {
    "maBN": "BN001",
    "hoTen": "Nguyen Van An",
    "soBHYT": "DN4798812345678",
    "mucHuongBHYT": 80
  },
  "chiTiet": {
    "tienKham": 50000,
    "tienThuoc": 57500,
    "tienDichVu": 80000,
    "tienGiuong": 0
  },
  "tongTienGoc": 187500,
  "tienBHYTChiTra": 104000,
  "tienBenhNhanTra": 83500
}
```

#### 2) Thu ngân khởi tạo hóa đơn viện phí
- **Endpoint:** `POST /api/billing/invoices`
- **Ràng buộc (C03 & C08):** `maNVThuNgan` bắt buộc thuộc bảng `NV_HANH_CHINH`. Hệ thống tự động gọi `calculateFee` để đảm bảo số tiền chính xác tuyệt đối, không nhận số tiền tự sửa từ Client.
- **Request Body (`CreateInvoiceDto`):**
```json
{
  "maHD": "HD001",
  "maLuotKham": "LK001",
  "maNVThuNgan": "NV_TN_01",
  "phuongThucTT": "CHUYEN_KHOAN"
}
```
- **Response `201 Created`:** Trả về bản ghi `HoaDon` ở trạng thái `CHUA_THANH_TOAN`.

#### 3) Webhook xác nhận thanh toán VietQR (Idempotent BR06)
- **Endpoint:** `POST /api/billing/webhook/vietqr`
- **Quyền truy cập:** `@Public()` (Cho phép cổng thanh toán hoặc nút "Giả lập quét VietQR thành công" trên UI Thu ngân gọi trực tiếp)
- **Ràng buộc (BR06):** Đảm bảo tính **Idempotency** — nếu hóa đơn đã ở trạng thái `DA_THANH_TOAN`, API lập tức trả về `200 OK` mà không ghi đè hay cộng dồn doanh thu.
- **Request Body (`VietQrWebhookDto`):**
```json
{
  "maHD": "HD001",
  "amount": 83500,
  "transactionId": "TRAN_20261114_00123",
  "signature": "MOCK_HMAC_SHA256_SIGNATURE"
}
```
- **Response `200 OK` / `201 Created`:**
```json
{
  "success": true,
  "message": "Gạch nợ hóa đơn thành công qua VietQR",
  "maHD": "HD001",
  "trangThai": "DA_THANH_TOAN"
}
```

#### 4) Xuất biên lai hóa đơn viện phí định dạng PDF (PDFKit)
- **Endpoint:** `GET /api/billing/invoices/:id/pdf`
- **Path Params:** `id` (`MaHD`, ví dụ `HD001`)
- **Response Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="invoice_HD001.pdf"`
- **Cách gọi ở Frontend:**
```typescript
const res = await api.get(`/billing/invoices/${maHD}/pdf`, { responseType: 'blob' });
const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
window.open(url, '_blank');
```

#### 5) Xem chi tiết một hóa đơn
- **Endpoint:** `GET /api/billing/invoices/:id`
- **Response `200 OK`:** Trả về `HoaDon` kèm `luotKham.benhNhan`, `luotKham.bacSi`, `thuNgan.nhanVien`.

---

### 5.10. Phân hệ 10: Lịch trực & Điểm danh (`DutyScheduleModule`)

#### 1) Lập lịch phân công ca trực (Chống trùng ca trực BR05)
- **Endpoint:** `POST /api/duty-schedules`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI)`
- **Ràng buộc nghiệp vụ (BR05):**
  - Kiểm tra không trùng khóa hợp thành `[MaNV, NgayTruc, CaTruc]`.
  - Nếu nhân viên là `BAC_SI`, kiểm tra bắt buộc phải có Chứng chỉ hành nghề (`SoCCHN`) hợp lệ.
- **Request Body (`CreateDutyScheduleDto`):**
```json
{
  "maNV": "BS01",
  "ngayTruc": "2026-11-20",
  "caTruc": "DEM",
  "maPhong": "P01",
  "vaiTroTruc": "Bác sĩ trực chính Nội khoa",
  "trangThaiDiemDanh": "CHUA_DIEM_DANH"
}
```
- **Response `201 Created`:** Trả về bản ghi `LichTruc` kèm `nhanVien` và `phong`.

#### 2) Tra cứu danh sách lịch trực theo khoảng thời gian / nhân viên
- **Endpoint:** `GET /api/duty-schedules`
- **Query Params:**
  - `startDate` *(optional, `YYYY-MM-DD`)*
  - `endDate` *(optional, `YYYY-MM-DD`)*
  - `maNV` *(optional, mã nhân viên)*
- **Response `200 OK`:** Mảng `LichTruc[]` kèm `nhanVien.khoa` và `phong`.

#### 3) Điểm danh ca trực y tế
- **Endpoint:** `PATCH /api/duty-schedules/attendance`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.DIEU_DUONG)`
- **Query Params (Bắt buộc):**
  - `maNV`: Mã nhân viên (ví dụ `BS01`)
  - `ngayTruc`: Ngày trực (`YYYY-MM-DD`, ví dụ `2026-11-20`)
  - `caTruc`: `SANG` | `CHIEU` | `TOI` | `DEM`
  - `status`: `CHUA_DIEM_DANH` | `CO_MAT` | `VANG_MAT`
- **Ví dụ URL:** `PATCH /api/duty-schedules/attendance?maNV=BS01&ngayTruc=2026-11-20&caTruc=DEM&status=CO_MAT`
- **Response `200 OK`:** Trả về bản ghi `LichTruc` đã cập nhật trạng thái điểm danh.

---

### 5.11. Phân hệ 11: Báo cáo thống kê & Dashboard (`ReportModule`)

#### 1) Tổng hợp số liệu vận hành & Doanh thu toàn viện
- **Endpoint:** `GET /api/reports/dashboard`
- **Quyền truy cập:** `@Roles(Role.ADMIN, Role.BAC_SI, Role.NV_HANH_CHINH, Role.THU_NGAN)`
- **Response `200 OK`:**
```json
{
  "overview": {
    "totalPatients": 1,
    "totalInpatients": 0,
    "totalDoctors": 2,
    "totalBeds": 2,
    "occupiedBeds": 0,
    "bedOccupancyRate": "0.0%",
    "totalExaminations": 0
  },
  "revenue": {
    "tongDoanhThu": 0,
    "tongBHYTChiTra": 0,
    "tongBenhNhanThanhToan": 0,
    "soHoaDonDaThu": 0,
    "soHoaDonChuaThu": 0
  }
}
```

---

## 6. Ma Trận Ánh Xạ Giao Diện Frontend ⟷ API Backend & React Query Keys

Bảng quy chuẩn dưới đây giúp 5 thành viên trong nhóm thống nhất tuyệt đối tên `queryKey` của **TanStack Query (React Query v5)** để khi thực hiện `queryClient.invalidateQueries()` dữ liệu giữa các màn hình được đồng bộ tức thời:

| Phân hệ Frontend (Route Group) | Màn hình / Chức năng | API Endpoint kết nối | React Query Key chuẩn (`queryKey`) | Invalidate Keys khi Mutation thành công |
| :--- | :--- | :--- | :--- | :--- |
| **`(auth)`**<br/>`/login` | Đăng nhập hệ thống | `POST /api/auth/login`<br/>`GET /api/auth/profile` | `['auth', 'profile']` | Lưu vào `useAuthStore` + `localStorage` |
| **`(reception)`**<br/>`/reception` | Tiếp đón & Tra cứu người bệnh | `POST /api/patients/reception`<br/>`GET /api/patients/lookup?q=...`<br/>`GET /api/patients` | `['patients', 'list', page]`<br/>`['patients', 'lookup', q]` | `['patients']`, `['reports', 'dashboard']` |
| **`(clinical)`**<br/>`/clinical` | Khám bệnh, Sinh hiệu, Chẩn đoán & Kê đơn | `POST /api/examinations`<br/>`PATCH /api/examinations/:id/diagnose`<br/>`POST /api/prescriptions`<br/>`POST /api/services/assign` | `['examinations', 'list']`<br/>`['examinations', 'detail', id]`<br/>`['medicines', 'list']`<br/>`['services', 'list']` | `['examinations']`, `['services', 'pending']`, `['medicines', 'list']` |
| **`(laboratory)`**<br/>`/laboratory` | Danh sách chờ & Trả kết quả CLS | `GET /api/services/pending`<br/>`PATCH /api/services/result` | `['services', 'pending']` | `['services', 'pending']`, `['examinations']` |
| **`(inpatient)`**<br/>`/inpatient` | Sơ đồ giường bệnh, Nhập viện & Phân giường | `GET /api/beds/map`<br/>`GET /api/inpatient/patients`<br/>`POST /api/inpatient/admit`<br/>`POST /api/inpatient/assign-bed`<br/>`POST /api/inpatient/transfer-bed` | `['beds', 'map']`<br/>`['inpatients', 'list']`<br/>`['rooms', 'available']` | `['beds', 'map']`, `['inpatients', 'list']`, `['rooms', 'available']`, `['reports', 'dashboard']` |
| **`(pharmacy)`**<br/>`/pharmacy` | Kho dược & Duyệt phát thuốc | `GET /api/prescriptions/medicines`<br/>`GET /api/prescriptions/:id`<br/>`PATCH /api/prescriptions/:id/dispense` | `['medicines', 'list']`<br/>`['prescriptions', id]` | `['medicines', 'list']`, `['prescriptions', id]` |
| **`(cashier)`**<br/>`/cashier` | Tính viện phí BHYT, Quét VietQR & Xuất PDF | `POST /api/billing/calculate/:examId`<br/>`POST /api/billing/invoices`<br/>`POST /api/billing/webhook/vietqr`<br/>`GET /api/billing/invoices/:id/pdf` | `['billing', 'calc', examId]`<br/>`['billing', 'invoice', id]` | `['billing']`, `['examinations']`, `['reports', 'dashboard']` |
| **`(admin)`**<br/>`/admin` | Quản lý Khoa phòng, Lịch trực & Dashboard | `GET /api/departments`<br/>`GET /api/staff`<br/>`GET /api/duty-schedules`<br/>`POST /api/duty-schedules`<br/>`GET /api/reports/dashboard` | `['departments', 'list']`<br/>`['staff', 'list']`<br/>`['duty-schedules', params]`<br/>`['reports', 'dashboard']` | `['duty-schedules']`, `['reports', 'dashboard']` |
