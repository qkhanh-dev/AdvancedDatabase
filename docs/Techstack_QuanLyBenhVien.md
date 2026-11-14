# TECHSTACK DOCUMENTATION
## Hệ Thống Quản Lý Bệnh Viện (Hospital Management System – QLBV)
### Technology Stack, Architecture & Engineering Standards (v2.0)
**Phiên bản:** v2.0 | **Ngày lập:** 14/11/2026 | **Trạng thái:** Hoàn thành  
**Học phần:** Cơ sở dữ liệu nâng cao (Advanced Database Systems) – Khoa CNTT, Đại học Sài Gòn (SGU)  
**Nhóm phát triển:** Nhóm 5 thành viên (Trưởng nhóm: Cao Nguyễn Quốc Khánh)

---

## 1. Mục Đích & Phạm Vi Dự Án

Tài liệu này quy định tiêu chuẩn kỹ thuật thống nhất về **Ngăn xếp công nghệ (Technology Stack)**, **Kiến trúc hệ thống ánh xạ từ mô hình Hướng đối tượng BCE (Boundary – Control – Entity)**, **Lược đồ cơ sở dữ liệu quan hệ (19 bảng chuẩn hóa BCNF & hệ thống Enums)**, **Danh mục RESTful API y tế**, và **Quy tắc kỹ thuật / Quy trình phối hợp** cho nhóm phát triển dự án *Hệ thống Quản lý Bệnh viện (QLBV)*.

Hệ thống được thiết kế theo mô hình **Modular Monolith** phân tách rõ ràng tầng Client (Frontend) và Server (Backend), bám sát 100% hồ sơ phân tích nghiệp vụ bệnh viện, đặc tả EER và 25 ràng buộc toàn vẹn tham chiếu đã được kiểm toán học thuật. Kiến trúc đảm bảo tính toàn vẹn dữ liệu lâm sàng y tế, an toàn giao dịch tài chính viện phí (ACID), và khả năng mở rộng linh hoạt.

---

## 2. Mức Độ Áp Dụng Công Nghệ (Adoption Levels)

| Mức áp dụng | Ý nghĩa & Quy tắc sử dụng trong Dự án QLBV |
| :--- | :--- |
| **REQUIRED** | Công nghệ nền tảng bắt buộc theo định hướng chuẩn kỹ thuật thống nhất (**Node.js 24 LTS, Prisma 7, Next.js 14+ App Router, NestJS 10, TypeScript, PostgreSQL 16**). |
| **CORE** | Thư viện, framework và công cụ tiêu chuẩn được tích hợp trực tiếp trong mã nguồn để giải quyết các phân hệ nghiệp vụ y tế. |
| **OPTIONAL** | Thư viện bổ trợ trải nghiệm người dùng nâng cao (Dark mode y tế, âm thanh cảnh báo hàng đợi khám); chỉ triển khai khi hoàn tất luồng lõi. |
| **MOCK** | Dịch vụ giả lập nội bộ phục vụ demo (Cổng thanh toán VietQR Viện phí, Giả lập máy cấp số thứ tự / đọc CCCD chip) không phát sinh chi phí thực tế. |
| **FUTURE** | Định hướng mở rộng môi trường Cloud Production (AWS/GCP, kết nối trục liên thông Bảo hiểm Y tế Xã hội Quốc gia BHXH, chuẩn HL7/FHIR). |

---

## 3. Danh Mục Techstack Chi Tiết

| Thành phần | Công nghệ / Lựa chọn | Mức | Ghi chú & Vai trò trong Hệ thống QLBV |
| :--- | :--- | :---: | :--- |
| **Runtime Environment** | **Node.js (v24 LTS)** + npm workspaces | **REQUIRED** | Môi trường thực thi đồng nhất cho cả Frontend Next.js và Backend NestJS. |
| **Frontend Framework** | **Next.js 14+ (App Router)** + **React 18** + **TypeScript** | **REQUIRED** | Hiện thực hóa toàn bộ tầng `<<boundary>>`: Tiếp đón, Khám bệnh, Cận lâm sàng, Nội trú, Dược, Thu ngân viện phí, Dashboard quản trị. |
| **UI Styling & Components** | **Tailwind CSS** + **shadcn/ui (Radix UI)** + **Lucide Icons** | **CORE** | Thiết kế UI y tế chuyên nghiệp, bảng điều khiển trạng thái buồng bệnh/giường bệnh trực quan theo màu sắc (Xanh: Trống, Đỏ: Đang nằm, Vàng: Chờ bảo trì). |
| **Form & Client Validation** | **React Hook Form** + **Zod** | **CORE** | Xác thực dữ liệu nghiêm ngặt: Mã định danh y tế, CCCD (12 số), mã thẻ BHYT, chỉ số sinh hiệu (Huyết áp, Mạch, Thân nhiệt), liều lượng đơn thuốc. |
| **Client State & Fetching** | **Zustand** + **TanStack Query (React Query v5)** | **CORE** | Zustand quản lý phiên làm việc ca trực, hàng đợi khám; TanStack Query đồng bộ trạng thái giường bệnh và kết quả cận lâm sàng theo thời gian thực (Polling/Invalidation). |
| **Charts & Analytics UI** | **Recharts** | **CORE** | Biểu đồ doanh thu viện phí, cơ cấu chi phí BHYT vs Tự chi trả, công suất sử dụng giường bệnh nội trú, biểu đồ tần suất bệnh tật. |
| **Backend Framework** | **NestJS 10+** (TypeScript) + REST/JSON | **REQUIRED** | Hiện thực hóa tầng `<<control>>`: Điều phối nghiệp vụ khám bệnh, phân giường, kê đơn trừ kho, tính viện phí và phân ca trực. |
| **DTO & Input Validation** | **class-validator** + **class-transformer** | **CORE** | Chuẩn hóa DTO dữ liệu vào/ra cho 100% REST API, ngăn chặn dữ liệu bẩn và tấn công Payload Injection. |
| **Authentication & RBAC** | **Passport JWT** (`@nestjs/jwt`) + **bcrypt** + Guards | **CORE** | Quản lý phiên xác thực Token, phân quyền nghiêm ngặt theo 4 nhóm vai trò: `ADMIN`, `BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH` / `THU_NGAN`. |
| **Database (RDBMS)** | **PostgreSQL 16** | **REQUIRED** | Hệ CSDL quan hệ lưu trữ bền vững 19 bảng thực thể BCNF; hỗ trợ mạnh mẽ ACID Transaction, Row Locking (`SELECT ... FOR UPDATE`), Filtered Indexes và Check Constraints y tế. |
| **ORM & Database Migration** | **Prisma ORM (v7.x)** (`@prisma/client`, `prisma migrate`) | **CORE** | Ánh xạ trực tiếp 19 bảng thực thể sang TypeScript Type-safe Client; tự động hóa migration đồng bộ giữa các thành viên. |
| **PDF Medical Export** | **PDFKit** (hoặc Puppeteer HTML-to-PDF) | **CORE** | Sinh phiếu khám bệnh, toa thuốc có chữ ký số bác sĩ, phiếu chỉ định cận lâm sàng, và hóa đơn thanh toán viện phí xuất bản PDF chuẩn in nhiệt/A4. |
| **Payment & QR VietQR** | **Mock PaymentService** + **VietQR API** + Webhook HMAC | **MOCK** | Mô phỏng cổng thu viện phí không tiền mặt: sinh mã QR động chứa số tiền viện phí và `MaHD`, nhận webhook xác thực chữ ký HMAC để gạch nợ tự động. |
| **API Documentation** | **Swagger / OpenAPI** (`@nestjs/swagger`) | **CORE** | Tự động sinh tài liệu Swagger trực quan tại `/api/docs`, hỗ trợ chạy thử nghiệm API trực tiếp. |
| **Containerization** | **Docker** + **Docker Compose** | **CORE** | Đóng gói đồng bộ cụm dịch vụ: `postgres-db`, `nestjs-backend`, `nextjs-frontend` phục vụ chạy thử nghiệm cục bộ và nghiệm thu đồ án. |
| **Version Control & CI** | **Git** + **GitHub** + **GitHub Actions** | **CORE** | Quản trị mã nguồn, tự động kiểm tra cú pháp, Type check, Linting và chạy Unit Test trước khi merge Pull Request. |
| **Project & Task Management** | **GitHub Projects / Jira** | **CORE** | Quản lý Product Backlog, phân rã công việc kỹ thuật theo tuần (Tuần 1 - Tuần 4) cho 5 thành viên. |
| **Testing Framework** | **Jest** + **Supertest** + **Postman** | **CORE** | Unit test thuật toán tính viện phí BHYT, kiểm thử toàn vẹn giao dịch phân giường và trừ kho thuốc, Integration test API. |
| **Cloud Deployment** | **Vercel** (Frontend) + **Render / Railway** (Backend & DB) | **FUTURE** | Phương án triển khai bản Cloud Demo phục vụ hội đồng chấm đồ án nếu có yêu cầu trực tuyến. |

---

## 4. Phiên Bản Baseline & Chính Sách Cấu Hình

Để đảm bảo 100% tính tương thích giữa 5 thành viên trong nhóm, toàn bộ dự án tuân thủ nghiêm ngặt bộ thông số baseline:

| Hạng mục | Quy tắc Baseline & Tiêu chuẩn kỹ thuật |
| :--- | :--- |
| **Node.js & Package Manager** | Cố định **Node.js v24.x LTS**; sử dụng duy nhất trình quản lý gói `npm` (kèm file khóa `package-lock.json`). Cấu hình sẵn tệp `.nvmrc` chứa `v24`. |
| **Frontend Dependencies** | Next.js `^14.2.x` (App Router), React `^18.3.x`, TypeScript `^5.x`. Không tự ý cài đặt thư viện ngoài danh mục khi chưa có sự phê duyệt của Tech Lead. |
| **Backend Dependencies** | NestJS `^10.x`, `@nestjs/jwt ^10.x`, `class-validator ^0.14.x`, `prisma ^7.x` (`@prisma/client ^7.x`). Kích hoạt chế độ `strict: true` trong `tsconfig.json`. |
| **PostgreSQL Database** | Chạy image cố định **`postgres:16-alpine`** trong `docker-compose.yml` với volume gắn ngoài `postgres_data` để bảo toàn dữ liệu mẫu bệnh viện. |
| **Biến môi trường (.env)** | Cung cấp file mẫu `.env.example` với đầy đủ các key cấu hình chuẩn (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `FRONTEND_URL`, `VIETQR_API_KEY`). **Tuyệt đối không commit tệp `.env` chứa thông tin thực lên GitHub**. |

---

## 5. Kiến Trúc Hệ Thống & Ánh Xạ Mô Hình BCE (Boundary – Control – Entity)

Dự án áp dụng kiến trúc **Modular Monolith** kết hợp phân tách Client – Server hiện đại. Mô hình thiết kế hướng đối tượng BCE được ánh xạ chuẩn xác 1-1 sang cấu trúc thực thi:

```
[Actor: Bệnh nhân / Bác sĩ / Điều dưỡng / Thu ngân / Quản trị]
                           │ (HTTPS)
                           ▼
     ┌──────────────────────────────────────────────┐
     │  <<boundary>> Giao diện Next.js App Router   │
     │  - Tiếp đón / Khám / Dược / Nội trú / Viện phí│
     └──────────────────────┬───────────────────────┘
                            │ (RESTful JSON + JWT)
                            ▼
     ┌──────────────────────────────────────────────┐
     │  <<control>> Tầng điều phối NestJS Backend   │
     │  - Controllers, Services, Guards, Pipes       │
     └──────────────────────┬───────────────────────┘
                            │ (Prisma ORM Client)
                            ▼
     ┌──────────────────────────────────────────────┐
     │  <<entity>> Hệ CSDL Quan hệ PostgreSQL 16   │
     │  - 19 Bảng BCNF, 25 Foreign Keys, Enums     │
     └──────────────────────────────────────────────┘
```

### 5.1. Ánh Xạ Chi Tiết 3 Tầng Kiến Trúc BCE

#### A. Tầng Giao Diện `<<boundary>>` (Next.js App Router)
Tổ chức giao diện theo các Route Groups tách biệt tương ứng với phân quyền nghiệp vụ:
- `src/app/(reception)/*`: Tiếp đón bệnh nhân, kiểm tra CCCD/BHYT, tạo hồ sơ mới, cấp số thứ tự vào phòng khám.
- `src/app/(clinical)/*`: Dành cho Bác sĩ – Tiếp nhận danh sách chờ khám, nhập chỉ số sinh hiệu, ghi nhận triệu chứng, chẩn đoán ICD, kê đơn thuốc và chỉ định xét nghiệm/CĐHA.
- `src/app/(inpatient)/*`: Dành cho Khoa Nội trú – Sơ đồ buồng bệnh/giường bệnh tương tác trực quan theo màu, nhập viện nội trú, phân giường, chuyển giường.
- `src/app/(laboratory)/*`: Dành cho Điều dưỡng/KTV Cận lâm sàng – Danh sách chỉ định chờ thực hiện, cập nhật kết quả xét nghiệm và hình ảnh.
- `src/app/(pharmacy)/*`: Dành cho Dược sĩ – Quản lý kho dược phẩm, duyệt đơn thuốc và xác nhận cấp phát thuốc.
- `src/app/(cashier)/*`: Dành cho Thu ngân – Quyết toán viện phí tổng hợp (khám, thuốc, dịch vụ, giường), khấu trừ BHYT, hiển thị mã VietQR thanh toán và in biên lai PDF.
- `src/app/(admin)/*`: Quản trị danh mục Khoa, Phòng chức năng, Danh mục Thuốc, Dịch vụ kỹ thuật, Phân lịch trực y bác sĩ, Dashboard phân tích số liệu.

#### B. Tầng Điều Phối Nghiệp Vụ `<<control>>` (NestJS Modules)
Mỗi nghiệp vụ lõi trong bệnh viện được đóng gói thành một Module độc lập gồm cặp `Controller` và `Service`:
- `AuthModule`: Xác thực người dùng, băm mật khẩu bcrypt, cấp phát JWT Token và phân quyền theo Vai trò/Chức danh y tế.
- `DepartmentRoomModule`: Quản lý danh mục Khoa, Phòng khám/buồng bệnh và Giường bệnh.
- `StaffModule`: Quản lý thông tin cán bộ y tế (Bác sĩ, Điều dưỡng, Nhân viên hành chính), trình độ chuyên môn, chứng chỉ hành nghề.
- `PatientModule`: Quản lý hồ sơ bệnh nhân, phân loại bệnh nhân ngoại trú (`BN_NGOAI_TRU`) và nội trú (`BN_NOI_TRU`).
- `ExaminationModule`: Điều phối quy trình lượt khám (`LUOT_KHAM`), ghi nhận chẩn đoán và hướng xử trí y khoa.
- `PrescriptionModule`: Xử lý kê đơn thuốc (`DON_THUOC`, `CT_DON_THUOC`), kiểm tra số lượng tồn kho và thực hiện trừ kho tự động nguyên tử.
- `ClinicalServiceModule`: Quản lý bảng giá dịch vụ kỹ thuật (`DICH_VU`), chỉ định và cập nhật kết quả cận lâm sàng (`SU_DUNG_DV`).
- `InpatientStayModule`: Quản lý chu trình điều trị nội trú, phân bổ giường bệnh (`PHAN_GIUONG`), chống xung đột giường nằm.
- `BillingModule`: Tính toán tổng chi phí viện phí, bóc tách tỷ lệ chi trả BHYT (80%, 95%, 100%), tạo hóa đơn (`HOA_DON`), xuất hóa đơn PDF và xử lý Webhook thanh toán VietQR.
- `DutyScheduleModule`: Lập lịch phân công ca trực (`LICH_TRUC`), kiểm tra chống trùng ca trực y bác sĩ và chấm công.
- `ReportModule`: Tổng hợp thống kê doanh thu viện phí, công suất sử dụng giường bệnh nội trú và báo cáo mô hình bệnh tật.

#### C. Tầng Thực Thể & Lưu Trữ `<<entity>>` (Prisma ORM + PostgreSQL 16)
Bao gồm **19 lớp thực thể** đã được chuẩn hóa BCNF và tối ưu hóa khóa ngoại trong CSDL, được định nghĩa trong `schema.prisma`. Toàn bộ các quy tắc toàn vẹn, tính toán viện phí và giao dịch ACID phức tạp được bảo đảm thông qua Prisma Client kết hợp PostgreSQL Row-level Locks.

---

## 6. Thiết Kế Cơ Sở Dữ Liệu & Danh Mục RESTful API

### 6.1. Danh Mục 19 Thực Thể & Các Kiểu Liệt Kê Chuẩn Hóa

Hệ thống quản lý 19 bảng thực thể được nhóm theo 6 phân hệ cốt lõi:

| STT | Tên Bảng (Prisma Model) | Vai trò nghiệp vụ trong Bệnh viện | Quan hệ chính & Khóa ngoại |
| :---: | :--- | :--- | :--- |
| **01** | `Khoa` | Danh mục các chuyên khoa y tế và phòng ban | 1 – N với `Phong`, 1 – N với `NhanVien`, 1 – 1 Trưởng khoa (`BacSi`) |
| **02** | `Phong` | Phòng khám bệnh, buồng bệnh nội trú, phòng kỹ thuật | N – 1 với `Khoa`, 1 – N với `GiuongBenh`, 1 – N với `LuotKham` |
| **03** | `GiuongBenh` | Giường bệnh nội trú trong các buồng bệnh | N – 1 với `Phong`, 1 – N với `PhanGiuong` |
| **04** | `NhanVien` | Bảng cha (Superclass) lưu thông tin hành chính nhân sự | 1 – 1 kế thừa sang `BacSi`, `DieuDuong`, `NvHanhChinh` |
| **05** | `BacSi` | Subclass bác sĩ điều trị, chuyên khoa, chứng chỉ CCHN | Kế thừa `NhanVien`, 1 – N với `LuotKham`, 1 – N phụ trách `BnNoiTru` |
| **06** | `DieuDuong` | Subclass điều dưỡng viên, phụ cấp trực, CCHN | Kế thừa `NhanVien`, 1 – N ký thực hiện cận lâm sàng |
| **07** | `NvHanhChinh` | Subclass nhân viên tiếp đón, thu ngân viện phí | Kế thừa `NhanVien`, 1 – N lập `HoaDon` |
| **08** | `BenhNhan` | Bảng cha (Superclass) quản lý hồ sơ nhân khẩu, BHYT | 1 – 1 kế thừa sang `BnNgoaiTru`, `BnNoiTru`; 1 – N với `LuotKham` |
| **09** | `BnNgoaiTru` | Subclass hồ sơ bệnh nhân khám ngoại trú, sổ y bạ | Kế thừa `BenhNhan` (ON DELETE CASCADE) |
| **10** | `BnNoiTru` | Subclass bệnh nhân điều trị nội trú lưu viện | Kế thừa `BenhNhan`, N – 1 Bác sĩ theo dõi, 1 – N với `PhanGiuong` |
| **11** | `LuotKham` | Nhật ký mỗi lần khám bệnh, sinh hiệu, chẩn đoán | N – 1 với `BenhNhan`, `BacSi`, `Phong`; 1 – 1 với `DonThuoc`, `HoaDon` |
| **12** | `DonThuoc` | Đơn thuốc ngoại trú/nội trú gắn với lượt khám | 1 – 1 với `LuotKham`, 1 – N với `CtDonThuoc` |
| **13** | `Thuoc` | Danh mục dược phẩm, hoạt chất, số lượng tồn kho | 1 – N với `CtDonThuoc` |
| **14** | `CtDonThuoc` | Chi tiết thuốc trong toa: số lượng, liều dùng, đơn giá bán | N – 1 với `DonThuoc`, N – 1 với `Thuoc` |
| **15** | `DichVu` | Danh mục kỹ thuật y tế (Xét nghiệm, CĐHA, Thủ thuật) | 1 – N với `SuDungDv` |
| **16** | `SuDungDv` | Chi định và kết quả cận lâm sàng của lượt khám | N – 1 với `LuotKham`, `DichVu`, `DieuDuong` (KTV) |
| **17** | `PhanGiuong` | Lịch sử phân bổ và lưu trú giường bệnh của BN nội trú | N – 1 với `BnNoiTru`, N – 1 với `GiuongBenh` |
| **18** | `HoaDon` | Hóa đơn quyết toán viện phí, chiết trừ BHYT | 1 – 1 với `LuotKham`, N – 1 Thu ngân (`NvHanhChinh`) |
| **19** | `LichTruc` | Lịch phân công ca trực chuyên môn bệnh viện | N – 1 với `NhanVien`, N – 1 với `Phong` |

**Hệ thống Enum chuẩn hóa:**
1. `LoaiPhongEnum`: `{ KHAM, NOI_TRU, CAP_CUU, XET_NGHIEM }`
2. `LoaiGiuongEnum`: `{ TIEU_CHUAN, VIP, CAP_CUU, HOI_SUC }`
3. `TrangThaiGiuongEnum`: `{ TRONG, DANG_SU_DUNG, BAO_TRI }`
4. `LoaiNVEnum`: `{ BAC_SI, DIEU_DUONG, HANH_CHINH }`
5. `GioiTinhEnum`: `{ NAM, NU, CHUA_RO }`
6. `NhomMauEnum`: `{ A, B, AB, O, CHUA_RO }`
7. `HuongXuTriEnum`: `{ KE_DON_VE, NHAP_VIEN, CHUYEN_VIEN }`
8. `TrangThaiPhatThuocEnum`: `{ CHUA_PHAT, DA_PHAT, DA_HUY }`
9. `LoaiDichVuEnum`: `{ XET_NGHIEM, CDHA, THU_THUAT, KHAM }`
10. `PhuongThucTTEnum`: `{ TIEN_MAT, CHUYEN_KHOAN, THE }`
11. `TrangThaiTTEnum`: `{ CHUA_THANH_TOAN, DA_THANH_TOAN }`
12. `CaTrucEnum`: `{ SANG, CHIEU, TOI, DEM }`
13. `TrangThaiDiemDanhEnum`: `{ CHUA_DIEM_DANH, CO_MAT, VANG_MAT }`

---

### 6.2. Danh Mục RESTful API Trọng Tâm Theo Phân Hệ Nghiệp Vụ

| Phương thức & Endpoint | Phân hệ / Nghiệp vụ | Mô tả chức năng kỹ thuật |
| :--- | :--- | :--- |
| **POST /api/auth/login** | Xác thực hệ thống | Đăng nhập tài khoản cán bộ y tế, cấp phát JWT Payload kèm thông tin quyền hạn. |
| **GET /api/departments** | Cơ sở vật chất | Danh sách chuyên khoa y tế kèm thông tin Trưởng khoa. |
| **GET /api/rooms/available** | Cơ sở vật chất | Tra cứu danh sách buồng bệnh/phòng khám còn chỗ trống theo chuyên khoa. |
| **GET /api/beds/map** | Cơ sở vật chất | Lấy sơ đồ trạng thái toàn bộ giường bệnh nội trú (`TRONG`, `DANG_SU_DUNG`, `BAO_TRI`). |
| **POST /api/patients/reception** | Tiếp đón người bệnh | Tiếp nhận hồ sơ bệnh nhân, kiểm tra CCCD/BHYT, tạo số hồ sơ khám ngoại trú. |
| **GET /api/patients/lookup** | Tiếp đón người bệnh | Tra cứu lịch sử khám chữa bệnh theo `MaBN`, `CCCD` hoặc `SoBHYT`. |
| **POST /api/examinations** | Khám bệnh | Bác sĩ khởi tạo lượt khám, ghi nhận sinh hiệu (Huyết áp, Mạch, Nhiệt độ), chẩn đoán sơ bộ. |
| **PATCH /api/examinations/:id/diagnose** | Khám bệnh | Cập nhật chẩn đoán xác định và lựa chọn hướng xử trí (`KE_DON_VE`, `NHAP_VIEN`). |
| **POST /api/prescriptions** | Dược & Kê đơn | Bác sĩ kê đơn thuốc; hệ thống kiểm tra tồn kho và tạm giữ số lượng thuốc. |
| **PATCH /api/prescriptions/:id/dispense** | Dược & Cấp phát | Dược sĩ xác nhận phát thuốc (`DA_PHAT`), hệ thống trừ trực tiếp tồn kho vật lý. |
| **POST /api/services/assign** | Cận lâm sàng | Bác sĩ chỉ định các dịch vụ kỹ thuật/xét nghiệm cho lượt khám. |
| **PATCH /api/services/result** | Cận lâm sàng | Điều dưỡng/KTV cập nhật kết quả xét nghiệm (`KetQuaCLS`) và ghi nhận thời gian thực hiện. |
| **POST /api/inpatient/admit** | Nội trú | Chuyển bệnh nhân vào điều trị nội trú, lập hồ sơ bệnh án nội trú `BN_NOI_TRU`. |
| **POST /api/inpatient/assign-bed** | Nội trú | Phân bổ giường bệnh cho bệnh nhân (sử dụng khóa dòng chống trùng lặp giường). |
| **POST /api/inpatient/transfer-bed** | Nội trú | Chuyển bệnh nhân sang giường bệnh mới, chốt thời gian kết thúc giường cũ. |
| **POST /api/billing/calculate/:examId** | Thu ngân viện phí | Tổng hợp chi phí khám, thuốc, dịch vụ CLS, tiền giường và bóc tách BHYT chi trả. |
| **POST /api/billing/invoices** | Thu ngân viện phí | Khởi tạo hóa đơn viện phí (`HOA_DON`) ở trạng thái `CHUA_THANH_TOAN`. |
| **POST /api/billing/webhook/vietqr** | Cổng thanh toán | Webhook nhận thông báo thanh toán thành công qua QR, chuyển trạng thái `DA_THANH_TOAN`. |
| **GET /api/billing/invoices/:id/pdf** | In ấn chứng từ | Xuất biên lai quyết toán viện phí định dạng PDF trả về dạng `application/pdf`. |
| **CRUD /api/duty-schedules** | Quản lý nhân sự | Lập lịch trực tuần cho bác sĩ, điều dưỡng; kiểm tra chống trùng ca trực trong cùng khung giờ. |
| **GET /api/reports/dashboard** | Báo cáo thống kê | Thống kê doanh thu viện phí, công suất sử dụng giường bệnh, tần suất bệnh theo kỳ. |

---

## 7. Chuẩn Xử Lý Các Quy Tắc Nghiệp Vụ Cốt Lõi (Core Business Rules)

### 7.1. BR01: Kiểm Soát Máy Trạng Thái Lâm Sàng (State Machine Enforcement)
Toàn bộ chu trình khám chữa bệnh phải tuân thủ nghiêm ngặt máy trạng thái chuyển tiếp qua Service Guards:
- **Lượt khám (`LUOT_KHAM`)**: Tiếp đón ➔ Đang khám lâm sàng ➔ Đang thực hiện Cận lâm sàng (nếu có chỉ định) ➔ Hoàn tất chẩn đoán ➔ Kê đơn / Nhập viện ➔ Quyết toán viện phí.
- **Giường bệnh (`GIUONG_BENH`)**: Chỉ giường ở trạng thái `TRONG` mới được phép phân bổ cho bệnh nhân nội trú. Khi nhận giường, trạng thái chuyển sang `DANG_SU_DUNG`. Khi bệnh nhân trả giường hoặc chuyển buồng, trạng thái chuyển sang `BAO_TRI` (hoặc dọn dẹp) trước khi mở lại `TRONG`.
- **Hóa đơn (`HOA_DON`)**: Chỉ lượt khám đã hoàn tất chỉ định y khoa mới được lập hóa đơn; sau khi gạch nợ thành công (`DA_THANH_TOAN`), hệ thống mới cho phép in biên lai hoàn tất và xuất viện.

### 7.2. BR02: Thuật Toán Chống Trùng Phân Giường Nội Trú (Anti-Double-Bed Allocation)
- Một giường bệnh chỉ có thể phân bổ cho một bệnh nhân tại một thời điểm.
- Khi tiếp nhận yêu cầu phân giường tại endpoint `/api/inpatient/assign-bed`, Backend NestJS thực thi trong một `prisma.$transaction` với mức cô lập **Serializable** hoặc khóa dòng:
  ```sql
  SELECT * FROM "GiuongBenh" WHERE "MaGiuong" = $1 FOR UPDATE;
  ```
- Kiểm tra điều kiện không tồn tại bất kỳ bản ghi `PHAN_GIUONG` nào thỏa mãn: `MaGiuong = $1 AND NgayKetThuc IS NULL`. Nếu thỏa mãn, tạo bản ghi `PHAN_GIUONG` mới và cập nhật `TrangThaiGiuong = 'DANG_SU_DUNG'`.

### 7.3. BR03: Công Thức Quyết Toán Viện Phí & Khấu Trừ Bảo Hiểm Y Tế (BHYT)
Khi lập hóa đơn viện phí tại `BillingService`, chi phí được tính toán tự động:
1. **Tổng tiền gốc (`TongTienGoc`)**:
   $$\text{TongTienGoc} = \text{TienKham} + \sum (\text{DonGiaBan} \times \text{SoLuong}) + \sum (\text{DonGiaDV} \times \text{SoLuong}) + \sum (\text{GiaGiuongNgay} \times \text{SoNgayLuuTru})$$
2. **Chi phí BHYT chi trả (`TienBHYTChiTra`)**:
   - Dựa trên danh mục thuốc và dịch vụ nằm trong danh mục bảo hiểm (`ThuocBHYTChiTra = true`).
   - Nhân với mức hưởng bảo hiểm của người bệnh (`MucHuongBHYT` $\in \{80\%, 95\%, 100\%\}$ ghi trên thẻ BHYT). Nếu không có BHYT, mức hưởng bằng 0%.
3. **Tiền bệnh nhân phải trả (`TienBenhNhanTra`)**:
   $$\text{TienBenhNhanTra} = \text{TongTienGoc} - \text{TienBHYTChiTra}$$
   *(Thuộc tính này được cấu hình dưới dạng Calculated Column hoặc tính toán nhất quán qua Domain Service trước khi lưu trữ).*

### 7.4. BR04: Ràng Buộc Kê Đơn Thuốc & Trừ Tồn Kho Nguyên Tử (Atomic Inventory Deduction)
- Khi bác sĩ bấm ký đơn thuốc, hệ thống kiểm tra tồn kho tức thời: `SoLuongTon >= SoLuongKe`.
- Khi dược sĩ xác nhận phát thuốc tại quầy (`PATCH /api/prescriptions/:id/dispense`), toàn bộ quá trình trừ tồn kho các loại thuốc trong `CT_DON_THUOC` được thực hiện trong một Atomic Database Transaction:
  - Nếu bất kỳ loại thuốc nào bị hụt tồn kho do phát sinh đồng thời, toàn bộ giao dịch sẽ Rollback và trả về thông báo lỗi cụ thể cho dược sĩ.

### 7.5. BR05: Chống Trùng Ca Trực Cán Bộ Y Tế (Anti-Double-Shift Scheduling)
- Một nhân viên y tế (`NHAN_VIEN`) không được phân công 2 ca trực trùng nhau trong cùng một ngày (`MaNV, NgayTruc, CaTruc` là khóa chính hợp thành).
- Ràng buộc nghiệp vụ kiểm tra chuyên môn: Bác sĩ trực chính tại phòng cấp cứu hoặc phòng khám chuyên khoa bắt buộc phải có Chứng chỉ hành nghề y tế (`SoCCHN`) còn hiệu lực.

### 7.6. BR06: Đảm Bảo Tính Idempotency Trong Thanh Toán VietQR
- Mọi giao dịch tạo mã QR thanh toán viện phí đều gắn kèm `MaHD` duy nhất và mã giao dịch thanh toán duy nhất (`Idempotency-Key`).
- Webhook tiếp nhận từ Cổng thanh toán bắt buộc kiểm tra chữ ký HMAC (`X-Signature`) và kiểm tra trạng thái hóa đơn hiện tại: Nếu `TrangThaiTT` đã là `DA_THANH_TOAN`, hệ thống trả về mã 200 OK ngay lập tức mà không cộng dồn doanh thu hay cập nhật lặp lại.

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
│   │   │   ├── (clinical)/                # Khám bệnh lâm sàng, chẩn đoán, toa thuốc
│   │   │   ├── (laboratory)/              # Danh sách chỉ định và trả kết quả CLS
│   │   │   ├── (inpatient)/               # Sơ đồ buồng bệnh, phân giường nội trú
│   │   │   ├── (pharmacy)/                # Kho dược, duyệt đơn và phát thuốc
│   │   │   ├── (cashier)/                 # Lập hóa đơn, quyết toán BHYT, quét VietQR
│   │   │   └── (admin)/                   # Quản lý khoa phòng, nhân sự, lịch trực, Dashboard
│   │   ├── components/                    # Reusable UI (BedCard, PatientQueue, InvoiceView,...)
│   │   │   └── ui/                        # shadcn/ui primitives (Dialog, Table, Badge,...)
│   │   ├── hooks/                         # Custom React hooks (useBedStatus, usePatientSearch,...)
│   │   ├── lib/                           # Utility functions, axios client instance
│   │   └── types/                         # TypeScript interfaces chia sẻ từ API DTO
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                               # NestJS 10+ (TypeScript, Modular Monolith)
│   ├── prisma/                            # Prisma ORM Schema & Migrations
│   │   ├── schema.prisma                  # 19 Thực thể BCNF + Enums
│   │   ├── migrations/                    # Lịch sử version migration CSDL
│   │   └── seed.ts                        # Dữ liệu mẫu chuẩn hóa (19 bảng)
│   ├── src/
│   │   ├── common/                        # Interceptors, Filters, Guards, Decorators
│   │   │   ├── decorators/                # @Roles(), @CurrentUser()
│   │   │   ├── filters/                   # HttpExceptionFilter, PrismaClientExceptionFilter
│   │   │   └── guards/                    # JwtAuthGuard, RolesGuard
│   │   └── modules/                       # 10 Phân hệ nghiệp vụ bệnh viện
│   │       ├── auth/                      # Xác thực, cấp JWT Token, phân quyền RBAC
│   │       ├── department-room/           # Khoa, Phòng khám, Buồng bệnh, Giường bệnh
│   │       ├── staff/                     # Bác sĩ, Điều dưỡng, Nhân viên hành chính
│   │       ├── patient/                   # Bệnh nhân, Hồ sơ ngoại trú, Hồ sơ nội trú
│   │       ├── examination/               # Lượt khám, sinh hiệu, chẩn đoán lâm sàng
│   │       ├── prescription/              # Toa thuốc, chi tiết đơn, xuất nhập tồn dược
│   │       ├── clinical-service/          # Dịch vụ kỹ thuật, chỉ định & kết quả CLS
│   │       ├── inpatient-stay/            # Quản lý lưu viện, phân bổ & chuyển giường
│   │       ├── billing/                   # Quyết toán viện phí, khấu trừ BHYT, hóa đơn PDF
│   │       ├── duty-schedule/             # Xếp ca trực, chống trùng lịch y bác sĩ
│   │       └── report/                    # Thống kê doanh thu, công suất giường, mô hình bệnh
│   ├── test/                              # E2E & Integration tests (Supertest)
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                                  # Tài liệu kỹ thuật & Báo cáo đồ án
│   ├── Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md # Báo cáo kiểm toán & sửa đồ án
│   ├── Techstack_QuanLyBenhVien.md        # Tài liệu Techstack chuẩn kỹ thuật (File này)
│   ├── diagrams/                          # Sơ đồ EER, Use Case, Sequence Diagrams
│   └── DataTask_PhanCongTheoTuan/         # Hồ sơ nhiệm vụ Tuần 1 -> Tuần 4
│
├── docker-compose.yml                     # Khởi chạy đồng bộ Postgres 16, NestJS, Next.js
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
| **Cao Nguyễn Quốc Khánh** | 3124410149 | **Trưởng nhóm / Technical Lead**: Thiết kế kiến trúc tổng thể, Schema Prisma & Migration, dựng Core Backend NestJS, phân quyền RBAC, kiểm duyệt PR. |
| **Trần Nguyễn Quỳnh Như** | 3124410258 | **Fullstack Developer & QA Lead**: Phát triển phân hệ Tiếp đón, Hồ sơ Bệnh nhân, xây dựng Test Suite (Jest/Supertest) và tài liệu API Swagger. |
| **Hoàng Văn Lập** | 3124410184 | **Fullstack Developer**: Phát triển phân hệ Khám bệnh lâm sàng (`LUOT_KHAM`), Kê toa thuốc (`DON_THUOC`), và module trừ tồn kho tự động. |
| **Nguyễn Đăng Thụy** | 3124410352 | **Fullstack Developer**: Phát triển phân hệ Quản lý Nội trú, Sơ đồ giường bệnh thời gian thực (`PHAN_GIUONG`) và module Phân ca trực (`LICH_TRUC`). |
| **Cô Thành Long** | 31244102192 | **Fullstack Developer**: Phát triển phân hệ Thu ngân Viện phí (`HOA_DON`), tính toán BHYT, tích hợp VietQR và xuất biên lai PDFKit. |

### 9.2. Chiến Lược Quản Lý Nhánh Git (Git Branching Strategy)
- **Nhánh `main`**: Nhánh phát hành ổn định, chỉ nhận merge sau khi kết thúc đợt kiểm thử tích hợp cuối mỗi tuần để báo cáo giảng viên.
- **Nhánh `dev`**: Nhánh tích hợp chính của cả nhóm.
- **Nhánh tính năng (`feat/...`)**: Tách ra từ `dev` theo định dạng chuẩn:
  - `feat/QLBV-reception-patient`: Phân hệ tiếp đón bệnh nhân.
  - `feat/QLBV-clinical-exam`: Phân hệ khám bệnh và sinh hiệu.
  - `feat/QLBV-inpatient-bed-lock`: Phân hệ phân giường và khóa dòng chống trùng.
  - `feat/QLBV-billing-bhyt-pdf`: Phân hệ viện phí và xuất hóa đơn.
  - `fix/QLBV-<mã-lỗi>`: Dành cho các nhánh sửa lỗi khẩn cấp.

### 9.3. Quy Chuẩn Commit (Conventional Commits)
Thông điệp commit bắt buộc tuân theo quy chuẩn:
- `feat(clinical): implement prescription creation and inventory validation`
- `feat(inpatient): add serializable transaction for bed assignment`
- `feat(billing): integrate VietQR mock payment and PDFKit receipt export`
- `fix(reception): handle nullable CCCD for pediatric patients with filtered index`
- `docs(techstack): update v2.0 techstack documentation for hospital management`

### 9.4. Quy Trình Pull Request & Code Review
- 100% PR muốn merge vào nhánh `dev` phải vượt qua bài kiểm tra tự động của GitHub Actions (Linting, TypeScript Check, Unit Tests).
- Bắt buộc có sự review và phê duyệt (Approve) từ Technical Lead (Cao Nguyễn Quốc Khánh) hoặc ít nhất 1 thành viên chịu trách nhiệm phân hệ liên quan.

---

## 10. Chiến Lược Kiểm Thử & Tiêu Chuẩn Hoàn Thành (DoD)

### 10.1. Các Cấp Độ Kiểm Thử
1. **Kiểm thử đơn vị (Unit Testing - Jest)**:
   - Kiểm thử thuật toán tính viện phí và chiết trừ BHYT với các mức hưởng (80%, 95%, 100%).
   - Kiểm thử tính toán ngày lưu trú giường bệnh: `Ceiling(NgayKetThuc - NgayBatDau)`.
   - Kiểm thử tính toàn vẹn tuổi lao động nhân viên y tế ($\ge 18$) và ngày hẹn tái khám.
2. **Kiểm thử tích hợp (Integration Testing - Supertest)**:
   - Kịch bản tiếp đón ➔ khám lâm sàng ➔ chỉ định CLS ➔ nhập kết quả ➔ kê đơn thuốc ➔ quyết toán viện phí.
   - Kịch bản nhập viện nội trú ➔ phân giường bệnh ➔ chuyển giường ➔ xuất viện và thanh toán tiền phòng.
3. **Kiểm thử đồng thời & Ranh giới (Concurrency & Boundary Testing)**:
   - Giả lập 10 bác sĩ đồng thời kê cùng một loại thuốc sắp hết hàng để kiểm chứng tính nguyên tử của giao dịch trừ kho.
   - Giả lập 2 nhân viên điều dưỡng cùng bấm xếp 2 bệnh nhân vào một giường bệnh duy nhất để kiểm tra tính năng Row Locking / Serializable Isolation.

### 10.2. Tiêu Chuẩn Hoàn Thành (Definition of Done – DoD)
Một tính năng chỉ được nghiệm thu đạt chuẩn (Done) khi:
1. Mã nguồn hoàn thiện, không phát sinh lỗi biên dịch TypeScript và cảnh báo ESLint.
2. Đúng 100% các quy tắc ràng buộc toàn vẹn và nghiệp vụ y tế đã cam kết trong hồ sơ EER.
3. Giao diện Frontend hiển thị đầy đủ các trạng thái tương tác: Loading (Skeleton), Error handling (Toast), Success feedback.
4. Đã viết Unit/Integration Test tương ứng và vượt qua toàn bộ Test Cases.
5. Đã kiểm thử chạy mượt mà trên môi trường Docker Compose đa nền tảng.

---

## 11. Các Quyết Định Kiến Trúc & Kỹ Thuật Đã Chốt

| STT | Hạng mục quyết định | Phương án kỹ thuật thống nhất | Lý do & Căn cứ kỹ thuật |
| :---: | :--- | :--- | :--- |
| **1** | **Hệ quản trị CSDL & ORM** | **PostgreSQL 16** kết hợp **Prisma ORM (v7.x)** | Đảm bảo tính nhất quán với SweetHome techstack, hỗ trợ tuyệt đối ACID transaction, cơ chế Row Locking mạnh mẽ, và khả năng mở rộng container Docker nhẹ nhàng. |
| **2** | **Bảo toàn mô hình kế thừa IS-A** | Mô hình Class Table Inheritance (1 Bảng Cha + Các Bảng Con riêng biệt) | `NHAN_VIEN` phân rã sang `BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`; `BENH_NHAN` phân rã sang `BN_NGOAI_TRU`, `BN_NOI_TRU`. Khóa chính bảng con đồng thời là Khóa ngoại tham chiếu bảng cha với `ON DELETE CASCADE`. |
| **3** | **Quản lý giá lịch sử** | Snapshot Pricing (`DonGiaBan`, `DonGiaDV`, `GiaGiuongNgay`) | Khi kê đơn hoặc chỉ định dịch vụ, đơn giá hiện hành được chụp lại (Snapshot) vào dòng chi tiết, đảm bảo biến động giá tương lai không làm sai lệch báo cáo tài chính trong quá khứ. |
| **4** | **Bảo mật & Phân quyền y tế** | Role-Based Access Control (RBAC) với JWT | Bác sĩ chỉ có quyền đọc/ghi hồ sơ bệnh án và kê đơn; Kỹ thuật viên chỉ có quyền nhập kết quả CLS; Thu ngân chỉ có quyền truy cập module hóa đơn viện phí. |
| **5** | **Xuất chứng từ y tế** | Backend Rendering PDFKit | Toàn bộ đơn thuốc và hóa đơn viện phí được sinh trực tiếp từ phía Backend dưới dạng luồng dữ liệu nhị phân (`application/pdf`) nhằm đảm bảo tính toàn vẹn, chống chỉnh sửa dữ liệu phía Client. |

---

## 12. Tài Liệu Kỹ Thuật Tham Chiếu Liên Quan

1. `Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md`: Báo cáo rà soát và hướng dẫn chỉnh sửa toàn diện đồ án CSDLNC Quản lý Bệnh viện.
2. `EER_hoan_chinh_v1`: File thiết kế mô hình thực thể kết hợp mở rộng (EER) chuẩn hóa 19 thực thể.
3. `W4-A_Danh_muc_bang_sau_chuan_hoa.docx`: Hồ sơ chuẩn hóa BCNF chi tiết của 19 bảng quan hệ.
4. `W4-B_Tu_dien_du_lieu_va_Schema_vat_ly.docx`: Từ điển dữ liệu 132 thuộc tính và miền giá trị y tế.
5. `W4-C_Dac_Ta_Rang_Buoc_Toan_Ven_Va_Trigger.docx`: Hồ sơ đặc tả 25 khóa ngoại và hệ thống ràng buộc nghiệp vụ.
6. `SweetHome_Techstack.docx`: Tài liệu chuẩn tham chiếu ngăn xếp công nghệ mẫu v2.0.
