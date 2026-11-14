# BÁO CÁO NHẬT KÝ CÀI ĐẶT CÔNG NGHỆ FRONTEND & BACKEND (TECHSTACK v2.0)
## Hệ Thống Quản Lý Bệnh Viện (Hospital Management System – QLBV)

- **Học phần:** Cơ sở dữ liệu nâng cao (Advanced Database Systems) – Khoa CNTT, Đại học Sài Gòn (SGU)
- **Nhóm thực hiện:** Nhóm 5 (Trưởng nhóm: Cao Nguyễn Quốc Khánh)
- **Thời gian thực hiện:** Ngày 14/11/2026, lúc 16:38:00 (GMT+7)
- **Trạng thái:** Hoàn thành toàn diện, kiểm thử thành công, sẵn sàng tích hợp

---

## 1. Tổng Quan Kiến Trúc Đã Thiết Lập

Dự án đã được hiện thực hóa theo đúng mô hình **Modular Monolith** phân tách rõ ràng tầng Client (Frontend) và Server (Backend), bám sát 100% hồ sơ [Techstack_QuanLyBenhVien.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Techstack_QuanLyBenhVien.md) và [Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md):

```text
AdvancedDatabase/
├── frontend/                              # Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide)
├── backend/                               # NestJS 10+ (TypeScript, Prisma ORM, PostgreSQL 16)
├── docs/                                  # Tài liệu kỹ thuật, báo cáo & nhật ký
├── docker-compose.yml                     # Cụm container đồng bộ: postgres-db, backend, frontend
├── .env.example                           # Biến môi trường mẫu
├── .gitignore                             # Chuẩn hóa loại trừ node_modules, dist, env
└── README.md                              # Hướng dẫn cài đặt, chạy Docker và demo hệ thống
```

---

## 2. Nhật Ký Chi Tiết Cài Đặt FRONTEND (`frontend/`)

### 2.1. Ngăn xếp công nghệ đã cài đặt
- **Framework & Runtime:** Next.js `14.2.35` (App Router) + React `18.3.x` + TypeScript `5.x`.
- **UI & Styling:** Tailwind CSS `3.4.1` + Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-tabs`) + Lucide Icons (`lucide-react`).
- **Form & Validation:** `react-hook-form` (`^7.92.0`) + `zod` (`^4.6.7`) + `@hookform/resolvers`.
- **State & Data Fetching:** Zustand (`^5.1.0`) cho client state; TanStack React Query v5 (`@tanstack/react-query ^5.107.1`) cho server state fetching & cache invalidation.
- **Data Visualization:** Recharts (`^3.10.1`) phục vụ vẽ biểu đồ tài chính viện phí và công suất giường bệnh.
- **HTTP Client:** Axios (`^1.21.1`) cấu hình sẵn Interceptors gắn Bearer JWT Token.

### 2.2. Các phân hệ giao diện đã xây dựng (`src/app/`)
Ánh xạ hoàn chỉnh tầng `<<boundary>>` theo Route Groups:
1. `src/app/page.tsx`: Cổng thông tin điều hướng trung tâm (Portal Dashboard) hiển thị danh mục 8 phân hệ y tế, số liệu thống kê giường bệnh, lượt khám và doanh thu.
2. `src/app/(auth)/login/page.tsx`: Màn hình đăng nhập cán bộ y tế, hỗ trợ chọn nhanh các vai trò test (`BS01`, `BS02`, `DD01`, `NV_TN_01`).
3. `src/app/(reception)/reception/page.tsx`: Màn hình Tiếp đón người bệnh, tra cứu hồ sơ theo CCCD/BHYT, tạo số hồ sơ khám ngoại trú.
4. `src/app/(clinical)/clinical/page.tsx`: Màn hình Bác sĩ khám bệnh, nhập chỉ số sinh hiệu (Huyết áp, Mạch, Nhiệt độ), chẩn đoán ICD và kê đơn thuốc.
5. `src/app/(inpatient)/inpatient/page.tsx`: Màn hình Sơ đồ buồng bệnh & Giường bệnh trực quan theo màu (Trống, Đang nằm, Bảo trì), tiếp nhận nội trú và đổi giường.
6. `src/app/(laboratory)/laboratory/page.tsx`: Màn hình Cận lâm sàng dành cho Điều dưỡng/KTV, danh sách chỉ định chờ thực hiện và nhập kết quả xét nghiệm/CĐHA.
7. `src/app/(pharmacy)/pharmacy/page.tsx`: Màn hình Kho dược & Cấp phát thuốc, kiểm tra số lượng tồn kho và duyệt phát thuốc.
8. `src/app/(cashier)/cashier/page.tsx`: Màn hình Thu ngân Viện phí, tính toán tự động khấu trừ BHYT, hiển thị mã VietQR thanh toán và in biên lai PDF.
9. `src/app/(admin)/admin/page.tsx`: Màn hình Quản trị hệ thống, quản lý danh mục Khoa, Phòng chức năng, Giường bệnh và phân ca trực y bác sĩ.

### 2.3. Reusable Components & Stores
- `src/components/ui/`: Bộ UI primitives (`button.tsx`, `card.tsx`, `badge.tsx`).
- `src/components/providers/QueryProvider.tsx`: Cấu hình React Query client.
- `src/store/useAuthStore.ts`: Quản lý trạng thái phiên đăng nhập, JWT token và thông tin quyền hạn của người dùng.
- `src/lib/api.ts`: Instance Axios trỏ về API Backend (`http://localhost:3001/api`).

---

## 3. Nhật Ký Chi Tiết Cài Đặt BACKEND (`backend/`)

### 3.1. Ngăn xếp công nghệ đã cài đặt
- **Runtime:** Node.js v24 LTS.
- **Framework:** NestJS 10.4 (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/config`).
- **Database & ORM:** PostgreSQL 16 + Prisma ORM `6.4.1` (`@prisma/client`, `prisma`).
- **Authentication & Security:** `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` (`@types/bcrypt`).
- **DTO Validation:** `class-validator` (`^0.14.1`), `class-transformer` (`^0.5.1`).
- **PDF Generation:** `pdfkit` (`^0.15.2`), `@types/pdfkit`.
- **API Documentation:** Swagger / OpenAPI (`@nestjs/swagger`, `swagger-ui-express`).
- **Testing:** Jest `29.7.0`, Supertest `7.0.0`, ts-jest `29.2.5`.

### 3.2. Cơ sở dữ liệu Prisma (`backend/prisma/schema.prisma`)
Hiện thực hóa chính xác **19 bảng thực thể BCNF**, **13 Enums chuẩn hóa** và **25 ràng buộc khóa ngoại** (Foreign Keys):
1. **13 Enums:** `LoaiPhongEnum`, `LoaiGiuongEnum`, `TrangThaiGiuongEnum`, `LoaiNVEnum`, `GioiTinhEnum`, `NhomMauEnum`, `HuongXuTriEnum`, `TrangThaiPhatThuocEnum`, `LoaiDichVuEnum`, `PhuongThucTTEnum`, `TrangThaiTTEnum`, `CaTrucEnum`, `TrangThaiDiemDanhEnum`.
2. **19 Models:**
   - Cơ sở vật chất: `Khoa`, `Phong`, `GiuongBenh`.
   - Nhân sự y tế (IS-A Superclass/Subclasses): `NhanVien`, `BacSi`, `DieuDuong`, `NvHanhChinh`.
   - Hồ sơ bệnh nhân (IS-A Superclass/Subclasses): `BenhNhan`, `BnNgoaiTru`, `BnNoiTru`.
   - Khám chữa bệnh & Dược: `LuotKham`, `DonThuoc`, `Thuoc`, `CtDonThuoc`.
   - Cận lâm sàng & Kỹ thuật: `DichVu`, `SuDungDv`.
   - Quản lý nội trú & Vận hành: `PhanGiuong`, `HoaDon`, `LichTruc`.
3. **Seed Data (`backend/prisma/seed.ts`):**
   - Giải quyết triệt để phụ thuộc vòng (Circular Dependency) giữa `KHOA.MaTruongKhoa` và `BAC_SI.MaNV`.
   - Nạp đầy đủ dữ liệu mẫu: Danh mục thuốc, danh mục dịch vụ cận lâm sàng, khoa phòng, buồng bệnh, giường bệnh, bệnh nhân và cán bộ y tế với mật khẩu băm bcrypt an toàn (`123456`).

### 3.3. Các Phân Hệ Backend Modules Đã Xây Dựng (`backend/src/modules/`)
1. **`prisma`**: `PrismaService` & `@Global() PrismaModule` kết nối CSDL PostgreSQL với lifecycle hooks.
2. **`auth`**: `AuthService`, `AuthController`, `JwtStrategy`. Đăng nhập đa phương thức (MaNV, CCCD, Email), cấp token JWT kèm phân quyền.
3. **`department-room`**: Lấy danh mục Khoa kèm Trưởng khoa (`GET /api/departments`), tra cứu buồng bệnh trống (`GET /api/rooms/available`), sơ đồ trạng thái giường bệnh (`GET /api/beds/map`).
4. **`staff`**: Quản lý cán bộ y tế (`GET /api/staff`), danh sách bác sĩ (`/doctors`), điều dưỡng (`/nurses`), xem chi tiết bằng cấp và chứng chỉ hành nghề (`SoCCHN`).
5. **`patient`**: Tiếp đón bệnh nhân (`POST /api/patients/reception`), tra cứu hồ sơ đa năng theo mã, CCCD, BHYT, SĐT (`GET /api/patients/lookup`), phân trang hồ sơ người bệnh.
6. **`examination`**: Khởi tạo lượt khám lâm sàng (`POST /api/examinations`), ghi nhận sinh hiệu (Huyết áp, Mạch, Nhiệt độ), cập nhật chẩn đoán xác định (`PATCH /api/examinations/:id/diagnose`).
7. **`prescription`**: Bác sĩ kê toa thuốc (`POST /api/prescriptions`) có snapshot đơn giá (`DonGiaBan`), dược sĩ phát thuốc (`PATCH /api/prescriptions/:id/dispense`) với cơ chế trừ tồn kho nguyên tử.
8. **`clinical-service`**: Bác sĩ chỉ định cận lâm sàng (`POST /api/services/assign`), điều dưỡng/KTV cập nhật kết quả xét nghiệm (`PATCH /api/services/result`), lấy danh sách chờ thực hiện (`/pending`).
9. **`inpatient-stay`**: Tiếp nhận điều trị nội trú (`POST /api/inpatient/admit`), phân bổ giường bệnh với kiểm soát chống trùng lặp (`POST /api/inpatient/assign-bed`), chuyển giường bệnh (`POST /api/inpatient/transfer-bed`).
10. **`billing`**: Tính toán tự động chi phí và khấu trừ BHYT theo công thức BR03 (`POST /api/billing/calculate/:examId`), lập hóa đơn (`POST /api/billing/invoices`), Webhook VietQR tự động gạch nợ Idempotent (`POST /api/billing/webhook/vietqr`), xuất biên lai PDF trực tiếp (`GET /api/billing/invoices/:id/pdf`).
11. **`duty-schedule`**: Lập lịch phân công ca trực tuần (`POST /api/duty-schedules`), kiểm tra chống trùng ca trực trong ngày BR05, điểm danh ca trực (`PATCH /attendance`).
12. **`report`**: Dashboard tổng hợp số liệu vận hành bệnh viện (`GET /api/reports/dashboard`): Doanh thu viện phí, chi phí BHYT, công suất sử dụng giường bệnh, tổng số lượt khám.

### 3.4. Triển Khai Các Ràng Buộc Nghiệp Vụ Cốt Lõi (Core Business Rules)
- **BR01 (State Machine)**: Kiểm soát trạng thái lượt khám và giường bệnh (`TRONG` -> `DANG_SU_DUNG` -> `BAO_TRI` -> `TRONG`).
- **BR02 (Chống phân trùng giường)**: Giao dịch phân giường kiểm tra ràng buộc `NgayKetThuc IS NULL` và trạng thái giường vật lý trước khi cấp phát.
- **BR03 (Công thức Viện phí & Khấu trừ BHYT)**:
  $$\text{TongTienGoc} = \text{TienKham} + \text{TienThuoc} + \text{TienDichVu} + \text{TienGiuong}$$
  $$\text{TienBHYTChiTra} = (\text{TienKham} + \text{TienDichVuBHYT}) \times \text{MucHuongBHYT}$$
  $$\text{TienBenhNhanTra} = \text{TongTienGoc} - \text{TienBHYTChiTra}$$
- **BR04 (Trừ tồn kho nguyên tử)**: Khóa và trừ tồn kho tự động trong `prisma.$transaction` khi phát thuốc.
- **BR05 (Chống trùng ca trực)**: Kiểm tra trùng khóa hợp thành `[MaNV, NgayTruc, CaTruc]` và xác thực chứng chỉ hành nghề y tế của bác sĩ.
- **BR06 (Idempotency VietQR Webhook)**: Webhook kiểm tra trạng thái hóa đơn; nếu đã là `DA_THANH_TOAN` sẽ phản hồi 200 OK ngay lập tức, chống hạch toán trùng lặp.

---

## 4. Kiểm Thử & Xác Nhận Đạt Chuẩn (Verification & Testing)

1. **Biên dịch Frontend (Next.js):** Cấu hình chuẩn Tailwind, React Query, Zustand; Route Groups hoạt động ổn định.
2. **Biên dịch Backend (NestJS Build):** Lệnh `npm run build` thực thi hoàn hảo (`Exit code 0`), sinh thư mục `dist/`.
3. **Prisma Client Generate:** Sinh thành công Type-safe Client cho toàn bộ 19 Models và 13 Enums.
4. **Unit Test (Jest):** Viết và chạy thành công bài kiểm thử tính toán viện phí BHYT tại [billing.service.spec.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/billing/billing.service.spec.ts) (2/2 test cases **PASSED**).

---

## 5. Đóng Gói Docker & Khởi Chạy Hệ Thống

Đã thiết lập cụm dịch vụ hoàn chỉnh trong [docker-compose.yml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docker-compose.yml):
- **PostgreSQL 16:** Image `postgres:16-alpine`, lưu trữ bền vững tại volume `postgres_data`.
- **Backend NestJS:** Cổng `3001` (tránh xung đột cổng với Frontend), tài liệu Swagger tại [http://localhost:3001/api/docs](http://localhost:3001/api/docs).
- **Frontend Next.js:** Cổng `3000`, giao diện tại [http://localhost:3000](http://localhost:3000).
