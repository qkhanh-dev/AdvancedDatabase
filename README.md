# HỆ THỐNG QUẢN LÝ BỆNH VIỆN (HOSPITAL MANAGEMENT SYSTEM - QLBV)

Học phần: **Cơ sở dữ liệu nâng cao (Advanced Database Systems)**  
Khoa Công nghệ Thông tin – Trường Đại học Sài Gòn (SGU)  
**Nhóm phát triển:** Nhóm 5 (Trưởng nhóm: Cao Nguyễn Quốc Khánh)

---

## 1. Tổng Quan Kiến Trúc Hệ Thống (Architecture Overview)

Hệ thống được xây dựng theo mô hình **Modular Monolith** phân tách rõ ràng tầng Client (Frontend) và Server (Backend):

```text
AdvancedDatabase/
├── frontend/                              # Next.js 14+ App Router, React 18, TypeScript, Tailwind CSS, Lucide
│   ├── src/app/                           # Phân hệ: (auth), (reception), (clinical), (inpatient), (cashier),...
│   └── package.json
├── backend/                               # NestJS 10+, TypeScript, Prisma ORM, PostgreSQL 16
│   ├── prisma/                            # Prisma Schema (19 bảng BCNF + 13 Enums) & Seed script
│   ├── src/
│   │   ├── common/                        # Guards, Filters, Interceptors, Decorators, Roles
│   │   └── modules/                       # 10 Phân hệ y tế (auth, patient, examination, billing,...)
│   ├── Dockerfile
│   └── package.json
├── docs/                                  # Tài liệu phân tích, đặc tả EER, Báo cáo rà soát & Techstack v2.0
├── docker-compose.yml                     # Cụm container: postgres:16-alpine, backend, frontend
├── .env.example                           # File mẫu biến môi trường chuẩn
└── README.md
```

---

## 2. Ngăn Xếp Công Nghệ (Technology Stack)

### Backend (`/backend`)
- **Runtime:** Node.js v24 LTS
- **Framework:** NestJS 10+ (TypeScript) + REST API
- **Database & ORM:** PostgreSQL 16 + Prisma ORM (v6.x / v7.x)
- **Authentication & RBAC:** Passport JWT (`@nestjs/jwt`), `bcrypt`, Role Guards (`BAC_SI`, `DIEU_DUONG`, `HANH_CHINH`, `THU_NGAN`, `ADMIN`)
- **Validation & DTO:** `class-validator`, `class-transformer`
- **PDF Export:** `pdfkit` (In biên lai viện phí, đơn thuốc)
- **API Documentation:** Swagger / OpenAPI tại `/api/docs`
- **Testing:** Jest + Supertest

### Frontend (`/frontend`)
- **Framework:** Next.js 14+ (App Router), React 18, TypeScript
- **Styling & Components:** Tailwind CSS, Radix UI primitives, Lucide Icons
- **State & Data Fetching:** Zustand, TanStack Query (React Query v5)
- **Forms & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts (Biểu đồ doanh thu, công suất giường bệnh)

---

## 3. Hướng Dẫn Khởi Chạy (Quick Start)

### Cách 1: Khởi chạy toàn bộ bằng Docker Compose (Khuyến nghị)

```bash
# 1. Khởi chạy Database Postgres 16, Backend NestJS và Frontend Next.js
docker compose up --build -d

# 2. Xem logs dịch vụ
docker compose logs -f
```

- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)
- **Swagger API Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **PostgreSQL Database:** `localhost:5432` (`postgres` / `postgres123` / `hospital_db`)

---

### Cách 2: Khởi chạy từng phần cục bộ (Local Development)

#### 1. Khởi động Cơ sở dữ liệu PostgreSQL 16

```bash
docker run --name qlbv-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=hospital_db -p 5432:5432 -d postgres:16-alpine
```

#### 2. Cài đặt và chạy Backend (`backend/`)

```bash
cd backend

# Cài đặt thư viện
npm install

# Sinh Prisma Client
npm run prisma:generate

# Đẩy schema vào database & nạp dữ liệu mẫu
npm run prisma:migrate
npm run prisma:seed

# Chạy Backend (Chế độ Watch dev)
npm run start:dev

# Chạy Unit Tests
npm test
```

#### 3. Cài đặt và chạy Frontend (`frontend/`)

```bash
cd frontend

# Cài đặt thư viện
npm install

# Chạy Frontend
npm run dev
```

---

## 4. Tài Khoản Đăng Nhập Mẫu (Seed Credentials)

| Mã NV | Vai trò | Chuyên môn / Bộ phận | Mật khẩu mặc định |
| :--- | :--- | :--- | :---: |
| `BS01` | `BAC_SI` | Trưởng Khoa Nội tổng hợp | `123456` |
| `BS02` | `BAC_SI` | Trưởng Khoa Ngoại tổng hợp | `123456` |
| `DD01` | `DIEU_DUONG` | Điều dưỡng viên Khoa Nội | `123456` |
| `NV_TN_01` | `HANH_CHINH` / `THU_NGAN` | Thu ngân viện phí & Tiếp đón | `123456` |

---

## 5. Quy Chuẩn & Tài Liệu Kỹ Thuật

- **Techstack chi tiết:** [docs/Techstack_QuanLyBenhVien.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Techstack_QuanLyBenhVien.md)
- **Báo cáo rà soát và sửa lỗi CSDL:** [docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md)
