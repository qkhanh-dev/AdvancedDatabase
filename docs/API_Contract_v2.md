# API CONTRACT SPECIFICATION (v2.0)
## Hệ Thống Quản Lý Bệnh Viện (Hospital Management System – QLBV)
### Tài Liệu Đặc Tả Giao Tiếp REST API Theo Mô Hình EER v2 (18 Bảng · 13 Nhóm Quy Tắc)

- **Phiên bản:** `v2.0` | **Ngày ban hành:** `15/11/2026` | **Thay thế cho:** [API_Contract_v1.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v1.md) (bản 19 bảng cũ)
- **Tài liệu nguồn đồng bộ:**
  - [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml)
  - [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml)
  - [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md)
  - [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt)

---

## MỤC LỤC
1. [Chuẩn Kết Nối & Định Dạng Dữ Liệu v2](#1-chuẩn-kết-nối--định-dạng-dữ-liệu-v2)
2. [Hệ Thống Phân Quyền RBAC Theo Cây `NHAN_VIEN (d, p)`](#2-hệ-thống-phân-quyền-rbac-theo-cây-nhan_vien-d-p)
3. [TypeScript Interfaces Cho 18 Bảng & 6 Thuộc Tính Dẫn Xuất](#3-typescript-interfaces-cho-18-bảng--6-thuộc-tính-dẫn-xuất)
4. [Chuẩn Cấu Trúc Phản Hồi Lỗi Toàn Cục](#4-chuẩn-cấu-trúc-phản-hồi-lỗi-toàn-cục)
5. [Đặc Tả Chi Tiết 10 Phân Hệ RESTful API (v2.0)](#5-đặc-tả-chi-tiết-10-phân-hệ-restful-api-v20)
   - [5.1. AuthModule (`/api/auth`)](#51-authmodule-apiauth)
   - [5.2. DepartmentRoomModule (`/api/departments`, `/api/rooms`, `/api/beds`)](#52-departmentroommodule-apidepartments-apirooms-apibeds)
   - [5.3. StaffModule (`/api/staff`)](#53-staffmodule-apistaff)
   - [5.4. PatientInsuranceModule (`/api/patients`, `/api/insurance-cards`)](#54-patientinsurancemodule-apipatients-apiinsurance-cards)
   - [5.5. ExaminationModule (`/api/examinations`)](#55-examinationmodule-apiexaminations)
   - [5.6. PrescriptionModule (`/api/medicines`, `/api/prescriptions`)](#56-prescriptionmodule-apimedicines-apiprescriptions)
   - [5.7. LabTestModule (`/api/lab-types`, `/api/lab-requests`)](#57-labtestmodule-apilab-types-apilab-requests)
   - [5.8. InpatientStayModule (`/api/inpatient`)](#58-inpatientstaymodule-apiinpatient)
   - [5.9. BillingModule (`/api/billing`)](#59-billingmodule-apibilling)
   - [5.10. ReportModule (`/api/reports`)](#510-reportmodule-apireports)
6. [Ma Trận Ánh Xạ Frontend Route Groups ⟷ API v2 & React Query Keys](#6-ma-trận-ánh-xạ-frontend-route-groups--api-v2--react-query-keys)

---

## 1. Chuẩn Kết Nối & Định Dạng Dữ Liệu v2

| Thông số kỹ thuật | Quy ước chuẩn v2 | Ghi chú triển khai |
| :--- | :--- | :--- |
| **Backend Base URL** | `http://localhost:3001/api` | Swagger UI tại `/api/docs` |
| **Authentication** | `Bearer <JWT_Token>` | Header `Authorization: Bearer <access_token>` |
| **Kiểu Ngày (`DATE`)** | `YYYY-MM-DD` | Áp dụng cho `NgaySinh`, `NgayVaoLam`, `NgayNhapVien`, `NgayRaVien`, `TuNgay`, `DenNgay`, `NgayBatDau`, `NgayHetHan`, `NgayKeDon`, `NgayLap` |
| **Kiểu Ngày Giờ (`DATETIME2(3)`)** | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Áp dụng cho `NgayGioKham`, `NgayGioXN`, `NgayGioTraKQ` |
| **Kiểu Tiền (`DECIMAL(18,2)`)** | Số thực 2 chữ số thập phân / chuỗi Decimal | `DonGiaNgay`, `DonGia`, `DonGiaKe`, `DonGiaXN`, `TruBHYT` |
| **Mức hưởng BHYT (`DECIMAL(5,4)`)** | Số trong đoạn `[0, 1]` | Ví dụ `0.8000`, `0.9500`, `1.0000` (không dùng `80`, `95`, `100` ở CSDL) |
| **Quy ước tên trường** | DTO gửi lên: `camelCase`; Entity trả về: đúng tên cột CSDL (`PascalCase` / giữ chính tả cột trong Schema 02) | Các thuộc tính dẫn xuất (`SoNamCongTac`, `Tuoi`, `TongTienThuoc`, `TongTienDichVu`, `ThucThu`) được tính qua `VIEW / Query` ở tầng CSDL hoặc Read Model, không lưu cột vật lý |

---

## 2. Hệ Thống Phân Quyền RBAC Theo Cây `NHAN_VIEN (d, p)`

Bản EER v2 mô hình hóa chuyên biệt hóa `NHAN_VIEN` theo **`disjoint, partial (d, p)`** với 3 bảng con chuyên môn (`BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`) và bỏ bảng `NV_HANH_CHINH`:

| Mã Vai Trò (`Role`) | Ánh xạ trong CSDL 18 bảng | Phạm vi thao tác chính |
| :--- | :--- | :--- |
| **`BAC_SI`** | `NHAN_VIEN` + `BAC_SI` | Khám `LUOT_KHAM`, kê `DON_THUOC`, chỉ định `PHIEU_XET_NGHIEM`, lập/đóng `DOT_NOI_TRU` |
| **`DIEU_DUONG`** | `NHAN_VIEN` + `DIEU_DUONG` | Tra cứu giường khả dụng, phân giường & chuyển giường `PHAN_GIUONG` |
| **`KY_THUAT_VIEN`** | `NHAN_VIEN` + `KY_THUAT_VIEN` | Nhận mẫu, ghi `NgayGioXN`, `KetQua`, `DanhGia`, `NgayGioTraKQ` trên `PHIEU_XET_NGHIEM` |
| **`TIEP_NHAN` / `THU_NGAN`** | `NHAN_VIEN` (*partial* — ngoài 3 bảng con) | Tiếp nhận `BENH_NHAN`, quản lý `THE_BHYT`, đăng ký `LUOT_KHAM`, lập & thu `VIEN_PHI` |
| **`ADMIN`** | `NHAN_VIEN` (*partial*) | Quản trị `KHOA`, `PHONG`, `GIUONG_BENH`, `NHAN_VIEN`, `THUOC`, `LOAI_XET_NGHIEM`, Dashboard |

---

## 3. TypeScript Interfaces Cho 18 Bảng & 6 Thuộc Tính Dẫn Xuất

```typescript
// ============================================================================
// MIỀN GIÁ TRỊ THAM CHIẾU CHO CỘT TRẠNG THÁI & PHÂN LOẠI (CẦN CHỐT TRONG DDL)
// ============================================================================
export type TrangThaiGiuong = 'SAN_SANG' | 'BAO_TRI' | 'NGUNG_SU_DUNG'; // Chỉ là trạng thái khai thác (BR-V2-11)
export type TrangThaiLuotKham = 'CHO_KHAM' | 'DANG_KHAM' | 'CHO_XET_NGHIEM' | 'HOAN_TAT' | 'HUY';
export type HinhThucThanhToan = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE';
export type TrangThaiThanhToan = 'CHUA_THANH_TOAN' | 'DA_THANH_TOAN';
export type RoleV2 = 'ADMIN' | 'BAC_SI' | 'DIEU_DUONG' | 'KY_THUAT_VIEN' | 'TIEP_NHAN' | 'THU_NGAN';

// ============================================================================
// 18 THỰC THỂ LƯU TRỮ (103 CỘT) + 6 THUỘC TÍNH DẪN XUẤT (VIEW / QUERY)
// ============================================================================

export interface Khoa {
  MaKhoa: string;
  TenKhoa: string;
  DiaDiem: string;
  SoDienThoai: string;
}

export interface Phong {
  MaPhong: string;
  MaKhoa: string; // FK01 -> KHOA
  TenPhong: string;
  LoaiPhong: string;
  ViTri: string;
}

export interface GiuongBenh {
  MaGiuong: string;
  MaPhong: string; // FK02 -> PHONG
  SoGiuong: string;
  LoaiGiuong: string;
  TrangThai: TrangThaiGiuong | string; // Tình trạng khai thác (BR-V2-11)
  DonGiaNgay: string | number; // DECIMAL(18,2) >= 0
  // Thuộc tính suy diễn tại ngày tra cứu D từ PHAN_GIUONG (không lưu cột):
  dangCoNguoiNam?: boolean;
  phanGiuongHienTai?: PhanGiuong | null;
}

export interface NhanVien {
  MaNV: string;
  MaKhoa: string; // FK03 -> KHOA
  HoTen: string;
  NgaySinh: string; // DATE
  GioiTinh: string;
  CCCD: string;
  DiaChi: string;
  SoDienThoai: string;
  NgayVaoLam: string; // DATE
  SoNamCongTac?: number; // DẪN XUẤT (VIEW/Query)
  bacSi?: BacSi | null;
  dieuDuong?: DieuDuong | null;
  kyThuatVien?: KyThuatVien | null;
}

export interface BacSi {
  MaNV: string; // PK, FK04 -> NHAN_VIEN (Disjoint với DD & KTV)
  ChuyenKhoa: string;
  TrinhDoHocVan: string;
  SoChungChiHanhNghe: string;
}

export interface DieuDuong {
  MaNV: string; // PK, FK05 -> NHAN_VIEN (Disjoint với BS & KTV)
  CapBac: string;
  ChungChiHanhNghe: string; // Chỉ lưu 1 chứng chỉ chính (BR-V2-06)
}

export interface KyThuatVien {
  MaNV: string; // PK, FK06 -> NHAN_VIEN (Disjoint với BS & DD)
  ChuyenMonXetNghiem: string;
  BTD_ThietBiPhuTrach: string;
}

export interface BenhNhan {
  MaBN: string;
  HoTen: string;
  NgaySinh: string; // DATE
  GioiTinh: string;
  CCCD: string;
  SDT: string;
  DiaChi_Duong: string;
  DiaChi_Phuong: string;
  DiaChi_Quan: string;
  NhomMau: string;
  Tuoi?: number; // DẪN XUẤT (VIEW/Query)
  theBHYTs?: TheBHYT[];
}

export interface TheBHYT {
  MaTheBHYT: string;
  MaBN: string; // FK08 -> BENH_NHAN
  MucHuong: string | number; // DECIMAL(5,4) trong [0, 1]
  NgayBatDau: string; // DATE
  NgayHetHan: string; // DATE (>= NgayBatDau)
}

export interface DotNoiTru {
  MaDotNT: string;
  MaBN: string; // FK07 -> BENH_NHAN; UQ(MaDotNT, MaBN) phục vụ FK11
  NgayNhapVien: string; // DATE
  NguoiNhaLienHe: string;
  TinhTrangNhapVien: string;
  NgayRaVien: string | null; // DATE nullable (>= NgayNhapVien)
}

export interface PhanGiuong {
  MaDotNT: string; // PK, FK18 -> DOT_NOI_TRU
  MaGiuong: string; // PK, FK19 -> GIUONG_BENH
  TuNgay: string; // PK, DATE (>= NgayNhapVien)
  DenNgay: string | null; // DATE nullable (> TuNgay; <= NgayRaVien + 1 khi đã ra viện)
}

export interface LuotKham {
  MaLuotKham: string;
  MaBN: string; // FK09 -> BENH_NHAN
  MaNV_BacSi: string; // FK10 -> BAC_SI
  NgayGioKham: string; // DATETIME2(3)
  LyDoKham: string;
  TrieuChung: string;
  ChanDoanSoBo: string;
  TrangThai: TrangThaiLuotKham | string;
  MaDotNT: string | null; // FK11? ghép (MaDotNT, MaBN) -> DOT_NOI_TRU(MaDotNT, MaBN)
}

export interface Thuoc {
  MaThuoc: string;
  TenThuoc: string;
  HoatChat: string;
  HamLuong: string;
  DonViTinh: string;
  DonGia: string | number; // DECIMAL(18,2) >= 0
  HuongDanSD: string;
}

export interface DonThuoc {
  MaDonThuoc: string;
  MaLuotKham: string; // FK12, UQ -> LUOT_KHAM (1-0..1)
  NgayKeDon: string; // DATE
  LoiDanCuaBacSi: string;
  TongTienThuoc?: string | number; // DẪN XUẤT (VIEW/Query)
  chiTietDonThuocs?: ChiTietDonThuoc[];
}

export interface ChiTietDonThuoc {
  MaDonThuoc: string; // PK, FK13 -> DON_THUOC
  MaThuoc: string; // PK, FK14 -> THUOC
  SoLuong: number; // INT > 0
  LieuDung: string;
  DonGiaKe: string | number; // DECIMAL(18,2) >= 0 (Giá lịch sử)
}

export interface LoaiXetNghiem {
  MaLoaiXN: string;
  TenXN: string;
  ChiTieuBinhThuong: string;
  DonGia: string | number; // DECIMAL(18,2) >= 0
}

export interface PhieuXetNghiem {
  MaPhieuXN: string;
  MaLuotKham: string; // FK15 -> LUOT_KHAM
  MaLoaiXN: string; // FK16 -> LOAI_XET_NGHIEM
  MaNV_KTV: string | null; // FK17? -> KY_THUAT_VIEN
  NgayGioXN: string | null; // DATETIME2(3)
  NgayGioTraKQ: string | null; // DATETIME2(3) (>= NgayGioXN)
  KetQua: string | null;
  DanhGia: string | null;
  DonGiaXN: string | number; // DECIMAL(18,2) >= 0 (Giá lịch sử)
}

export interface VienPhi {
  MaHoaDon: string;
  MaLuotKham: string; // FK20, UQ -> LUOT_KHAM (1-0..1)
  NgayLap: string; // DATE
  HinhThucThanhToan: HinhThucThanhToan | string;
  TruBHYT: string | number; // LƯU TRỮ: DECIMAL(18,2) NOT NULL DEFAULT 0
  TrangThaiThanhToan: TrangThaiThanhToan | string;
  TongTienDichVu?: string | number; // DẪN XUẤT (VIEW/Query - chỉ phiếu NgayGioXN IS NOT NULL)
  TongTienThuoc?: string | number; // DẪN XUẤT (VIEW/Query)
  ThucThu?: string | number; // DẪN XUẤT (VIEW/Query): TongTienThuoc + TongTienDichVu - TruBHYT >= 0
}
```

---

## 4. Chuẩn Cấu Trúc Phản Hồi Lỗi Toàn Cục

```json
{
  "statusCode": 409,
  "timestamp": "2026-11-15T10:00:00.000Z",
  "path": "/api/inpatient/bed-allocations",
  "ruleCode": "BR-V2-03",
  "message": "Giường G01 đã có khoảng phân giường giao nhau với [2026-11-15, NULL)."
}
```

| HTTP Status | Trường hợp phát sinh theo 13 nhóm quy tắc v2 |
| :---: | :--- |
| **`400 Bad Request`** | Vi phạm điều kiện dữ liệu (`SoLuong <= 0`, `DonGia < 0`, `MucHuong` ngoài `[0,1]`, `NgayHetHan < NgayBatDau`, `DenNgay <= TuNgay`, `NgayRaVien < NgayNhapVien`, `NgayGioTraKQ < NgayGioXN`, thiếu `MaNV_KTV`/`NgayGioXN` khi trả KQ, `TruBHYT > TongTienThuoc + TongTienDichVu`, đơn thuốc không có chi tiết). |
| **`401 Unauthorized`** | Chưa đăng nhập hoặc JWT hết hạn. |
| **`403 Forbidden`** | Không đủ quyền chuyên môn (ví dụ không thuộc `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN` tương ứng). |
| **`404 Not Found`** | Không tìm thấy thực thể theo PK (`MaBN`, `MaDotNT`, `MaLuotKham`, `MaPhieuXN`, `MaHoaDon`,...). |
| **`409 Conflict`** | Trùng khoảng `PHAN_GIUONG` trên cùng giường/đợt (`BR-V2-03`), đã có `DOT_NOI_TRU` đang mở hoặc chồng khoảng điều trị (`BR-V2-12`), vi phạm `disjoint` nhân sự (`BR-V2-01`), trùng `UQ(MaLuotKham)` ở `DON_THUOC`/`VIEN_PHI` (`BR-V2-05`), hóa đơn đã thanh toán nên khóa chỉnh sửa (`BR-V2-08`/`13`), hoặc vướng `ON DELETE NO ACTION`. |

---

## 5. Đặc Tả Chi Tiết 10 Phân Hệ RESTful API (v2.0)

> Lưu ý: Không còn phân hệ `DutyScheduleModule` (`LICH_TRUC`), không còn API trừ tồn kho `SoLuongTon` ở `THUOC`, và không dùng bảng `BN_NGOAI_TRU`, `BN_NOI_TRU`, `NV_HANH_CHINH`, `DICH_VU`, `SU_DUNG_DV`.

### 5.1. `AuthModule` (`/api/auth`)
- `POST /api/auth/login` (`@Public()`): Đăng nhập theo `MaNV` / `CCCD`, trả về `access_token` và thông tin `NhanVien` kèm nhóm quyền từ cây `(d, p)`.
- `GET /api/auth/profile`: Trả về `NhanVien` hiện tại (kèm `SoNamCongTac` dẫn xuất và bản ghi con `bacSi` / `dieuDuong` / `kyThuatVien` nếu có).

---

### 5.2. `DepartmentRoomModule` (`/api/departments`, `/api/rooms`, `/api/beds`)
- `GET /api/departments` / `POST /api/departments` / `PATCH /api/departments/:maKhoa`: Quản lý `KHOA` (`MaKhoa`, `TenKhoa`, `DiaDiem`, `SoDienThoai`).
- `GET /api/rooms?maKhoa=...` / `POST /api/rooms` / `PATCH /api/rooms/:maPhong`: Quản lý `PHONG` (`MaPhong`, `MaKhoa`, `TenPhong`, `LoaiPhong`, `ViTri`).
- `GET /api/beds/map?date=YYYY-MM-DD&maKhoa=...`:
  - **Tuân thủ BR-V2-11:** Trả về toàn bộ `GIUONG_BENH` kèm trạng thái khai thác (`GIUONG_BENH.TrangThai`) và trạng thái có người nằm tại ngày `date` được **tính từ `PHAN_GIUONG`** (`TuNgay <= date AND (DenNgay IS NULL OR date < DenNgay)`).
- `PATCH /api/beds/:maGiuong/status`: Cập nhật tình trạng khai thác `GIUONG_BENH.TrangThai` (`SAN_SANG`, `BAO_TRI`, `NGUNG_SU_DUNG`). Không dùng để gán thủ công trạng thái có người nằm.

---

### 5.3. `StaffModule` (`/api/staff`)
- `GET /api/staff?loaiChuyenMon=BAC_SI|DIEU_DUONG|KY_THUAT_VIEN|KHAC&maKhoa=...`: Danh sách `NHAN_VIEN` kèm `SoNamCongTac` (dẫn xuất).
- `GET /api/staff/doctors`: Danh sách `BAC_SI` (`MaNV`, `ChuyenKhoa`, `TrinhDoHocVan`, `SoChungChiHanhNghe`).
- `GET /api/staff/nurses`: Danh sách `DIEU_DUONG` (`MaNV`, `CapBac`, `ChungChiHanhNghe`).
- `GET /api/staff/technicians`: Danh sách `KY_THUAT_VIEN` (`MaNV`, `ChuyenMonXetNghiem`, `BTD_ThietBiPhuTrach`).
- `POST /api/staff`: Tạo `NHAN_VIEN` và (tùy chọn) tối đa 1 vai trò chuyên môn trong `{ BAC_SI, DIEU_DUONG, KY_THUAT_VIEN }` đảm bảo **disjoint, partial `(d, p)`** (`BR-V2-01`).

---

### 5.4. `PatientInsuranceModule` (`/api/patients`, `/api/insurance-cards`)
- `POST /api/patients`: Tạo hồ sơ `BENH_NHAN` (`MaBN`, `HoTen`, `NgaySinh`, `GioiTinh`, `CCCD`, `SDT`, `DiaChi_Duong`, `DiaChi_Phuong`, `DiaChi_Quan`, `NhomMau`). Không tạo `BN_NGOAI_TRU` (`BR-V2-09`).
- `GET /api/patients/lookup?q=...`: Tra cứu theo `MaBN`, `CCCD`, `SDT` hoặc `MaTheBHYT`; trả về `BENH_NHAN` (kèm `Tuoi` dẫn xuất), danh sách `THE_BHYT`, `DOT_NOI_TRU` và `LUOT_KHAM`.
- `POST /api/patients/:maBN/insurance-cards`: Thêm thẻ `THE_BHYT` (`MaTheBHYT`, `MucHuong` `[0..1]`, `NgayBatDau`, `NgayHetHan >= NgayBatDau`) cho bệnh nhân (`BR-V2-06`).
- `GET /api/patients/:maBN/insurance-cards?validAt=YYYY-MM-DD`: Liệt kê thẻ BHYT của bệnh nhân (lọc thẻ còn hạn tại ngày khám).

---

### 5.5. `ExaminationModule` (`/api/examinations`)
- `POST /api/examinations`: Tạo `LUOT_KHAM` (`MaLuotKham`, `MaBN`, `MaNV_BacSi`, `NgayGioKham`, `LyDoKham`, `TrieuChung`, `ChanDoanSoBo`, `TrangThai`, `MaDotNT`).
  - **Ràng buộc `BR-V2-04` (`FK11`):**
    - Nếu `maDotNT = null`: lượt khám ngoại trú.
    - Nếu `maDotNT != null`: `maBN` phải khớp `DOT_NOI_TRU.MaBN`, đồng thời `NgayGioKham >= đầu ngày NgayNhapVien` và (nếu đã ra viện) `< đầu ngày (NgayRaVien + 1 ngày)`.
- `PATCH /api/examinations/:maLuotKham`: Cập nhật `TrieuChung`, `ChanDoanSoBo`, `TrangThai`, hoặc chuyển `MaDotNT` (vẫn kiểm tra `FK11`, khung ngày đợt nội trú, và `BR-V2-13` nếu liên quan chuyển chi phí).
- `GET /api/examinations/:maLuotKham`: Chi tiết `LUOT_KHAM` kèm `donThuoc` (và `TongTienThuoc`), `phieuXetNghiems`, `vienPhi` (kèm `TongTienThuoc`, `TongTienDichVu`, `ThucThu`).

---

### 5.6. `PrescriptionModule` (`/api/medicines`, `/api/prescriptions`)
- `GET /api/medicines`: Danh mục `THUOC` (`MaThuoc`, `TenThuoc`, `HoatChat`, `HamLuong`, `DonViTinh`, `DonGia`, `HuongDanSD`).
- `POST /api/prescriptions`: Tạo `DON_THUOC` (1–0..1 với `LUOT_KHAM`, `UQ(MaLuotKham)`) kèm tối thiểu 1 dòng `CHI_TIET_DON_THUOC` trong **cùng 1 transaction** (`BR-V2-05`, `BR-V2-06`):
  - Tự động snapshot `THUOC.DonGia` vào `CHI_TIET_DON_THUOC.DonGiaKe` (`>= 0`); `SoLuong > 0`.
  - **Khóa chi phí (`BR-V2-08`, `BR-V2-13`):** Từ chối nếu `LUOT_KHAM` đã có `VIEN_PHI` trạng thái `DA_THANH_TOAN`; nếu có `VIEN_PHI` `CHUA_THANH_TOAN`, kiểm tra lại `0 <= TruBHYT <= TongTienThuoc + TongTienDichVu`.
- `PATCH /api/prescriptions/:maDonThuoc` / `DELETE /api/prescriptions/:maDonThuoc`: Chỉnh sửa/xóa đơn hoặc chi tiết thuốc trước khi thanh toán (bị khóa hoàn toàn khi `VIEN_PHI` đã thanh toán; kiểm tra lại `TruBHYT` theo `BR-V2-13` nếu chưa thanh toán).

---

### 5.7. `LabTestModule` (`/api/lab-types`, `/api/lab-requests`)
- `GET /api/lab-types`: Danh mục `LOAI_XET_NGHIEM` (`MaLoaiXN`, `TenXN`, `ChiTieuBinhThuong`, `DonGia`).
- `POST /api/lab-requests`: Bác sĩ tạo `PHIEU_XET_NGHIEM` cho `MaLuotKham` (`BR-V2-07`, `BR-V2-08`):
  - Snapshot `LOAI_XET_NGHIEM.DonGia` vào `DonGiaXN` (`NOT NULL`, `>= 0`).
  - Khởi tạo ở trạng thái chờ: `MaNV_KTV = null`, `NgayGioXN = null`, `NgayGioTraKQ = null`, `KetQua = null`, `DanhGia = null`.
  - Bị khóa nếu `LUOT_KHAM` đã thanh toán `VIEN_PHI` (`BR-V2-08`).
- `PATCH /api/lab-requests/:maPhieuXN/start`: KTV (`KY_THUAT_VIEN`) bắt đầu thực hiện xét nghiệm:
  - Ghi `MaNV_KTV` và `NgayGioXN` trong cùng transaction (`BR-V2-07`). Từ thời điểm `NgayGioXN IS NOT NULL`, phiếu được tính vào `VIEN_PHI.TongTienDichVu` (`BR-V2-08`), nên kiểm tra khóa thanh toán & `BR-V2-13`.
- `PATCH /api/lab-requests/:maPhieuXN/complete`: KTV hoàn tất trả kết quả trong cùng transaction (`BR-V2-07`):
  - Yêu cầu đã có (hoặc truyền kèm đồng thời) `MaNV_KTV` và `NgayGioXN`; bắt buộc có đủ `KetQua` và `NgayGioTraKQ >= NgayGioXN` (+ `DanhGia` tùy chọn).
  - Bị khóa nếu `VIEN_PHI` của lượt khám đã thanh toán (`BR-V2-08`).

---

### 5.8. `InpatientStayModule` (`/api/inpatient`)
- `POST /api/inpatient/admissions`: Mở `DOT_NOI_TRU` (`MaDotNT`, `MaBN`, `NgayNhapVien`, `NguoiNhaLienHe`, `TinhTrangNhapVien`, `NgayRaVien: null`).
  - **Ràng buộc `BR-V2-12`:** Đặt khóa theo `MaBN`; kiểm tra không tồn tại đợt đang mở (`NgayRaVien IS NULL`) và khoảng `[NgayNhapVien, +∞)` không giao các đợt khác của `MaBN`.
- `POST /api/inpatient/bed-allocations`: Phân giường `PHAN_GIUONG` (`MaDotNT`, `MaGiuong`, `TuNgay`, `DenNgay: null`).
  - **Ràng buộc `BR-V2-03`, `BR-V2-11`:** Đặt khóa giao dịch trên `MaGiuong` và `MaDotNT`; kiểm tra `GIUONG_BENH.TrangThai = 'SAN_SANG'`, `TuNgay >= NgayNhapVien`, và không trùng khoảng `[TuNgay, DenNgay)` trên cả giường lẫn đợt nội trú.
- `POST /api/inpatient/transfer-bed`: Chuyển giường sang `maGiuongMoi` tại ngày `ngayChuyen` (`ngayChuyen > TuNgay` hiện tại, khác ngày vì không hỗ trợ chuyển nhiều lần trong ngày):
  - Trong **1 transaction có khóa** (`MaDotNT`, giường cũ, giường mới): đóng phân giường cũ (`DenNgay = ngayChuyen`) và tạo phân giường mới `[ngayChuyen, null)`.
- `PATCH /api/inpatient/admissions/:maDotNT/discharge`: Cập nhật `NgayRaVien >= NgayNhapVien` và đóng toàn bộ `PHAN_GIUONG` đang mở (`DenNgay IS NULL`) với `DenNgay <= NgayRaVien + 1 ngày` trong **cùng transaction** (`BR-V2-02`, `BR-V2-03`).

---

### 5.9. `BillingModule` (`/api/billing`)
- `GET /api/billing/preview/:maLuotKham`: Tính xem trước từ `VIEW / Query` (`BR-V2-08`):
  - `TongTienThuoc = COALESCE(SUM(SoLuong * DonGiaKe), 0)`
  - `TongTienDichVu = COALESCE(SUM(DonGiaXN), 0)` *(chỉ phiếu có `NgayGioXN IS NOT NULL`)*
  - Gợi ý các thẻ `THE_BHYT` của bệnh nhân còn hạn tại ngày `CAST(NgayGioKham AS DATE)`.
- `POST /api/billing/invoices`: Lập `VIEN_PHI` cho `MaLuotKham` (`1–0..1`, `UQ(MaLuotKham)`):
  - **Request Body:** `{ "maHoaDon"?: string, "maLuotKham": "LK001", "ngayLap": "2026-11-15", "hinhThucThanhToan": "TIEN_MAT", "maTheBHYT"?: "BHYT001" | null }`
  - **Xử lý Transaction có khóa dữ liệu chi phí (`BR-V2-08`, `BR-V2-13`):**
    1. Nếu `maTheBHYT != null`: kiểm tra thẻ thuộc đúng `LUOT_KHAM.MaBN` và còn hạn tại ngày khám (`NgayBatDau <= NgayKham <= NgayHetHan`). Tính `TruBHYT = ROUND((TongTienThuoc + TongTienDichVu) * MucHuong, 2)` (tối đa 1 thẻ). Nếu `maTheBHYT = null`: `TruBHYT = 0`.
    2. Kiểm tra `0 <= TruBHYT <= TongTienThuoc + TongTienDichVu`.
    3. Lưu `VIEN_PHI` với `TrangThaiThanhToan = 'CHUA_THANH_TOAN'`; trả kèm `TongTienThuoc`, `TongTienDichVu`, `ThucThu = TongTienThuoc + TongTienDichVu - TruBHYT >= 0`.
    4. *(Lưu ý: Không tính tiền giường `PHAN_GIUONG` vào `VIEN_PHI`)*
- `PATCH /api/billing/invoices/:maHoaDon/pay`: Chốt thanh toán (`TrangThaiThanhToan = 'DA_THANH_TOAN'`) trong transaction dùng **cùng cơ chế khóa** với thao tác thay đổi chi phí (`BR-V2-08`, `BR-V2-13`). Sau khi chốt, khóa sửa/xóa `VIEN_PHI` và mọi chi phí/khóa liên kết thuộc `MaLuotKham` đó.

---

### 5.10. `ReportModule` (`/api/reports`)
- `GET /api/reports/dashboard?date=YYYY-MM-DD`:
  - Tổng hợp số bệnh nhân (`BENH_NHAN`), lượt khám (`LUOT_KHAM`), số đợt nội trú đang mở (`DOT_NOI_TRU WHERE NgayRaVien IS NULL`), công suất giường tại ngày `date` (tính từ `GIUONG_BENH` + `PHAN_GIUONG`), và tổng doanh thu từ `VIEN_PHI` (`TongTienThuoc`, `TongTienDichVu`, `TruBHYT`, `ThucThu`).

---

## 6. Ma Trận Ánh Xạ Frontend Route Groups ⟷ API v2 & React Query Keys

| Route Group | Chức năng chính | API Endpoints v2 | React Query Key chuẩn |
| :--- | :--- | :--- | :--- |
| `(auth)` | Đăng nhập theo vai trò `(d, p)` | `POST /api/auth/login`, `GET /api/auth/profile` | `['auth', 'profile']` |
| `(reception)` | Hồ sơ `BENH_NHAN`, `THE_BHYT`, đăng ký `LUOT_KHAM` | `POST /api/patients`, `GET /api/patients/lookup`, `POST /api/patients/:maBN/insurance-cards`, `POST /api/examinations` | `['patients', 'lookup', q]`, `['insurance-cards', maBN]` |
| `(clinical)` | Khám `LUOT_KHAM`, kê `DON_THUOC`, chỉ định `PHIEU_XET_NGHIEM` | `PATCH /api/examinations/:id`, `POST /api/prescriptions`, `POST /api/lab-requests`, `GET /api/medicines`, `GET /api/lab-types` | `['examinations', id]`, `['medicines', 'list']`, `['lab-types', 'list']` |
| `(laboratory)` | KTV thực hiện & trả kết quả `PHIEU_XET_NGHIEM` | `GET /api/lab-requests`, `PATCH /api/lab-requests/:id/start`, `PATCH /api/lab-requests/:id/complete` | `['lab-requests', 'pending']` |
| `(inpatient)` | Đợt `DOT_NOI_TRU`, sơ đồ `GIUONG_BENH`, `PHAN_GIUONG` | `GET /api/beds/map`, `POST /api/inpatient/admissions`, `POST /api/inpatient/bed-allocations`, `POST /api/inpatient/transfer-bed`, `PATCH /api/inpatient/admissions/:id/discharge` | `['beds', 'map', date]`, `['inpatient', 'admissions']` |
| `(cashier)` | Lập `VIEN_PHI`, áp dụng 1 `THE_BHYT`, chốt thanh toán | `GET /api/billing/preview/:maLuotKham`, `POST /api/billing/invoices`, `PATCH /api/billing/invoices/:id/pay` | `['billing', 'preview', maLuotKham]`, `['billing', 'invoice', id]` |
| `(admin)` | Quản lý `KHOA`, `PHONG`, `GIUONG_BENH`, `NHAN_VIEN`, `THUOC`, `LOAI_XET_NGHIEM` | `/api/departments`, `/api/rooms`, `/api/staff`, `/api/reports/dashboard` | `['departments']`, `['staff']`, `['reports', 'dashboard']` |
