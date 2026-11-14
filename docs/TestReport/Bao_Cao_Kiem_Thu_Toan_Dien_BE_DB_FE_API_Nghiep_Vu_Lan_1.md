# Báo Cáo Kiểm Thử Toàn Diện: Backend, Database, Frontend, API & Nghiệp Vụ (QLBV)

- **Ngày thực hiện:** `15/11/2026`
- **Phạm vi kiểm thử:** Kiểm thử sâu toàn bộ Backend (NestJS), Database (PostgreSQL + Prisma Schema 19 bảng / 13 enums), Frontend (Next.js App Router), RESTful API & Business Rules đối chiếu với `docs/API_Contract_v1.md` và `diagrams/`.
- **Tính chất:** Chỉ kiểm thử và lập báo cáo kết quả thực tế; **chưa chỉnh sửa code theo các lỗi phát hiện**.

---

## 1. Tóm Tắt Kết Quả Tổng Quan

| Hạng mục kiểm thử | Lệnh / Công cụ | Kết quả | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Backend Unit Tests (Jest)** | `npm.cmd test` (`backend/`) | **PASS** (1 suite, 2/2 tests) | `src/modules/billing/billing.service.spec.ts` |
| **Backend Build (NestJS)** | `npm.cmd run build` (`backend/`) | **PASS** (exit code 0) | Biên dịch TypeScript không lỗi |
| **Frontend TypeCheck** | `tsc.cmd --noEmit` (`frontend/`) | **PASS** (exit code 0) | Không có lỗi TypeScript |
| **Frontend ESLint** | `npm.cmd run lint` (`frontend/`) | **PASS** (0 errors, 8 warnings) | 8 cảnh báo `unused-vars` / `exhaustive-deps` ở các trang cũ |
| **Database Schema & Seed** | `schema.prisma` + PostgreSQL | **PASS** (19 models, 13 enums) | Đủ 14 giường, 3 trạng thái (`TRONG`, `DANG_SU_DUNG`, `BAO_TRI`) |
| **Live API & Business Rules + FE Routes** | Integration Script (`http://localhost:3001/api` & `:3000`) | **54/58 PASS, 4 FAIL** | **1 lỗi nghiêm trọng BR02 (Race Condition)** & **3 route 404 từ Sidebar** |

---

## 2. Kiểm Tra Cấu Trúc Database & Đối Chiếu Thiết Kế (`schema.prisma` vs `diagrams/` & `API_Contract_v1.md`)

- **Số lượng thực thể:** `19 models` (`@@map` đúng 19 bảng chuẩn BCNF trong `diagrams/02_Relational_Schema_19Bang.xml`) và `13 enums` chuẩn hóa y tế.
- **Dữ liệu mẫu giường bệnh (`GIUONG_BENH`) & nội trú (`BN_NOI_TRU`) hiện có:**
  - Tổng số giường: **14 giường** (`TRONG`: 7, `DANG_SU_DUNG`: 4, `BAO_TRI`: 3).
  - Đầy đủ 4 loại giường: `TIEU_CHUAN` (6), `VIP` (4), `HOI_SUC` (2), `CAP_CUU` (2).
  - Bệnh nhân nội trú mẫu: `5` hồ sơ (`BN002`, `BN003`, `BN004`, `BN005` chưa phân giường, `BN74856809`).

---

## 3. Kết Quả Kiểm Thử Tích Hợp API & Business Rules (Live `http://localhost:3001/api`)

Tổng số test case API & nghiệp vụ đã chạy: **46 test cases** (**45 PASS**, **1 FAIL**).

### 3.1. Phân hệ Xác thực & Phân quyền RBAC (`AuthModule`) — 7/7 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `GET /api/departments` không có JWT | `401` | `401` | PASS |
| `POST /api/auth/login` (`BS01`) | `200` + JWT + `role=BAC_SI` | `200` (`role=BAC_SI`) | PASS |
| `POST /api/auth/login` (`DD01`) | `200` + `role=DIEU_DUONG` | `200` | PASS |
| `POST /api/auth/login` (`NV_TN_01`) | `200` + `role=THU_NGAN` | `200` | PASS |
| `POST /api/auth/login` (`ADMIN01`) | `200` + `role=ADMIN` | `200` | PASS |
| `POST /api/auth/login` (sai mật khẩu) | `401` | `401` | PASS |
| `GET /api/auth/profile` (`BS01`) | `200` + `MaNV=BS01` | `200` | PASS |

### 3.2. Cơ sở vật chất & Nhân sự (`DepartmentRoomModule`, `StaffModule`) — 7/7 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `GET /api/departments` | `200` + danh sách khoa | `200` (`len=2`) | PASS |
| `GET /api/departments/K01` | `200` + `phongs[]` | `200` | PASS |
| `GET /api/rooms/available?maKhoa=K01` | `200` + `soGiuongConTrong` | `200` | PASS |
| `GET /api/beds/map` | `200` + đủ 3 trạng thái giường | `200` (`total=14`, đủ `TRONG`, `DANG_SU_DUNG`, `BAO_TRI`) | PASS |
| `GET /api/staff` | `200` + danh sách nhân viên | `200` (`len=5`) | PASS |
| `GET /api/staff/doctors` | `200` + danh sách bác sĩ | `200` (`len=2`) | PASS |
| `GET /api/staff/nurses` | `200` + danh sách điều dưỡng | `200` (`len=1`) | PASS |

### 3.3. Tiếp đón & Khám lâm sàng (`PatientModule`, `ExaminationModule`) — 7/7 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `POST /api/patients/reception` (`THU_NGAN`) | `201` | `201` | PASS |
| `POST /api/patients/reception` (trùng `CCCD`) | `400/409` | `400` | PASS |
| `GET /api/patients/lookup?q=<CCCD>` | `200` + đúng `MaBN` | `200` | PASS |
| `GET /api/patients?page=1&limit=10` | `200` + `data[]` | `200` | PASS |
| `POST /api/examinations` với quyền `THU_NGAN` | `403` (RBAC chặn) | `403` | PASS |
| `POST /api/examinations` với quyền `BAC_SI` | `201` | `201` | PASS |
| `PATCH /api/examinations/:id/diagnose` | `200` | `200` | PASS |

### 3.4. Cận lâm sàng & Dược phẩm (`ClinicalServiceModule`, `PrescriptionModule`) — 9/9 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `GET /api/services` | `200` | `200` | PASS |
| `POST /api/services/assign` | `201` | `201` | PASS |
| `GET /api/services/pending` (`DIEU_DUONG`) | `200` + chứa dịch vụ vừa chỉ định | `200` | PASS |
| `PATCH /api/services/result` (`DIEU_DUONG`) | `200` | `200` | PASS |
| `GET /api/prescriptions/medicines` | `200` | `200` | PASS |
| `POST /api/prescriptions` vượt tồn kho (**BR04**) | `400` | `400` | PASS |
| `POST /api/prescriptions` hợp lệ | `201` | `201` | PASS |
| `PATCH /api/prescriptions/:id/dispense` (**BR04** trừ kho) | `200` + `DA_PHAT` | `200` | PASS |
| `PATCH /api/prescriptions/:id/dispense` phát lặp lại | `400` | `400` | PASS |

### 3.5. Viện phí BHYT, VietQR & PDF (`BillingModule`) — 5/5 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `POST /api/billing/calculate/:examId` (**BR03**) | `200/201` + khớp công thức BHYT | `201` (`goc=145000`, `bhyt=104000`, `bn=41000`) | PASS |
| `POST /api/billing/invoices` | `201` | `201` | PASS |
| `POST /api/billing/webhook/vietqr` (lần 1) | `200/201` | `201` | PASS |
| `POST /api/billing/webhook/vietqr` (idempotency lần 2) | `200/201` | `201` | PASS |
| `GET /api/billing/invoices/:id/pdf` | `200` + `application/pdf` | `200` (`application/pdf`, >500B) | PASS |

### 3.6. Điều trị Nội trú & Phân giường (`InpatientStayModule`) — 6/7 PASS, **1 FAIL (Nghiêm trọng)**
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `POST /api/inpatient/admit` (`DIEU_DUONG` bị chặn RBAC) | `403` | `403` | PASS |
| `POST /api/inpatient/assign-bed` trước khi nhập viện (**C10**) | `400` | `400` | PASS |
| `POST /api/inpatient/admit` (`BAC_SI`) | `201` | `201` | PASS |
| `POST /api/inpatient/assign-bed` vào giường `CAP_CUU` `G13` (**C02**) | `400` | `400` | PASS |
| **Gửi đồng thời 2 request `POST /api/inpatient/assign-bed` vào cùng giường `G03` (`Promise.all` — BR02)** | **1 x `201`, 1 x `400/500`** | **`statuses=[201, 201]`** | **FAIL** |
| `POST /api/inpatient/transfer-bed` (**BR01**) | `201` | `201` | PASS |
| Kiểm tra trạng thái sau chuyển giường (`G03=BAO_TRI`, `G06=DANG_SU_DUNG`) | `BAO_TRI` & `DANG_SU_DUNG` | `G03=BAO_TRI, G06=DANG_SU_DUNG` | PASS |

### 3.7. Lịch trực & Báo cáo (`DutyScheduleModule`, `ReportModule`) — 4/4 PASS
| Test Case | Kỳ vọng | Thực tế | Kết quả |
| :--- | :---: | :---: | :---: |
| `POST /api/duty-schedules` (`ADMIN`) | `201` | `201` | PASS |
| `POST /api/duty-schedules` trùng `[MaNV, NgayTruc, CaTruc]` (**BR05**) | `400/409` | `400` | PASS |
| `PATCH /api/duty-schedules/attendance` (`DIEU_DUONG`) | `200` + `CO_MAT` | `200` | PASS |
| `GET /api/reports/dashboard` | `200` + `overview` & `revenue` | `200` | PASS |

---

## 4. Kết Quả Kiểm Thử Routes & Chất Lượng Mã Nguồn Frontend (`http://localhost:3000`)

Tổng số route kiểm tra HTTP: **12 routes** (**9 PASS**, **3 FAIL**).

| Route | Trạng thái HTTP | Kết quả | Ghi chú đối chiếu `API_Contract_v1.md` & `Sidebar.tsx` |
| :--- | :---: | :---: | :--- |
| `/`, `/login`, `/reception`, `/clinical`, `/laboratory`, `/inpatient`, `/pharmacy`, `/cashier`, `/admin` | `200` | **PASS** (9/9) | Đúng với 9 route chuẩn trong `docs/API_Contract_v1.md` Mục 6 |
| `/departments` | `404` | **FAIL** | Có link trong `Sidebar.tsx` nhưng chưa có page tương ứng |
| `/staff` | `404` | **FAIL** | Có link trong `Sidebar.tsx` nhưng chưa có page tương ứng |
| `/billing` | `404` | **FAIL** | Có link trong `Sidebar.tsx` (trang thực tế nằm ở `/cashier`) |

---

## 5. Phân Tích Các Lỗi & Sai Lệch Cần Lưu Ý

1. **[CRITICAL - Backend / Database Concurrency] Vi phạm BR02 (Chống phân trùng giường đồng thời) tại `InpatientStayService.assignBed`**:
   - **Vị trí:** `backend/src/modules/inpatient-stay/inpatient-stay.service.ts` (hàm `assignBed`).
   - **Nguyên nhân:** Giao dịch dùng `this.prisma.$transaction(async (tx) => { ... })` ở mức cô lập mặc định (`ReadCommitted`) và không khóa dòng bằng `SELECT ... FOR UPDATE` (hoặc `Serializable` isolation level như đặc tả trong `diagrams/05_Sequence_NoiTru_KhoaGiuong_BR02.xml`). Khi 2 request đồng thời cùng cấp giường `G03` cho 2 bệnh nhân khác nhau, cả hai đều đọc thấy `TrangThaiGiuong = 'TRONG'` và `activeAllocation = null`, dẫn đến **cả 2 request cùng trả về `201 Created`** và tạo 2 bản ghi `PHAN_GIUONG` đang mở trên cùng một giường.
2. **[HIGH - Frontend Navigation] 3 liên kết chết (HTTP 404) trong `Sidebar.tsx`**:
   - **Vị trí:** `frontend/src/components/layout/Sidebar.tsx` (`NAV_GROUPS`).
   - **Chi tiết:** Menu sidebar trỏ tới `/billing`, `/departments`, `/staff`, trong khi App Router hiện tại đặt trang Thu ngân ở `/cashier` và trang Quản trị/Lịch trực ở `/admin` (đúng theo `docs/API_Contract_v1.md` Mục 6), khiến người dùng bấm 3 mục này bị `404`.
3. **[LOW - Frontend Lint Warnings] 8 cảnh báo ESLint**:
   - Biến/import không dùng (`_UnusedLogOut`, `NAV_GROUPS`, `_ROLE_LABELS`, `_SidebarContent`) tại `clinical/page.tsx`, `laboratory/page.tsx`, `reception/page.tsx`, `app/page.tsx` và `react-hooks/exhaustive-deps` tại `admin/page.tsx`.
