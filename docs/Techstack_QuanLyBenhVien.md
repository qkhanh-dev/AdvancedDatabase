# TECHSTACK DOCUMENTATION
## Hệ Thống Quản Lý Bệnh Viện (Hospital Management System – QLBV)
### Technology Stack, Architecture & Engineering Standards (v2.0 — Đồng bộ EER v2)
**Phiên bản:** v2.0 (Đồng bộ EER v2) | **Ngày cập nhật:** 15/11/2026 | **Trạng thái:** Đã cập nhật theo bộ sơ đồ v2  
**Học phần:** Cơ sở dữ liệu nâng cao (Advanced Database Systems) – Khoa CNTT, Đại học Sài Gòn (SGU)  
**Nhóm phát triển:** Nhóm 5 thành viên (Trưởng nhóm: Cao Nguyễn Quốc Khánh)

---

## 1. Mục Đích & Phạm Vi Dự Án

Tài liệu này quy định tiêu chuẩn kỹ thuật thống nhất về **Ngăn xếp công nghệ (Technology Stack)**, **Kiến trúc hệ thống ánh xạ từ mô hình Hướng đối tượng BCE (Boundary – Control – Entity)**, **Lược đồ cơ sở dữ liệu quan hệ 18 bảng (103 cột lưu trữ, 20 khóa ngoại `FK01`–`FK20`, 6 thuộc tính dẫn xuất `VIEW / Query`)**, **Danh mục RESTful API v2**, và **13 nhóm quy tắc toàn vẹn – nghiệp vụ** bám sát tuyệt đối:
- [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml)
- [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml)
- [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt)
- [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md) & [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md)

Hệ thống được thiết kế theo mô hình **Modular Monolith** phân tách rõ ràng tầng Client (Frontend) và Server (Backend), đảm bảo tính toàn vẹn dữ liệu lâm sàng, khóa tranh chấp phân giường nội trú theo khoảng nửa mở `[TuNgay, DenNgay)` và kiểm soát chi phí viện phí theo lượt khám (`VIEN_PHI.TruBHYT`).

---

## 2. Mức Độ Áp Dụng Công Nghệ (Adoption Levels)

| Mức áp dụng | Ý nghĩa & Quy tắc sử dụng trong Dự án QLBV |
| :--- | :--- |
| **REQUIRED** | Công nghệ nền tảng bắt buộc theo định hướng chuẩn kỹ thuật thống nhất (**Node.js 24 LTS, Next.js 14+ App Router, NestJS 10, TypeScript, CSDL Quan hệ hỗ trợ ACID Transaction/Trigger/VIEW — tham chiếu SQL Server cho DDL v2**). |
| **CORE** | Thư viện, framework và công cụ tiêu chuẩn được tích hợp trực tiếp trong mã nguồn để giải quyết các phân hệ nghiệp vụ y tế. |
| **OPTIONAL** | Thư viện bổ trợ trải nghiệm người dùng nâng cao (Dark mode y tế, âm thanh cảnh báo hàng đợi khám); chỉ triển khai khi hoàn tất luồng lõi. |
| **MOCK** | Dịch vụ giả lập nội bộ phục vụ demo (Cổng thanh toán không tiền mặt / đọc CCCD chip) không phát sinh chi phí thực tế. |
| **FUTURE** | Định hướng mở rộng môi trường Cloud Production (AWS/GCP, kết nối trục liên thông Bảo hiểm Y tế Xã hội Quốc gia BHXH, chuẩn HL7/FHIR). |

---

## 3. Danh Mục Techstack Chi Tiết

| Thành phần | Công nghệ / Lựa chọn | Mức | Ghi chú & Vai trò trong Hệ thống QLBV |
| :--- | :--- | :---: | :--- |
| **Runtime Environment** | **Node.js (v24 LTS)** + npm workspaces | **REQUIRED** | Môi trường thực thi đồng nhất cho cả Frontend Next.js và Backend NestJS. |
| **Frontend Framework** | **Next.js 14+ (App Router)** + **React 18** + **TypeScript** | **REQUIRED** | Hiện thực hóa toàn bộ tầng `<<boundary>>`: Tiếp đón & BHYT, Khám bệnh & Kê đơn, Xét nghiệm, Nội trú & Phân giường, Thu ngân viện phí, Dashboard quản trị. |
| **UI Styling & Components** | **Tailwind CSS** + **shadcn/ui (Radix UI)** + **Lucide Icons** | **CORE** | Thiết kế UI y tế chuyên nghiệp, sơ đồ giường bệnh phân biệt tình trạng khai thác (`GIUONG_BENH.TrangThai`) và trạng thái có người nằm suy diễn từ `PHAN_GIUONG`. |
| **Form & Client Validation** | **React Hook Form** + **Zod** | **CORE** | Xác thực dữ liệu: Mã định danh, CCCD, thẻ BHYT (`MucHuong` `[0,1]`, `NgayHetHan >= NgayBatDau`), khoảng ngày phân giường, số lượng thuốc `> 0`. |
| **Client State & Fetching** | **Zustand** + **TanStack Query (React Query v5)** | **CORE** | Zustand quản lý phiên làm việc theo cây vai trò `(d, p)`; TanStack Query đồng bộ sơ đồ giường theo ngày và kết quả xét nghiệm. |
| **Charts & Analytics UI** | **Recharts** | **CORE** | Biểu đồ doanh thu viện phí (`TongTienThuoc`, `TongTienDichVu`, `TruBHYT`, `ThucThu`), công suất sử dụng giường bệnh nội trú. |
| **Backend Framework** | **NestJS 10+** (TypeScript) + REST/JSON | **REQUIRED** | Hiện thực hóa tầng `<<control>>`: Điều phối giao dịch có khóa cho `DOT_NOI_TRU`, `PHAN_GIUONG`, `PHIEU_XET_NGHIEM`, `DON_THUOC`, `VIEN_PHI`. |
| **DTO & Input Validation** | **class-validator** + **class-transformer** | **CORE** | Chuẩn hóa DTO dữ liệu vào/ra cho 100% REST API theo [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md). |
| **Authentication & RBAC** | **Passport JWT** (`@nestjs/jwt`) + **bcrypt** + Guards | **CORE** | Phân quyền theo chuyên biệt hóa `NHAN_VIEN (d, p)`: `ADMIN`, `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`, và nhóm nhân sự *partial* (`TIEP_NHAN` / `THU_NGAN`). |
| **Database (RDBMS)** | **SQL Server** (tham chiếu DDL v2) / RDBMS hỗ trợ Trigger & VIEW | **REQUIRED** | Lưu trữ **18 bảng · 103 cột · 20 FK (`NO ACTION`)**; hỗ trợ `CHECK`, `VIEW` (6 thuộc tính dẫn xuất), Filtered Unique Index (`DOT_NOI_TRU(MaBN) WHERE NgayRaVien IS NULL`) và Trigger/Transaction có khóa. *(Mã nguồn demo v1 hiện dùng PostgreSQL 16 + Prisma; khi đồng bộ lên v2 cần migrate theo DDL 18 bảng).* |
| **ORM / Data Access** | **Prisma ORM** / SQL Stored Procedures & Views | **CORE** | Thực thi truy vấn an toàn kiểu và giao dịch nguyên tử kết hợp Trigger/Procedure bảo vệ 13 nhóm quy tắc toàn vẹn. |
| **PDF Medical Export** | **PDFKit** | **CORE** | Sinh phiếu khám bệnh, đơn thuốc và biên lai viện phí (`VIEN_PHI`) định dạng PDF. |
| **Payment (Mock)** | **Mock Payment Flow** | **MOCK** | Mô phỏng thu tiền mặt / chuyển khoản / thẻ khi chốt `VIEN_PHI.TrangThaiThanhToan`. |
| **API Documentation** | **Swagger / OpenAPI** (`@nestjs/swagger`) | **CORE** | Tự động sinh tài liệu Swagger trực quan tại `/api/docs`. |
| **Containerization** | **Docker** + **Docker Compose** | **CORE** | Đóng gói đồng bộ cụm dịch vụ Database, Backend, Frontend. |
| **Version Control & CI** | **Git** + **GitHub** + **GitHub Actions** | **CORE** | Quản trị mã nguồn, kiểm tra Type check, Linting và chạy Test trước khi merge Pull Request. |
| **Testing Framework** | **Jest** + **Supertest** + **SQL Test Scripts** | **CORE** | Kiểm thử DDL/Trigger 13 nhóm quy tắc, tranh chấp `PHAN_GIUONG` / `DOT_NOI_TRU`, và khóa chi phí `VIEN_PHI` sau thanh toán. |
| **Cloud Deployment** | **Vercel** + **Cloud Managed DB/API** | **FUTURE** | Phương án triển khai bản Cloud Demo nếu có yêu cầu trực tuyến. |

---

## 4. Phiên Bản Baseline & Chính Sách Cấu Hình

Để đảm bảo 100% tính tương thích giữa 5 thành viên trong nhóm, toàn bộ dự án tuân thủ nghiêm ngặt bộ thông số baseline:

| Hạng mục | Quy tắc Baseline & Tiêu chuẩn kỹ thuật |
| :--- | :--- |
| **Node.js & Package Manager** | Cố định **Node.js v24.x LTS**; sử dụng duy nhất trình quản lý gói `npm` (kèm file khóa `package-lock.json`). Cấu hình sẵn tệp `.nvmrc` chứa `v24`. |
| **Frontend Dependencies** | Next.js `^14.2.x` (App Router), React `^18.3.x`, TypeScript `^5.x`. Không tự ý cài đặt thư viện ngoài danh mục khi chưa có sự phê duyệt của Tech Lead. |
| **Backend Dependencies** | NestJS `^10.x`, `@nestjs/jwt ^10.x`, `class-validator ^0.14.x`, `prisma ^7.x` (`@prisma/client ^7.x`). Kích hoạt chế độ `strict: true` trong `tsconfig.json`. |
| **Database Reference (DDL v2)** | Tham chiếu **SQL Server** (`VARCHAR`, `NVARCHAR`, `DATE`, `DATETIME2(3)`, `DECIMAL(18,2)`, `DECIMAL(5,4)`) theo [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml); nhánh demo v1 dùng `postgres:16-alpine`. |
| **Biến môi trường (.env)** | Cung cấp file mẫu `.env.example` với đầy đủ các key cấu hình chuẩn (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `FRONTEND_URL`). **Tuyệt đối không commit tệp `.env` chứa thông tin thực lên GitHub**. |

---

## 5. Kiến Trúc Hệ Thống & Ánh Xạ Mô Hình BCE (Boundary – Control – Entity)

Dự án áp dụng kiến trúc **Modular Monolith** (xem chi tiết sơ đồ [06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml)):

```
[Actor: Bệnh nhân / Bác sĩ / Điều dưỡng / KTV / NV Tiếp nhận-Thu ngân-Admin (NHAN_VIEN partial)]
                           │ (HTTPS)
                           ▼
     ┌──────────────────────────────────────────────────────────┐
     │  <<boundary>> Giao diện Next.js App Router               │
     │  - (reception) / (clinical) / (laboratory)               │
     │  - (inpatient) / (cashier) / (admin) / (auth)            │
     └──────────────────────────┬───────────────────────────────┘
                                │ (RESTful JSON + JWT)
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │  <<control>> Tầng điều phối NestJS Backend               │
     │  - Domain Services, Guards, Pipes, Transaction Locks     │
     └──────────────────────────┬───────────────────────────────┘
                                │ (SQL / Stored Proc / VIEW / Trigger)
                                ▼
     ┌──────────────────────────────────────────────────────────┐
     │  <<entity>> Hệ CSDL Quan hệ 18 Bảng (Tham chiếu SQL Server)│
     │  - 18 Bảng · 103 Cột · 20 FK (NO ACTION) · 6 VIEW · 13 Rules│
     └──────────────────────────────────────────────────────────┘
```

### 5.1. Ánh Xạ Chi Tiết 3 Tầng Kiến Trúc BCE

#### A. Tầng Giao Diện `<<boundary>>` (Next.js App Router)
Tổ chức giao diện theo các Route Groups bám sát 18 bảng v2:
- `src/app/(reception)/*`: Tiếp nhận `BENH_NHAN` (không tạo `BN_NGOAI_TRU`), quản lý `THE_BHYT`, đăng ký `LUOT_KHAM`.
- `src/app/(clinical)/*`: Khám `LUOT_KHAM`, kê `DON_THUOC` / `CHI_TIET_DON_THUOC` (chụp `DonGiaKe`), chỉ định `PHIEU_XET_NGHIEM` (chụp `DonGiaXN`).
- `src/app/(laboratory)/*`: Dành cho Kỹ thuật viên (`KY_THUAT_VIEN`) – ghi nhận `MaNV_KTV`, `NgayGioXN`, `KetQua`, `DanhGia`, `NgayGioTraKQ` đồng bộ trên `PHIEU_XET_NGHIEM`.
- `src/app/(inpatient)/*`: Mở/đóng `DOT_NOI_TRU`, tra cứu `GIUONG_BENH.TrangThai` (khai thác) kết hợp `PHAN_GIUONG` tại ngày `D`, phân giường & chuyển giường `[TuNgay, DenNgay)`.
- `src/app/(cashier)/*`: Lập `VIEN_PHI` theo `LUOT_KHAM`, chọn tối đa 1 `THE_BHYT` còn hạn để lưu `TruBHYT`, chốt thanh toán và khóa chi phí liên quan.
- `src/app/(admin)/*`: Quản trị danh mục `KHOA`, `PHONG`, `GIUONG_BENH`, `NHAN_VIEN (d, p)`, `THUOC`, `LOAI_XET_NGHIEM` và Dashboard báo cáo.

#### B. Tầng Điều Phối Nghiệp Vụ `<<control>>` (NestJS Modules)
- `AuthModule`: Xác thực người dùng, cấp JWT và phân quyền theo cây `NHAN_VIEN (d, p)`.
- `DepartmentRoomModule`: Quản lý `KHOA`, `PHONG`, `GIUONG_BENH` (tách biệt trạng thái khai thác với trạng thái chiếm giường suy diễn từ `PHAN_GIUONG`).
- `StaffModule`: Quản lý `NHAN_VIEN` và chuyên biệt hóa disjoint, partial sang `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`.
- `PatientInsuranceModule`: Quản lý `BENH_NHAN` và `THE_BHYT` (`MucHuong` `[0,1]`, `NgayHetHan >= NgayBatDau`).
- `ExaminationModule`: Điều phối `LUOT_KHAM` (`MaDotNT = NULL` ngoại trú hoặc khớp `FK11(MaDotNT, MaBN)` và khung ngày đợt nội trú).
- `PrescriptionModule`: Kê `DON_THUOC` (1–0..1) và `CHI_TIET_DON_THUOC` (`SoLuong > 0`, giá lịch sử `DonGiaKe`, đảm bảo đơn có chi tiết).
- `LabTestModule`: Quản lý `LOAI_XET_NGHIEM` và vòng đời `PHIEU_XET_NGHIEM` (`MaNV_KTV`, `NgayGioXN`, `NgayGioTraKQ`, `KetQua`, `DanhGia`).
- `InpatientStayModule`: Quản lý `DOT_NOI_TRU` (tối đa 1 đợt mở/`MaBN`, chống chồng khoảng) và `PHAN_GIUONG` `[TuNgay, DenNgay)` có khóa chống tranh chấp.
- `BillingModule`: Tính `TongTienThuoc`, `TongTienDichVu` (`NgayGioXN IS NOT NULL`), áp dụng tối đa 1 `THE_BHYT` lưu vào `VIEN_PHI.TruBHYT`, tính `ThucThu` và khóa chi phí sau thanh toán.
- `ReportModule`: Tổng hợp số liệu vận hành từ 18 bảng và `VIEW`.

#### C. Tầng Thực Thể & Lưu Trữ `<<entity>>` (18 Bảng · Tham chiếu SQL Server)
Bao gồm **18 bảng thực thể**, **103 cột lưu trữ**, **20 khóa ngoại `FK01`–`FK20`** (`ON DELETE NO ACTION / ON UPDATE NO ACTION`), **6 thuộc tính dẫn xuất** qua `VIEW / Query`, và **13 nhóm quy tắc** thực thi qua DDL, `CHECK`, `UNIQUE` và `Trigger/Transaction`.

---

## 6. Thiết Kế Cơ Sở Dữ Liệu & Danh Mục RESTful API (v2.0)

### 6.1. Danh Mục 18 Bảng Thực Thể Theo EER v2

| STT | Tên Bảng | Vai trò nghiệp vụ trong v2 | Khóa chính (PK) & Khóa ngoại (FK01–FK20) |
| :---: | :--- | :--- | :--- |
| **01** | `KHOA` | Danh mục chuyên khoa | `PK(MaKhoa)` |
| **02** | `PHONG` | Phòng khám / buồng bệnh | `PK(MaPhong)`; `FK01(MaKhoa)→KHOA` |
| **03** | `GIUONG_BENH` | Giường bệnh & tình trạng khai thác `TrangThai` | `PK(MaGiuong)`; `FK02(MaPhong)→PHONG` |
| **04** | `NHAN_VIEN` | Bảng cha nhân sự (`SoNamCongTac ()` dẫn xuất) | `PK(MaNV)`; `FK03(MaKhoa)→KHOA` |
| **05** | `BAC_SI` | Bảng con IS-A `(d, p)` bác sĩ | `PK,FK04(MaNV)→NHAN_VIEN` |
| **06** | `DIEU_DUONG` | Bảng con IS-A `(d, p)` điều dưỡng (1 CCHN chính) | `PK,FK05(MaNV)→NHAN_VIEN` |
| **07** | `KY_THUAT_VIEN` | Bảng con IS-A `(d, p)` kỹ thuật viên XN | `PK,FK06(MaNV)→NHAN_VIEN` |
| **08** | `BENH_NHAN` | Hồ sơ bệnh nhân (`Tuoi ()` dẫn xuất) | `PK(MaBN)` |
| **09** | `THE_BHYT` | Thẻ BHYT của bệnh nhân (`MucHuong` `[0,1]`) | `PK(MaTheBHYT)`; `FK08(MaBN)→BENH_NHAN` |
| **10** | `DOT_NOI_TRU` | Đợt điều trị nội trú (`NgayRaVien` nullable) | `PK(MaDotNT)`; `FK07(MaBN)→BENH_NHAN`; `UQ(MaDotNT, MaBN)`; Filtered `UQ(MaBN) WHERE NgayRaVien IS NULL` |
| **11** | `PHAN_GIUONG` | Phân giường theo ngày `[TuNgay, DenNgay)` | `PK(MaDotNT, MaGiuong, TuNgay)`; `FK18(MaDotNT)→DOT_NOI_TRU`; `FK19(MaGiuong)→GIUONG_BENH` |
| **12** | `LUOT_KHAM` | Lượt khám ngoại trú (`MaDotNT` NULL) / nội trú | `PK(MaLuotKham)`; `FK09(MaBN)→BENH_NHAN`; `FK10(MaNV_BacSi)→BAC_SI`; `FK11(MaDotNT, MaBN)?→DOT_NOI_TRU` |
| **13** | `DON_THUOC` | Đơn thuốc 1–0..1 theo lượt (`TongTienThuoc ()` dẫn xuất) | `PK(MaDonThuoc)`; `FK12(MaLuotKham, UQ)→LUOT_KHAM` |
| **14** | `CHI_TIET_DON_THUOC` | Chi tiết thuốc & giá lịch sử `DonGiaKe` | `PK(MaDonThuoc, MaThuoc)`; `FK13→DON_THUOC`; `FK14→THUOC` |
| **15** | `THUOC` | Danh mục thuốc & `DonGia` (không có `SoLuongTon`) | `PK(MaThuoc)` |
| **16** | `LOAI_XET_NGHIEM` | Danh mục loại xét nghiệm & `DonGia` | `PK(MaLoaiXN)` |
| **17** | `PHIEU_XET_NGHIEM` | Phiếu XN, KTV thực hiện, KQ & `DonGiaXN` | `PK(MaPhieuXN)`; `FK15→LUOT_KHAM`; `FK16→LOAI_XET_NGHIEM`; `FK17(MaNV_KTV)?→KY_THUAT_VIEN` |
| **18** | `VIEN_PHI` | Viện phí 1–0..1 theo lượt (`TruBHYT` lưu trữ; `TongTienDichVu ()`, `TongTienThuoc ()`, `ThucThu ()` dẫn xuất) | `PK(MaHoaDon)`; `FK20(MaLuotKham, UQ)→LUOT_KHAM` |

### 6.2. Danh Mục RESTful API Trọng Tâm (v2.0)

Chi tiết payload DTO, kiểu trả về và mã lỗi xem tại [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md):
- **Cơ sở vật chất:** `GET/POST/PATCH /api/departments`, `/api/rooms`, `GET /api/beds/map?date=YYYY-MM-DD`, `PATCH /api/beds/:maGiuong/status`.
- **Nhân sự `(d, p)`:** `GET/POST /api/staff`, `/api/staff/doctors`, `/api/staff/nurses`, `/api/staff/technicians`.
- **Bệnh nhân & BHYT:** `POST /api/patients`, `GET /api/patients/lookup?q=...`, `POST/GET /api/patients/:maBN/insurance-cards`.
- **Khám, Đơn thuốc & XN:** `POST/PATCH/GET /api/examinations`, `GET /api/medicines`, `POST/PATCH/DELETE /api/prescriptions`, `GET /api/lab-types`, `POST /api/lab-requests`, `PATCH /api/lab-requests/:id/start`, `PATCH /api/lab-requests/:id/complete`.
- **Nội trú & Phân giường:** `POST /api/inpatient/admissions`, `POST /api/inpatient/bed-allocations`, `POST /api/inpatient/transfer-bed`, `PATCH /api/inpatient/admissions/:maDotNT/discharge`.
- **Viện phí & Báo cáo:** `GET /api/billing/preview/:maLuotKham`, `POST /api/billing/invoices`, `PATCH /api/billing/invoices/:maHoaDon/pay`, `GET /api/reports/dashboard`.

---

## 7. Chuẩn Xử Lý 13 Nhóm Quy Tắc Toàn Vẹn & Nghiệp Vụ (BR-V2-01 → BR-V2-13)

Toàn bộ quy tắc chi tiết được đặc tả tại [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md) và [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt), tóm tắt các trụ cột xử lý cốt lõi:

1. **Chuyên biệt hóa `NHAN_VIEN (d, p)` (Mục 1):** Kiểm soát disjoint giữa `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN` và partial cho nhân sự ngoài 3 nhóm.
2. **Đợt nội trú `DOT_NOI_TRU` & Chống chồng khoảng (Mục 2, 12):** `NgayRaVien >= NgayNhapVien`; tối đa 1 đợt đang mở (`UNIQUE(MaBN) WHERE NgayRaVien IS NULL`); khóa theo `MaBN` ngăn giao khoảng `[NgayNhapVien, NgayRaVien + 1)`.
3. **Phân giường `[TuNgay, DenNgay)` & `GIUONG_BENH.TrangThai` (Mục 3, 11):** Quản lý theo `DATE`, không chuyển nhiều lần trong ngày; `DenNgay > TuNgay`; không trùng khoảng cho cùng giường hay cùng đợt; transaction/trigger có khóa khi tạo/chuyển giường và tự đóng phân giường khi ra viện (`DenNgay <= NgayRaVien + 1`); `GIUONG_BENH.TrangThai` chỉ biểu diễn tình trạng khai thác.
4. **Lượt khám nội trú `FK11` (Mục 4):** `LUOT_KHAM(MaDotNT, MaBN) → DOT_NOI_TRU(MaDotNT, MaBN)` với `MaDotNT` nullable; `NgayGioKham` nằm trong `[NgayNhapVien, NgayRaVien + 1)`.
5. **Đơn thuốc & Xét nghiệm (Mục 5, 6, 7):** Mỗi lượt khám tối đa 1 `DON_THUOC` và 1 `VIEN_PHI`; `SoLuong > 0`; đơn giá `>= 0`; `PHIEU_XET_NGHIEM` ghi nhận đồng bộ `MaNV_KTV`, `NgayGioXN`, `KetQua`, `NgayGioTraKQ >= NgayGioXN` trong cùng transaction.
6. **Viện phí `VIEN_PHI.TruBHYT` & Khóa chi phí sau thanh toán (Mục 8, 9, 10, 13):** `TruBHYT` là cột lưu trữ `DECIMAL(18,2) DEFAULT 0`, chọn tối đa 1 `THE_BHYT` còn hạn tại ngày khám, kiểm tra `0 <= TruBHYT <= TongTienThuoc + TongTienDichVu` (chỉ tính phiếu XN có `NgayGioXN IS NOT NULL`, không tính tiền giường); sau thanh toán khóa sửa/xóa hóa đơn, đơn thuốc, phiếu XN và các khóa liên kết; đồng bộ bằng cùng cơ chế khóa khi thay đổi chi phí trước thanh toán.

---

## 8. Cấu Trúc Thư Mục Dự Án (Repository Monorepo Structure)

Dự án được cấu trúc theo dạng Monorepo chuẩn hóa, phân tách rành mạch mã nguồn Frontend và Backend:

```text
AdvancedDatabase/
├── frontend/                              # Next.js 14+ (App Router, TypeScript, Tailwind CSS)
│   ├── public/                            # Static assets, logo bệnh viện, icons
│   ├── src/
│   │   ├── app/                           # Route Groups theo phân hệ
│   │   │   ├── (auth)/                    # /login, /forgot-password
│   │   │   ├── (reception)/               # Tiếp đón người bệnh, tra cứu hồ sơ
│   │   │   ├── (clinical)/                # Khám bệnh LUOT_KHAM, kê DON_THUOC, chỉ định XN
│   │   │   ├── (laboratory)/              # KTV thực hiện & trả kết quả PHIEU_XET_NGHIEM
│   │   │   ├── (inpatient)/               # DOT_NOI_TRU, sơ đồ GIUONG_BENH & PHAN_GIUONG
│   │   │   ├── (cashier)/                 # Lập VIEN_PHI theo lượt, áp 1 THE_BHYT -> TruBHYT
│   │   │   └── (admin)/                   # Quản trị KHOA, PHONG, NHAN_VIEN, THUOC, LOAI_XET_NGHIEM
│   │   ├── components/                    # Reusable UI (BedCard, PatientQueue, InvoiceView,...)
│   │   │   └── ui/                        # shadcn/ui primitives (Dialog, Table, Badge,...)
│   │   ├── hooks/                         # Custom React hooks (useBedStatus, usePatientSearch,...)
│   │   ├── lib/                           # Utility functions, axios client instance
│   │   └── types/                         # TypeScript interfaces đồng bộ API_Contract_v2.md
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                               # NestJS 10+ (TypeScript, Modular Monolith)
│   ├── prisma/                            # Schema & Migrations (nhánh demo v1 dùng Prisma/Postgres; bản v2 tham chiếu DDL 18 bảng SQL Server)
│   ├── src/
│   │   ├── common/                        # Interceptors, Filters, Guards, Decorators
│   │   │   ├── decorators/                # @Roles(), @CurrentUser()
│   │   │   ├── filters/                   # HttpExceptionFilter
│   │   │   └── guards/                    # JwtAuthGuard, RolesGuard
│   │   └── modules/                       # 10 Phân hệ nghiệp vụ tương ứng EER v2
│   │       ├── auth/                      # Xác thực, cấp JWT Token, phân quyền (d, p)
│   │       ├── department-room/           # KHOA, PHONG, GIUONG_BENH
│   │       ├── staff/                     # NHAN_VIEN, BAC_SI, DIEU_DUONG, KY_THUAT_VIEN
│   │       ├── patient-insurance/         # BENH_NHAN, THE_BHYT
│   │       ├── examination/               # LUOT_KHAM (MaDotNT NULL hoặc FK11)
│   │       ├── prescription/              # DON_THUOC, CHI_TIET_DON_THUOC, THUOC
│   │       ├── lab-test/                  # LOAI_XET_NGHIEM, PHIEU_XET_NGHIEM
│   │       ├── inpatient-stay/            # DOT_NOI_TRU, PHAN_GIUONG [TuNgay, DenNgay)
│   │       ├── billing/                   # VIEN_PHI, TruBHYT, khóa chi phí sau thanh toán
│   │       └── report/                    # Thống kê doanh thu, công suất giường
│   ├── test/                              # E2E & Integration tests (Supertest)
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                                  # Tài liệu kỹ thuật & Sơ đồ
│   ├── API_Contract_v2.md                 # Đặc tả REST API v2.0 (18 bảng, 13 nhóm quy tắc)
│   ├── API_Contract_v1.md                 # Lưu trữ đặc tả v1.0 (tham chiếu lịch sử)
│   ├── Business_Rules_v2.md               # Đặc tả chi tiết 13 nhóm quy tắc & 6 VIEW dẫn xuất
│   ├── Rang buoc DTB v2 - 13 muc.txt      # Nguồn 13 mục ràng buộc CSDL v2
│   ├── Techstack_QuanLyBenhVien.md        # Tài liệu Techstack (File này)
│   └── diagrams/                          # Bộ 6 sơ đồ Draw.io XML v2 + README.md
│
├── docker-compose.yml                     # Khởi chạy đồng bộ Database, NestJS, Next.js
├── .env.example                           # Cấu hình biến môi trường chuẩn
├── .gitignore
└── README.md                              # Hướng dẫn cài đặt và kịch bản demo hệ thống
```

---

## 9. Quy Trình Làm Việc Nhóm & Tiêu Chuẩn Kỹ Thuật (Workflow & Engineering Standards)

Dự án được triển khai bởi nhóm 5 sinh viên Khoa CNTT – Đại học Sài Gòn theo quy trình chuẩn công nghiệp:

### 9.1. Phân Công Trách Nhiệm Thành Viên

| Thành viên | MSSV | Vai trò kỹ thuật chính trong Dự án |
| :--- | :---: | :--- |
| **Cao Nguyễn Quốc Khánh** | 3124410149 | **Trưởng nhóm / Technical Lead**: Thiết kế kiến trúc tổng thể, lược đồ 18 bảng & 13 nhóm quy tắc, dựng Core Backend NestJS, phân quyền RBAC, kiểm duyệt PR. |
| **Trần Nguyễn Quỳnh Như** | 3124410258 | **Fullstack Developer & QA Lead**: Phát triển phân hệ Tiếp đón (`BENH_NHAN`, `THE_BHYT`), xây dựng Test Suite (Jest/Supertest/SQL) và tài liệu API Swagger. |
| **Hoàng Văn Lập** | 3124410184 | **Fullstack Developer**: Phát triển phân hệ Khám bệnh (`LUOT_KHAM`), Kê đơn thuốc (`DON_THUOC`, `CHI_TIET_DON_THUOC`) và Xét nghiệm (`PHIEU_XET_NGHIEM`). |
| **Nguyễn Đăng Thụy** | 3124410352 | **Fullstack Developer**: Phát triển phân hệ Quản lý Nội trú (`DOT_NOI_TRU`), Sơ đồ giường bệnh (`GIUONG_BENH`) & Phân giường `[TuNgay, DenNgay)` (`PHAN_GIUONG`). |
| **Cô Thành Long** | 31244102192 | **Fullstack Developer**: Phát triển phân hệ Thu ngân Viện phí (`VIEN_PHI`), áp dụng 1 thẻ `THE_BHYT` -> `TruBHYT`, khóa chi phí sau thanh toán và xuất PDF. |

### 9.2. Chiến Lược Quản Lý Nhánh Git (Git Branching Strategy)
- **Nhánh `main`**: Nhánh phát hành ổn định, chỉ nhận merge sau khi kết thúc đợt kiểm thử tích hợp.
- **Nhánh `dev`**: Nhánh tích hợp chính của cả nhóm.
- **Nhánh tính năng (`feat/...`)**: Tách ra từ `dev` theo định dạng `feat/QLBV-<module>` và `fix/QLBV-<issue>`.

### 9.3. Quy Chuẩn Commit (Conventional Commits)
- `feat(clinical): enforce prescription detail check and historical DonGiaKe`
- `feat(inpatient): implement [TuNgay, DenNgay) bed interval locking for PHAN_GIUONG`
- `feat(billing): store TruBHYT and lock post-payment cost mutations`
- `docs(v2): sync API_Contract_v2, Business_Rules_v2 and 6 v2 diagrams`

### 9.4. Quy Trình Pull Request & Code Review
- 100% PR muốn merge vào nhánh `dev` phải vượt qua bài kiểm tra TypeScript Check, Linting và Unit/Integration Tests.
- Bắt buộc có review và phê duyệt từ Technical Lead hoặc thành viên phụ trách phân hệ liên quan.

---

## 10. Chiến Lược Kiểm Thử & Tiêu Chuẩn Hoàn Thành (DoD)

### 10.1. Các Cấp Độ Kiểm Thử
1. **Kiểm thử DDL, Trigger & VIEW CSDL**:
   - Kiểm tra 20 FK `NO ACTION`, `FK11` ghép `(MaDotNT, MaBN)`, Conditional Unique `DOT_NOI_TRU(MaBN) WHERE NgayRaVien IS NULL`.
   - Kiểm tra 6 thuộc tính dẫn xuất (`SoNamCongTac`, `Tuoi`, `DON_THUOC.TongTienThuoc`, `VIEN_PHI.TongTienDichVu`, `VIEN_PHI.TongTienThuoc`, `VIEN_PHI.ThucThu`).
2. **Kiểm thử tích hợp nghiệp vụ (Integration Testing)**:
   - Luồng ngoại trú (`MaDotNT = NULL`) & nội trú (`MaDotNT` khớp `FK11`): `LUOT_KHAM` ➔ `PHIEU_XET_NGHIEM` (`MaNV_KTV`, `NgayGioXN`, `KetQua`, `NgayGioTraKQ`) ➔ `DON_THUOC` ➔ `VIEN_PHI` (tính `TruBHYT` tối đa 1 thẻ `THE_BHYT` và khóa sửa/xóa sau thanh toán).
   - Luồng nội trú: `DOT_NOI_TRU` ➔ `PHAN_GIUONG` `[TuNgay, DenNgay)` ➔ chuyển giường khác ngày ➔ ra viện đóng phân giường đang mở `DenNgay <= NgayRaVien + 1`.
3. **Kiểm thử đồng thời & Tranh chấp (Concurrency Testing)**:
   - Giả lập 2 yêu cầu đồng thời tạo `DOT_NOI_TRU` cho cùng `MaBN` (`Mục 12`).
   - Giả lập 2 điều dưỡng đồng thời phân cùng giường `GIUONG_BENH` hoặc 1 đợt vào 2 giường trong khoảng giao nhau (`Mục 3`).
   - Giả lập thao tác sửa/thêm chi phí song song với thao tác chốt thanh toán `VIEN_PHI` (`Mục 8, 13`).

### 10.2. Tiêu Chuẩn Hoàn Thành (Definition of Done – DoD)
1. Mã nguồn hoàn thiện, không lỗi biên dịch TypeScript / cảnh báo ESLint.
2. Đáp ứng đủ 13 nhóm quy tắc trong [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md) ở cả tầng ứng dụng và tầng CSDL.
3. Giao diện Frontend hiển thị đầy đủ trạng thái Loading, Error handling và Success feedback.
4. Vượt qua toàn bộ Unit Test, Integration Test và Concurrency Test.

---

## 11. Các Quyết Định Kiến Trúc & Kỹ Thuật Đã Chốt (v2.0)

| STT | Hạng mục quyết định | Phương án kỹ thuật thống nhất | Lý do & Căn cứ kỹ thuật |
| :---: | :--- | :--- | :--- |
| **1** | **Đặc tả CSDL 18 bảng v2** | Tham chiếu **SQL Server** (`18 bảng`, `103 cột`, `20 FK NO ACTION`, `6 VIEW/Query`, `13 nhóm quy tắc`) | Đồng bộ tuyệt đối với [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml) và [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml). |
| **2** | **Chuyên biệt hóa `NHAN_VIEN (d, p)`** | Bảng cha `NHAN_VIEN` + 3 bảng con `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN` (`disjoint, partial`) | Giữ rành mạch nhân sự chuyên môn y tế và cho phép nhân sự tiếp nhận/thu ngân/quản trị mà không cần thêm bảng `NV_HANH_CHINH`. |
| **3** | **Giá lịch sử & Lưu `TruBHYT`** | Snapshot `DonGiaKe`, `DonGiaXN`; lưu trữ `VIEN_PHI.TruBHYT DECIMAL(18,2) DEFAULT 0` | Biến động giá danh mục hoặc `THE_BHYT.MucHuong` về sau không làm sai lệch `VIEN_PHI` đã lập; các tổng tiền còn lại tính qua `VIEW/Query`. |
| **4** | **Quản lý giường theo khoảng `[TuNgay, DenNgay)`** | `PHAN_GIUONG` nửa mở theo `DATE`; `GIUONG_BENH.TrangThai` chỉ lưu tình trạng khai thác | Tránh trạng thái nhập tay mâu thuẫn lịch sử nằm giường; kiểm soát chặt tranh chấp bằng transaction/trigger có khóa. |
| **5** | **Khóa chi phí sau thanh toán** | Đồng bộ khóa giữa thay đổi chi phí (`DON_THUOC`, `PHIEU_XET_NGHIEM`, khóa liên kết) và chốt `VIEN_PHI` | Ngăn sửa đổi hoặc chuyển chi phí sang lượt khác làm sai lệch hóa đơn đã thanh toán hoặc `ThucThu < 0`. |

---

## 12. Tài Liệu Kỹ Thuật Tham Chiếu Liên Quan

1. [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml): Sơ đồ EER hoàn chỉnh v2 (18 thực thể).
2. [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml): Lược đồ quan hệ 18 bảng, 103 cột, 20 FK, 6 thuộc tính dẫn xuất.
3. [docs/diagrams/README.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/README.md): Danh mục toàn bộ 6 sơ đồ kỹ thuật v2 (`01`–`06`).
4. [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt): Đặc tả gốc 13 mục ràng buộc thiết kế CSDL v2.
5. [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md): Tài liệu chuẩn hóa 13 nhóm quy tắc nghiệp vụ & toàn vẹn CSDL v2.
6. [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md): Đặc tả REST API v2.0 đồng bộ 18 bảng và 13 nhóm quy tắc.
