# HỆ THỐNG QUẢN LÝ BỆNH VIỆN (HOSPITAL MANAGEMENT SYSTEM - QLBV)

**Đề tài:** Quản lý bệnh viện bằng mô hình EER và chuẩn hóa  
**Học phần:** Cơ sở dữ liệu nâng cao (Advanced Database Systems)  
**Đơn vị:** Khoa Công nghệ Thông tin – Trường Đại học Sài Gòn (SGU)  
**Giảng viên hướng dẫn:** ThS. Huỳnh Minh Trí

---

## 👥 Thông Tin Nhóm Sinh Viên Thực Hiện

| STT | Họ và Tên | MSSV | Vai trò |
| :---: | :--- | :---: | :--- |
| 1 | **Cao Nguyễn Quốc Khánh** | `3124410149` | **Nhóm trưởng** |
| 2 | Trần Nguyễn Quỳnh Như | `3124410258` | Thành viên |
| 3 | Hoàng Văn Lập | `3124410184` | Thành viên |
| 4 | Nguyễn Đăng Thụy | `3124410352` | Thành viên |
| 5 | Cô Thành Long | `3124410192` | Thành viên |

---

## 📄 Đường Dẫn File Báo Cáo & Tài Liệu Đồ Án

Kính gửi Thầy đường dẫn trực tiếp đến các file báo cáo và tài liệu đặc tả của nhóm trong repository:

- **Báo cáo đồ án chính thức (PDF):** [docs/FileBaoCao/CSDLNC_QLBV.pdf](docs/FileBaoCao/CSDLNC_QLBV.pdf)
- **Báo cáo đồ án chính thức (Word):** [docs/FileBaoCao/CSDLNC_QLBV.docx](docs/FileBaoCao/CSDLNC_QLBV.docx)
- **Báo cáo bản chỉnh sửa & đối chiếu kiểm định (48 trang):**
  - PDF: [docs/FileBaoCao/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.pdf](docs/FileBaoCao/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.pdf)
  - Word: [docs/FileBaoCao/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx](docs/FileBaoCao/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx)
  - Nhật ký đối chiếu 26 tiêu chí (`F01–F26`, `N01–N09`): [docs/FileBaoCao/report_sau_chinh_sua.md](docs/FileBaoCao/report_sau_chinh_sua.md)
- **Bộ sơ đồ thiết kế (EER, Relational Schema, Use Case, Sequence, BCE):** [docs/diagrams/README.md](docs/diagrams/README.md)
- **Đặc tả quy tắc nghiệp vụ & API Contract v2:**
  - [docs/Business_Rules_v2.md](docs/Business_Rules_v2.md)
  - [docs/API_Contract_v2.md](docs/API_Contract_v2.md)
  - [docs/Techstack_QuanLyBenhVien.md](docs/Techstack_QuanLyBenhVien.md)
  - [docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md](docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md)
- **Báo cáo kiểm thử (BE, DB, FE):** [docs/TestReport/](docs/TestReport)

---

## 1. Tổng Quan Kiến Trúc Hệ Thống (Architecture Overview)

Hệ thống được thiết kế theo đặc tả CSDL v2.0 (**18 thực thể / bảng, 103 thuộc tính lưu trữ, 6 thuộc tính dẫn xuất, 20 khóa ngoại `NO ACTION`, Filtered Unique Index, CHECK constraints và Triggers kiểm soát toàn vẹn 3 tầng**) và hiện thực hóa thành ứng dụng Web **Modular Monolith** phân tách Client (Frontend) và Server (Backend):

```text
AdvancedDatabase/
├── frontend/                              # Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
│   ├── src/app/                           # 7 phân hệ UI: (auth), (reception), (clinical), (laboratory), (inpatient), (cashier), (admin)
│   ├── scripts/test-frontend-deep.mjs     # Script kiểm thử tích hợp FE + BE + DB
│   └── package.json
├── backend/                               # NestJS 10, TypeScript, Prisma ORM v6, PostgreSQL 16
│   ├── prisma/
│   │   ├── schema.prisma                  # Lược đồ v2.0: 18 bảng, 20 khóa ngoại (NO ACTION)
│   │   ├── migrations/                    # SQL DDL + CHECK + Filtered Index + 5 VIEWs + Triggers
│   │   └── seed.ts                        # Dữ liệu mẫu chuẩn hóa v2 (7 tài khoản nhân sự & ca mẫu)
│   ├── src/
│   │   ├── common/                        # Guards, Filters, Decorators, Role Enums, Utils
│   │   └── modules/                       # 10 module nghiệp vụ (auth, department-room, staff, patient, examination, prescription, lab-test, inpatient-stay, billing, report) + prisma
│   ├── test/                              # E2E tests (hospital-deep-test.e2e-spec.ts)
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── docs/                                  # Báo cáo đồ án (FileBaoCao/), Diagrams, API Contract, Business Rules, TestReport
├── diagrams/                              # Bản vẽ XML gốc (01_EER_hoan_chinh_v2.xml, 02_Relational_Schema_18Bang_v2.xml)
├── docker-compose.yml                     # Dịch vụ PostgreSQL 16 & Backend NestJS
├── .env.example                           # File mẫu biến môi trường gốc
└── README.md
```

> **Ghi chú đối chiếu với Báo cáo:** Tài liệu báo cáo (`CSDLNC_QLBV.pdf`) đặc tả mô hình EER v2, chuẩn hóa và DDL tham chiếu ở mức thiết kế; phần mã nguồn (`backend/`, `frontend/`) hiện thực trọn vẹn lược đồ **18 bảng – 103 cột – 20 FK** trên **PostgreSQL 16** cùng 5 `VIEW` tính 6 thuộc tính dẫn xuất (`V_NHAN_VIEN`, `V_BENH_NHAN`, `V_DON_THUOC`, `V_LUOT_KHAM_CHI_PHI`, `V_VIEN_PHI`), chỉ mục lọc `UQ_DOT_NOI_TRU_OPEN_MABN`, các ràng buộc `CHECK` và hệ thống `TRIGGER` bảo vệ nghiệp vụ.

---

## 2. Ngăn Xếp Công Nghệ (Technology Stack)

### Database (`/backend/prisma`)
- **DBMS:** PostgreSQL 16 (`postgres:16-alpine`)
- **ORM & Migration:** Prisma ORM `^6.4.1` + Raw SQL Migration (`CHECK`, Filtered Unique Index, `VIEW`, PL/pgSQL `TRIGGER`)

### Backend (`/backend`)
- **Runtime:** Node.js (v20+ / v24 LTS)
- **Framework:** NestJS `^10.4` (TypeScript) + REST API
- **Authentication & RBAC:** Passport JWT (`@nestjs/jwt`), `bcrypt`, Role Guards (`ADMIN`, `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`, `TIEP_NHAN`, `THU_NGAN`)
- **Validation & DTO:** `class-validator`, `class-transformer`
- **PDF Export:** `pdfkit` (Xuất biên lai viện phí, đơn thuốc)
- **API Documentation:** Swagger / OpenAPI tại `/api/docs`
- **Testing:** Jest + Supertest

### Frontend (`/frontend`)
- **Framework:** Next.js `14.2.x` (App Router), React 18, TypeScript
- **Styling & Components:** Tailwind CSS, Radix UI primitives, Lucide Icons
- **State & Data Fetching:** Zustand, TanStack Query (React Query v5), Axios
- **Forms & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts (Biểu đồ doanh thu, công suất giường bệnh)

---

## 3. Hướng Dẫn Các Lệnh Khởi Chạy (DTB – BE – FE)

> **Yêu cầu môi trường:** Đã cài đặt **Node.js (v20+ hoặc v24 LTS)**, **npm**, và **Docker Desktop** (hoặc PostgreSQL 16 cài cục bộ).

### Bước 1: Khởi chạy Database (DTB - PostgreSQL 16)

**Cách A — Dùng Docker Compose (Khuyến nghị):**
```bash
# Tại thư mục gốc AdvancedDatabase/
docker compose up -d postgres-db
```

**Cách B — Dùng Docker run trực tiếp:**
```bash
docker run --name qlbv-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=hospital_db -p 5432:5432 -d postgres:16-alpine
```

- **Thông số kết nối mặc định:** `postgresql://postgres:postgres123@localhost:5432/hospital_db?schema=public`

---

### Bước 2: Cài đặt schema, nạp dữ liệu mẫu & chạy Backend (BE - NestJS)

Mở terminal tại thư mục `backend/`:

```bash
cd backend

# 1. Tạo file .env từ mẫu (nếu chưa có)
# Linux / macOS / Git Bash:
cp .env.example .env
# Windows PowerShell:
# Copy-Item .env.example .env

# 2. Cài đặt thư viện
npm install

# 3. Sinh Prisma Client
npm run prisma:generate

# 4. Chạy migration tạo 18 bảng, 20 FK, CHECK, VIEW & Triggers vào PostgreSQL
npx prisma migrate deploy

# 5. Nạp dữ liệu mẫu (idempotent - có thể chạy lại nhiều lần)
npm run prisma:seed

# 6. Khởi chạy Backend ở chế độ Development (port 3001)
npm run start:dev
```

**Các lệnh khác của Backend & Database:**
```bash
# Chạy Backend ở chế độ Production
npm run build
npm run start:prod

# Mở giao diện xem Database trực quan (Prisma Studio)
npm run prisma:studio

# Chạy Unit Tests & E2E Tests (yêu cầu PostgreSQL đang chạy)
npm test
npm run test:e2e
```

- **Backend API Base URL:** [http://localhost:3001/api](http://localhost:3001/api)
- **Swagger API Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

### Bước 3: Cài đặt & chạy Frontend (FE - Next.js)

Mở một terminal mới tại thư mục `frontend/`:

```bash
cd frontend

# 1. Cài đặt thư viện
npm install

# 2. Khởi chạy Frontend ở chế độ Development (port 3000)
npm run dev
```

*(Mặc định Frontend kết nối tới `http://localhost:3001/api`; nếu đổi port Backend, tạo file `frontend/.env.local` với biến `NEXT_PUBLIC_API_URL=http://localhost:<PORT>/api`.)*

**Các lệnh kiểm tra & chạy Production của Frontend:**
```bash
# Kiểm tra TypeScript & ESLint
npx tsc --noEmit
npm run lint

# Build & chạy Production
npm run build
npm run start

# Chạy kiểm thử toàn diện FE + BE + DB (khi BE :3001 và FE :3000 đang chạy)
npm test
```

- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)

> **Lưu ý về `docker-compose.yml`:** File `docker-compose.yml` hiện cấu hình container cho `postgres-db` và `backend` (có `backend/Dockerfile`), chưa bao gồm `frontend/Dockerfile`. Vì vậy khi dùng Docker, có thể chạy `docker compose up --build -d postgres-db backend` (sau đó chạy `npx prisma migrate deploy` & `npm run prisma:seed` từ `backend/` nếu DB mới tạo) và chạy Frontend cục bộ bằng `cd frontend && npm run dev`.

---

## 4. Tài Khoản Đăng Nhập Mẫu (Seed Credentials)

Mật khẩu mặc định của tất cả tài khoản mẫu là `123456` (có thể đăng nhập bằng `MaNV` hoặc `CCCD` tại trang `/login`):

| Mã NV | Vai trò (RBAC) | Họ tên / Phân loại | Phạm vi chức năng | Mật khẩu |
| :--- | :--- | :--- | :--- | :---: |
| `ADMIN01` | `ADMIN` | Quản Trị Viên Hệ Thống *(Partial)* | Quản trị Khoa, Phòng, Giường bệnh, Nhân sự, Danh mục Thuốc & Xét nghiệm | `123456` |
| `BS01` | `BAC_SI` | BS. CKI Trần Văn Nam *(Khoa Nội `K01`)* | Khám bệnh, kê đơn thuốc, chỉ định xét nghiệm, tạo đợt nội trú | `123456` |
| `BS02` | `BAC_SI` | ThS. BS Nguyễn Thị Mai *(Khoa Ngoại `K02`)* | Khám bệnh, kê đơn thuốc, chỉ định xét nghiệm, tạo đợt nội trú | `123456` |
| `DD01` | `DIEU_DUONG` | CN. Lê Thị Lan *(Khoa Nội `K01`)* | Điều dưỡng nội trú, phân giường / chuyển giường, xuất viện | `123456` |
| `KTV01` | `KY_THUAT_VIEN` | CN. Võ Minh Tuấn *(Khoa Nội `K01`)* | Tiếp nhận mẫu xét nghiệm, thực hiện & trả kết quả cận lâm sàng | `123456` |
| `TT01` | `TIEP_NHAN` | Nguyễn Ngọc Ánh *(Partial)* | Tiếp đón bệnh nhân, quản lý thẻ BHYT, tạo lượt khám | `123456` |
| `NV_TN_01` | `THU_NGAN` | Phạm Minh Hoàng *(Partial)* | Lập hóa đơn viện phí, áp dụng BHYT, chốt thanh toán & in PDF | `123456` |
