# BÁO CÁO KIỂM THỬ SÂU FRONTEND ĐỐI CHIẾU TÀI LIỆU v2

- **Dự án:** Hệ Thống Quản Lý Bệnh Viện (QLBV)
- **Ngày kiểm thử:** `16/11/2026`
- **Phạm vi kiểm tra (`frontend/`):**
  - Toàn bộ **`22` tệp `.ts/.tsx`** trong `frontend/src/`: [types/index.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/types/index.ts), [lib/api.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/lib/api.ts), [services/hospitalApi.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/services/hospitalApi.ts), [store/useAuthStore.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/store/useAuthStore.ts), [Sidebar.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/components/layout/Sidebar.tsx), [QueryProvider.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/components/providers/QueryProvider.tsx), `9` trang trong `frontend/src/app/**`.
  - Cấu hình & script kiểm thử: [package.json](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/package.json), [test-frontend-deep.mjs](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/scripts/test-frontend-deep.mjs), và máy chủ Next.js đang chạy tại `http://localhost:3000`.
- **Tài liệu chuẩn đối chiếu (v2):**
  - [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md) (Mục 1–6)
  - [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md)
  - [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml)
  - [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml)
  - [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt)

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

> [!WARNING]
> **Kết luận chung: FRONTEND HIỆN TẠI ĐƯỢC XÂY DỰNG HOÀN TOÀN CHO BẢN v1 (19 BẢNG) VÀ ĐANG CHẠY KHỚP VỚI BACKEND v1, NHƯNG CHƯA ĐỒNG BỘ VỚI ĐẶC TẢ v2 (18 BẢNG · 13 NHÓM QUY TẮC · `API_Contract_v2.md`).**
> Quét tĩnh toàn bộ `22` tệp nguồn `frontend/src/` cho thấy **`0 / 34` từ khóa/định danh mới của v2** xuất hiện trong codebase (ví dụ `KY_THUAT_VIEN`, `TIEP_NHAN`, `DOT_NOI_TRU`, `THE_BHYT`, `PHIEU_XET_NGHIEM`, `VIEN_PHI`, `TruBHYT`, `ThucThu`, `TuNgay`, `DenNgay`, `ruleCode` đều bằng `0`).

### Bảng Tổng Hợp Trạng Thái PASS / CHƯA PASS So Với Docs v2

| Hạng mục kiểm thử | Chỉ tiêu chuẩn | Kết quả thực tế trên Frontend | Trạng thái |
| :--- | :--- | :--- | :---: |
| **TypeScript (`npx tsc --noEmit`)** | Không lỗi kiểu dữ liệu | `EXIT: 0` (biên dịch sạch trên codebase v1 hiện tại) | **PASS** (trên v1) |
| **ESLint (`npm run lint`)** | Không lỗi lint | `EXIT: 0` — có **8 warnings** (code thừa chưa dọn ở 5 trang, thiếu dependency `useEffect`) | **PASS** (có 8 warnings) |
| **Live Next.js Routes (`localhost:3000`)** | Các route render không crash | `9/9` route (`/`, `/login`, `/reception`, `/clinical`, `/laboratory`, `/inpatient`, `/cashier`, `/pharmacy`, `/admin`) đều trả HTTP `200` | **PASS** (vận hành v1) |
| **Unit / Component Test Frontend** | Có test cho form/logic v2 | [package.json](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/package.json) không có script `test`; [test-frontend-deep.mjs](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/scripts/test-frontend-deep.mjs) chỉ gọi API v1 tới `:3001`, không test DOM/UI | **FAIL** |
| **Types & Interfaces (`types/index.ts`)** | 18 thực thể v2 + 6 dẫn xuất + Enums v2 | Dùng 19 bảng v1 (`NV_HANH_CHINH`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `HOA_DON`, `DICH_VU`, `SU_DUNG_DV`, `LICH_TRUC`); `0` trường dẫn xuất v2 | **FAIL** |
| **API Client & Interceptor (`hospitalApi.ts`, `api.ts`)** | Khớp 38 endpoint & lỗi `ruleCode` tại Mục 4–5 v2 | Gọi toàn bộ endpoint v1 (`/patients/reception`, `/services/*`, `/prescriptions/:id/dispense`, `/duty-schedules`, `/billing/calculate`, `/webhook/vietqr`); chưa đọc `ruleCode` | **FAIL** |
| **RBAC & Bảo vệ Route (`RoleEnum`, `Sidebar.tsx`, Pages)** | Cây `(d, p)` với `KY_THUAT_VIEN`, `TIEP_NHAN`; bảo vệ đủ các trang | Thiếu `KY_THUAT_VIEN`, `TIEP_NHAN`; giữ `NV_HANH_CHINH`, `DUOC_SI`, `QUAN_TRI`; **3/9 trang** (`cashier`, `pharmacy`, `admin`) **không** kiểm tra đăng nhập/vai trò & thiếu `<Sidebar />` | **FAIL** |
| **Route Groups & React Query Keys (Mục 6 v2)** | 7 route groups chuẩn + Query Keys chuẩn | Chỉ **2/9 trang** (`page.tsx`, `inpatient/page.tsx`) dùng `useQuery`; Query Keys theo `API_Contract_v1.md` (thiếu `date` ở `["beds", "map"]`); vẫn giữ route `/pharmacy` v1 | **FAIL** |
| **Form Validation (`react-hook-form` + `zod`)** | Kiểm tra ràng buộc nhập liệu chuẩn v2 | Cài sẵn trong `package.json` nhưng **`0/9` trang** sử dụng `useForm` hoặc `zod` (dùng state thủ công) | **FAIL** |
| **Hỗ trợ 13 Quy tắc (`BR-V2-01..13`) trên UI** | UI phản ánh đúng 13 nhóm quy tắc v2 | **0/13 PASS** · **3/13 PARTIAL** (`BR-V2-03, 05, 06`) · **10/13 FAIL** | **FAIL** |

---

## 2. Kết Quả Thực Thi Kiểm Chứng Trực Tiếp (Build, Lint, Live Server & Quét Tĩnh)

### 2.1. Kết quả chạy lệnh kiểm tra trên `frontend/`
1. **`cmd /c "npx tsc --noEmit"` (`EXIT: 0` — PASS):**
   - Toàn bộ `22` file TypeScript biên dịch sạch, không lỗi type.
2. **`cmd /c "npm run lint"` (`EXIT: 0` — PASS với `8` cảnh báo):**
   - [admin/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28admin%29/admin/page.tsx#L48): `react-hooks/exhaustive-deps` thiếu dependency `loadAllAdminData` trong `useEffect`.
   - [clinical/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28clinical%29/clinical/page.tsx#L21): `_UnusedLogOut`, `NAV_GROUPS` (L60), `_ROLE_LABELS` (L183) khai báo dư (`@typescript-eslint/no-unused-vars`).
   - [laboratory/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28laboratory%29/laboratory/page.tsx#L52): `NAV_GROUPS`, `_ROLE_LABELS` (L154) khai báo dư.
   - [reception/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28reception%29/reception/page.tsx#L414): `_SidebarContent` khai báo dư (dù đã chuyển sang dùng `<Sidebar />`).
   - [page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/page.tsx#L399): `_SidebarContent` khai báo dư.
3. **Kiểm tra Live Dev Server (`http://localhost:3000`):**
   - Tất cả `9` đường dẫn `/`, `/login`, `/reception`, `/clinical`, `/laboratory`, `/inpatient`, `/cashier`, `/pharmacy`, `/admin` đều phản hồi HTTP **`200 OK`**.
4. **Kiểm tra Automated Tests của Frontend:**
   - [package.json](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/package.json#L5-L10) chỉ có `dev`, `build`, `start`, `lint` — **không có `test`**, không có Jest/Vitest/Playwright cho UI.
   - Script [test-frontend-deep.mjs](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/scripts/test-frontend-deep.mjs#L1-L100) là script Node gọi trực tiếp HTTP API v1 (`BS01`, `DD01`, `NV_TN_01`, `/api/patients/reception`, `/api/services/*`, `/api/duty-schedules`, v.v.) tới backend `:3001`, không kiểm thử component React hay đặc tả v2.

### 2.2. Kết quả quét từ khóa v1 vs v2 trên toàn bộ `frontend/src/` (`22` tệp)
- **Từ khóa v1 (đã bỏ hoặc đổi ở v2) vẫn dày đặc:** `QUAN_TRI (31)`, `NV_HANH_CHINH (23)`, `reception (20)`, `DUOC_SI (14)`, `SoBHYT (13)`, `TrangThaiGiuong (10)`, `admit (9)`, `DANG_SU_DUNG (8)`, `MucHuongBHYT (8)`, `SoLuongTon (7)`, `dutySchedule (6)`, `dispense (4)`, `bnNgoaiTru (4)`, `bnNoiTru (3)`, `duty-schedules (3)`, `HOA_DON (1)`, `webhook/vietqr (1)`.
- **34 từ khóa/định danh v2 (`KY_THUAT_VIEN`, `TIEP_NHAN`, `DOT_NOI_TRU`, `MaDotNT`, `THE_BHYT`, `MaTheBHYT`, `MucHuong`, `CHI_TIET_DON_THUOC`, `DonGiaKe`, `LOAI_XET_NGHIEM`, `MaLoaiXN`, `PHIEU_XET_NGHIEM`, `MaPhieuXN`, `NgayGioXN`, `NgayGioTraKQ`, `DonGiaXN`, `VIEN_PHI`, `TruBHYT`, `ThucThu`, `TongTienThuoc`, `TongTienDichVu`, `SoNamCongTac`, `Tuoi`, `TuNgay`, `DenNgay`, `NgayRaVien`, `SAN_SANG`, `NGUNG_SU_DUNG`, `ruleCode`, `lab-types`, `lab-requests`, `insurance-cards`, `bed-allocations`, `discharge`, `billing/preview`):** **`0` lần xuất hiện** trong toàn bộ `frontend/src/`.

---

## 3. Đối Chiếu Types (`types/index.ts`), API Client (`hospitalApi.ts`) & Error Handling (`lib/api.ts`)

### 3.1. TypeScript Interfaces & Enums ([types/index.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/types/index.ts)) — `FAIL`
1. **Enums sai lệch so với Mục 3 & Mục 4 của [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md) / [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md):**
   - `RoleEnum` (L91–99): có `ADMIN`, `BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`, `THU_NGAN`, `DUOC_SI`, `QUAN_TRI`; **thiếu `KY_THUAT_VIEN` và `TIEP_NHAN`**; thừa `NV_HANH_CHINH`, `DUOC_SI`, `QUAN_TRI` (trong đó `DUOC_SI` và `QUAN_TRI` thậm chí không tồn tại ở Backend [role.enum.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/enums/role.enum.ts)).
   - `TrangThaiGiuongEnum` (L19–23): vẫn dùng `TRONG`, `DANG_SU_DUNG`, `BAO_TRI` thay vì tình trạng khai thác `SAN_SANG`, `BAO_TRI`, `NGUNG_SU_DUNG` (`BR-V2-11`).
   - `TrangThaiKhamEnum` (L108–114): dùng `HOAN_THANH`, `NHAP_VIEN`, `CHUYEN_VIEN` thay vì `CHO_KHAM | DANG_KHAM | CHO_XET_NGHIEM | HOAN_TAT | HUY`.
   - `HinhThucTTEnum` (L128–133): dùng `THE_ATM`, `DONG_CHI_TRA` lệch cả với `PhuongThucTTEnum` (`TIEN_MAT | CHUYEN_KHOAN | THE`).
   - Vẫn định nghĩa `CaTrucEnum` & `TrangThaiDiemDanhEnum` của `LICH_TRUC` (đã bỏ ở v2).
2. **Entities & DTOs (L145–655):**
   - Thiếu 7 interfaces chuẩn v2: `KyThuatVien`, `DotNoiTru`, `TheBHYT`, `ChiTietDonThuoc`, `LoaiXetNghiem`, `PhieuXetNghiem`, `VienPhi`.
   - Vẫn giữ 8 interfaces v1 đã bỏ: `NvHanhChinh`, `BnNgoaiTru`, `BnNoiTru`, `CtDonThuoc`, `DichVu`, `SuDungDv`, `HoaDon`, `LichTruc`.
   - Các interface trùng tên (`Khoa`, `Phong`, `GiuongBenh`, `NhanVien`, `BacSi`, `DieuDuong`, `BenhNhan`, `LuotKham`, `Thuoc`, `DonThuoc`, `PhanGiuong`) đều giữ cấu trúc cột v1 (ví dụ `BenhNhan` gộp `SoBHYT`, `MucHuongBHYT: number`, `DiaChi`, `CoNgoaiTru`, `CoNoiTru` thay vì tách `DiaChi_Duong/Phuong/Quan` + `theBHYTs`; `PhanGiuong` theo `MaBN` + `GiaGiuongNgay` thay vì `MaDotNT`, `TuNgay`, `DenNgay`).
   - Không khai báo **6 thuộc tính dẫn xuất** (`SoNamCongTac`, `Tuoi`, `DON_THUOC.TongTienThuoc`, `VIEN_PHI.TongTienDichVu`, `VIEN_PHI.TongTienThuoc`, `VIEN_PHI.ThucThu`) hay `dangCoNguoiNam?: boolean`.

### 3.2. Axios Interceptor ([lib/api.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/lib/api.ts)) & Service ([hospitalApi.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/services/hospitalApi.ts)) — `FAIL`
- [lib/api.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/lib/api.ts#L22-L77):
  - Thông báo toast thành công khớp theo URL v1 (`/patients/reception`, `/examinations/.../diagnose`, `/prescriptions/.../dispense`, `/services/assign`, `/services/result`, `/inpatient/admit`, `/inpatient/assign-bed`).
  - Interceptor lỗi chỉ đọc `error?.response?.data?.message`, **chưa đọc trường `ruleCode`** (`BR-V2-01..13`) theo chuẩn lỗi Mục 4 của [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md#L254-L261).
- [hospitalApi.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/services/hospitalApi.ts#L42-L488):
  - **Không có** các method CRUD `KHOA`/`PHONG`, `PATCH /beds/:maGiuong/status`, `GET /staff/technicians`, `POST /staff`, `POST/GET /patients/:maBN/insurance-cards`, `PATCH/DELETE /prescriptions/:id`, `GET /lab-types`, `POST /lab-requests`, `PATCH /lab-requests/:id/start|complete`, `PATCH /inpatient/admissions/:id/discharge`, `PATCH /billing/invoices/:id/pay`.
  - **Hardcode giá trị mặc định nguy hiểm trong payload gửi đi:**
    - `patient.reception` (L117–118): tự điền `mucHuongBHYT: dto.mucHuongBHYT || 80` (gửi `80` kể cả khi caller muốn `0` hoặc `undefined`!), `diaChi: ... || "TP. Hồ Chí Minh"`.
    - `examination.create` (L145–152): tự điền `"BS01"`, `"P01"`, `"120/80"`, `37`, `80`.
    - `clinicalService.updateResult` (L309): tự điền `maKTVThucHien: ... || "DD01"`.
    - `billing.createInvoice` (L389): tự điền `maNVThuNgan: ... || "NV_TN_01"`.
    - `billing.calculateFee` (L371): chia `mucHuongBHYT / 100` theo số nguyên v1 thay vì `[0, 1]` của v2.
    - `department.getBedMap` (L75–81): không nhận tham số `?date=YYYY-MM-DD`.

---

## 4. Đối Chiếu RBAC, Sidebar & Bảo Vệ Route

### 4.1. Sai lệch RBAC ([Sidebar.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/components/layout/Sidebar.tsx) & [login/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28auth%29/login/page.tsx)) — `FAIL`
- [Sidebar.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/components/layout/Sidebar.tsx#L33-L141):
  - Hiển thị **`Kho dược & Phát thuốc` (`/pharmacy`)** (dù v2 bỏ phát thuốc trừ kho) và **`Quản trị & Lịch trực` (`/admin`)** (dù v2 bỏ `LICH_TRUC`).
  - Phân hệ `/laboratory` chỉ cho `[ADMIN, QUAN_TRI, DIEU_DUONG]` — **không có `KY_THUAT_VIEN`** (`BR-V2-01` và Mục 2 `API_Contract_v2.md`).
  - Phân hệ `/reception` và `/cashier` cho `NV_HANH_CHINH`, `THU_NGAN`, `QUAN_TRI` — **không có `TIEP_NHAN`**.
  - `ROLE_LABELS` vẫn ghi `DIEU_DUONG: "Điều dưỡng / KTV CLS"`.
- [login/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28auth%29/login/page.tsx#L45-L93):
  - Tài khoản demo đăng nhập nhanh chỉ gồm `ADMIN`, `BS01`, `BS02`, `DD01` (`DIEU_DUONG`), `NV_TN_01` (`THU_NGAN`) — **thiếu tài khoản demo `KY_THUAT_VIEN` và `TIEP_NHAN`**.

### 4.2. Lỗ hổng bảo vệ route ở Frontend — `FAIL`
Quét `useAuthStore` và điều hướng `/login` trên `9` trang cho thấy sự **thiếu nhất quán nghiêm trọng**:
- **5 trang CÓ kiểm tra `isAuthenticated` + chuyển về `/login` + render `<Sidebar />`:** [app/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/page.tsx), [reception/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28reception%29/reception/page.tsx), [clinical/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28clinical%29/clinical/page.tsx), [laboratory/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28laboratory%29/laboratory/page.tsx), [inpatient/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28inpatient%29/inpatient/page.tsx).
  - *Lưu ý:* Ngay cả trong 4 trang chuyên môn trên (`reception`, `clinical`, `laboratory`, `inpatient`), chỉ kiểm tra `isAuthenticated` mà **không chặn role truy cập trực tiếp bằng URL** (ví dụ `DIEU_DUONG` gõ URL `/clinical` vẫn xem được UI bác sĩ dù nút gọi API bị BE trả `403`).
- **3 trang KHÔNG kiểm tra auth client-side và KHÔNG có `<Sidebar />`:** [cashier/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28cashier%29/cashier/page.tsx), [pharmacy/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28pharmacy%29/pharmacy/page.tsx), [admin/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28admin%29/admin/page.tsx) — chưa gọi `useAuthStore()`, không redirect `/login` khi chưa đăng nhập, vẫn giữ layout cũ nút `ArrowLeft` về `/`.

---

## 5. Đối Chiếu Từng Route Group & React Query Keys (`API_Contract_v2.md` Mục 5–6)

| Route Group | Đặc tả v2 (Chức năng & React Query Keys) | Thực tế tại Frontend | Trạng thái |
| :--- | :--- | :--- | :---: |
| **`(auth)`** ([login/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28auth%29/login/page.tsx)) | Đăng nhập theo cây `(d, p)`, `['auth', 'profile']` | Đăng nhập hoạt động (qua Zustand + `hospitalApi.auth`), không dùng React Query `['auth', 'profile']`; danh sách vai trò demo là v1 | **PARTIAL** |
| **`(reception)`** ([reception/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28reception%29/reception/page.tsx)) | Hồ sơ `BENH_NHAN` (tách địa chỉ), `THE_BHYT`, đăng ký `LUOT_KHAM`, không tạo `BN_NGOAI_TRU`; Keys: `['patients', 'lookup', q]`, `['insurance-cards', maBN]` | Dùng `useState` (`0` React Query); gọi `POST /patients/reception` gửi `mucHuongBHYT` nguyên (`0/80/95/100`), `diaChi` gộp 1 chuỗi, `isNgoaiTru` tạo `BN_NGOAI_TRU`; **không có quản lý thẻ `THE_BHYT` (`NgayBatDau`, `NgayHetHan`)** và không có tạo `LUOT_KHAM` tiếp đón | **FAIL** |
| **`(clinical)`** ([clinical/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28clinical%29/clinical/page.tsx)) | Khám `LUOT_KHAM` (gắn `MaDotNT` nếu nội trú), kê `DON_THUOC` (sửa/xóa trước TT, khóa sau TT), chỉ định `PHIEU_XET_NGHIEM`; Keys: `['examinations', id]`, `['medicines', 'list']`, `['lab-types', 'list']` | Dùng `useState` (`0` React Query); gửi `maPhongKham: "P01"`, `huongXuTri`, vitals v1; không có trường `MaDotNT`, `LyDoKham`; hiển thị & kiểm tra `SoLuongTon` v1 trên thuốc; **không** có sửa/xóa đơn thuốc trước thanh toán và **không** khóa nút kê đơn/chỉ định khi hóa đơn đã `DA_THANH_TOAN` | **FAIL** |
| **`(laboratory)`** ([laboratory/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28laboratory%29/laboratory/page.tsx)) | KTV (`KY_THUAT_VIEN`) thực hiện & trả KQ `PHIEU_XET_NGHIEM` 2 bước (`start`, `complete`) với `NgayGioXN`, `NgayGioTraKQ >= NgayGioXN`, `DanhGia`; Key: `['lab-requests', 'pending']` | Dùng `useState` (`0` React Query); mặc định `maKTVThucHien = "DD01"` (`DIEU_DUONG`); gọi `getPending()` / `updateResult()` trên `SU_DUNG_DV`; **không có** luồng 2 bước `start` (`NgayGioXN`) -> `complete` (`NgayGioTraKQ`, `DanhGia`) | **FAIL** |
| **`(inpatient)`** ([inpatient/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28inpatient%29/inpatient/page.tsx)) | Đợt `DOT_NOI_TRU`, sơ đồ `GIUONG_BENH` tách `TrangThai` khai thác vs đang nằm theo ngày `date`, `PHAN_GIUONG` `[TuNgay, DenNgay)`, xuất viện `discharge`; Keys: `['beds', 'map', date]`, `['inpatient', 'admissions']` | Có dùng React Query + `useMutation` (`invalidateInpatientQueries` L416–420), nhưng Query Keys viết theo **`API_Contract_v1.md`**: `['beds', 'map']` (thiếu `date`), `['inpatients', 'list']`; nhập viện gọi `/inpatient/admit` (1-1 `BnNoiTru`), phân/chuyển giường không chọn `TuNgay`/`ngayChuyen` `DATE`, hiển thị `DANG_SU_DUNG` trên `TrangThaiGiuong`, **thiếu form/nút xuất viện (`discharge`)** | **FAIL** |
| **`(cashier)`** ([cashier/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28cashier%29/cashier/page.tsx)) | Lập `VIEN_PHI`, chọn tối đa 1 `THE_BHYT` còn hạn tính `TruBHYT`, chốt TT `PATCH /invoices/:id/pay`; Keys: `['billing', 'preview', maLuotKham]`, `['billing', 'invoice', id]` | Dùng `useState` (`0` React Query); không bảo vệ auth & thiếu `<Sidebar />`; gọi `POST /billing/calculate/:examId` hiển thị cả `tienKham` + `tienGiuong`; không cho chọn `THE_BHYT`; hardcode `nhanVienThu = "NV_TN_01"`; chốt thanh toán qua nút mô phỏng `webhook/vietqr` | **FAIL** |
| **`(admin)`** ([admin/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28admin%29/admin/page.tsx)) & **`/`** ([app/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/page.tsx)) | Quản lý `KHOA`, `PHONG`, `GIUONG_BENH`, `NHAN_VIEN (d,p)`, `THUOC`, `LOAI_XET_NGHIEM`, Dashboard theo `?date=`; Keys: `['departments']`, `['staff']`, `['reports', 'dashboard']` | `app/page.tsx` dùng React Query (`['reports', 'dashboard']`, `['departments', 'list']`, `['beds', 'map']`) nhưng đếm `DANG_SU_DUNG` & `totalInpatients` v1. `admin/page.tsx` **không dùng React Query**, thiếu auth guard/Sidebar, và **chỉ dùng để xếp `LICH_TRUC` (`dutySchedule`)** — phân hệ đã bị loại bỏ ở v2; thiếu hoàn toàn form tạo/sửa Khoa, Phòng, Giường, Nhân viên, Thuốc, Loại XN | **FAIL** |
| **`(pharmacy)`** *(Dư từ v1)* ([pharmacy/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28pharmacy%29/pharmacy/page.tsx)) | *(Không có trong `API_Contract_v2.md`)* | Trang riêng cho Kho dược & `dispense` trừ `SoLuongTon`; thiếu auth guard & `<Sidebar />` | **EXTRA (v1)** |

---

## 6. Mức Độ Phản Ánh 13 Quy Tắc (`BR-V2-01`..`13`) & 6 Thuộc Tính Dẫn Xuất Trên Frontend

1. **6 Thuộc tính dẫn xuất trên UI:** **`0/6` PASS**
   - Không hiển thị `NHAN_VIEN.SoNamCongTac` (tại `/`, `/admin`, `/login`), không hiển thị `BENH_NHAN.Tuoi` (tại `/reception`, `/clinical`, `/inpatient`), không tính/hiển thị chuẩn `DON_THUOC.TongTienThuoc`, và tại `/cashier` vẫn hiển thị cấu trúc `TongTienGoc / TienBHYTChiTra / TienBenhNhanTra` kèm `tienKham + tienGiuong` của `HOA_DON` v1 thay vì `TongTienThuoc + TongTienDichVu - TruBHYT = ThucThu` (`VIEN_PHI` v2).
2. **13 Nhóm Quy tắc (`BR-V2-01`..`13`):**
   - **PARTIAL (`3/13`):**
     - `BR-V2-03`: [inpatient/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28inpatient%29/inpatient/page.tsx#L478-L485) có xử lý hiển thị thông báo conflict khi phân giường đồng thời (`Serializable`), nhưng UI không có chọn khoảng ngày `[TuNgay, DenNgay)` theo `MaDotNT` và không có màn hình xuất viện đóng phân giường.
     - `BR-V2-05`: [clinical/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28clinical%29/clinical/page.tsx) và [cashier/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28cashier%29/cashier/page.tsx) thao tác 1 đơn/1 hóa đơn theo `MaLuotKham`, nhưng trang thu ngân vẫn hiển thị `tienGiuong` trong chi tiết tính phí lượt khám (trái v2).
     - `BR-V2-06`: [clinical/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28clinical%29/clinical/page.tsx#L596-L598) chặn kê đơn rỗng (`draftItems.length === 0`) và số lượng thuốc `> 0`, nhưng thiếu hoàn toàn phần nhập/kiểm tra `THE_BHYT` (`NgayHetHan >= NgayBatDau`, `MucHuong` `[0..1]`).
   - **FAIL (`10/13`):** `BR-V2-01` (thiếu `KY_THUAT_VIEN`/`TIEP_NHAN` & form nhân sự disjoint), `BR-V2-02` (`DOT_NOI_TRU` & `NgayRaVien`), `BR-V2-04` (`MaDotNT` trên `LUOT_KHAM`), `BR-V2-07` (`PHIEU_XET_NGHIEM` 2 bước `start`/`complete` + `NgayGioTraKQ >= NgayGioXN`), `BR-V2-08` (chọn 1 `THE_BHYT` còn hạn & khóa UI sửa/xóa chi phí khi `DA_THANH_TOAN`), `BR-V2-09` (tự tạo `BN_NGOAI_TRU` ở `reception`), `BR-V2-10` (chưa đọc `ruleCode` lỗi DB/BE), `BR-V2-11` (trộn `DANG_SU_DUNG` vào `TrangThaiGiuong` thay vì chọn ngày `date` suy diễn từ `PHAN_GIUONG`), `BR-V2-12` (chưa hỗ trợ đa đợt nội trú lịch sử), `BR-V2-13` (không có UI sửa/xóa chi phí trước thanh toán & cảnh báo kiểm tra lại `TruBHYT`).

---

## 7. Kết Luận & Lộ Trình Cập Nhật Frontend Lên v2

Frontend hiện tại biên dịch sạch (`tsc` exit 0), lint pass (`8` warnings code thừa) và phục vụ đầy đủ giao diện cho **bản v1**, nhưng **chưa hỗ trợ bất kỳ thay đổi kiến trúc nào của bộ tài liệu v2**. Đề xuất lộ trình nâng cấp theo 4 bước sau khi Backend/DB v2 hoàn tất:

1. **Đồng bộ Types, Enums & API Layer (Ưu tiên 1):**
   - Viết lại [types/index.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/types/index.ts) khớp đúng 18 interfaces + 6 trường dẫn xuất + các enum v2 tại Mục 3 của [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md).
   - Cập nhật [hospitalApi.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/services/hospitalApi.ts) bỏ `dutySchedule` và `dispense`, thay các endpoint v1 sang đúng path/payload v2 (`THE_BHYT`, `lab-types`, `lab-requests/start|complete`, `inpatient/admissions|bed-allocations|discharge`, `billing/preview`, `billing/invoices/:id/pay`, `beds/map?date=...`), bỏ toàn bộ giá trị hardcode fallback (`"BS01"`, `"P01"`, `"DD01"`, `"NV_TN_01"`, `80`).
   - Cập nhật [lib/api.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/lib/api.ts) đọc và hiển thị `ruleCode` (`BR-V2-xx`) từ phản hồi lỗi.
2. **Chuẩn hóa RBAC, Bảo vệ Route & Dọn code thừa (Ưu tiên 2):**
   - Cập nhật `RoleEnum` & [Sidebar.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/components/layout/Sidebar.tsx) thêm `KY_THUAT_VIEN`, `TIEP_NHAN`; bỏ `NV_HANH_CHINH`, `DUOC_SI`, `QUAN_TRI` và route `/pharmacy`.
   - Bổ sung `<Sidebar />` và route/role guard thống nhất cho **tất cả** trang (đặc biệt [cashier/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28cashier%29/cashier/page.tsx) và [admin/page.tsx](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/app/%28admin%29/admin/page.tsx)); xóa `NAV_GROUPS`, `_ROLE_LABELS`, `_SidebarContent` dư gây 8 cảnh báo ESLint.
3. **Nâng cấp Nghiệp vụ UI theo `BR-V2-01..13` & React Query v2 (Ưu tiên 3):**
   - Áp dụng `useQuery`/`useMutation` với đúng Query Keys Mục 6 và tích hợp `react-hook-form` + `zod` cho form nhập liệu.
   - `(reception)`: tách địa chỉ 3 phần, thêm quản lý thẻ `THE_BHYT` (`MucHuong` `[0,1]`), bỏ `isNgoaiTru`, thêm đăng ký `LUOT_KHAM`.
   - `(clinical)` & `(laboratory)`: hỗ trợ gắn `MaDotNT`, sửa/xóa đơn thuốc trước thanh toán, khóa thao tác khi `DA_THANH_TOAN`; tách quy trình XN 2 bước (`start` / `complete`) cho `KY_THUAT_VIEN`.
   - `(inpatient)` & `(cashier)` & `(admin)`: lọc sơ đồ giường theo `?date=`, tách `GIUONG_BENH.TrangThai` khai thác vs đang nằm, thêm xuất viện `discharge`, chọn 1 `THE_BHYT` còn hạn ở thu ngân, và thay thế màn hình xếp lịch trực ở `/admin` bằng CRUD `KHOA`, `PHONG`, `GIUONG_BENH`, `NHAN_VIEN`, `THUOC`, `LOAI_XET_NGHIEM`.
4. **Kiểm thử tự động Frontend v2 (Ưu tiên 4):**
   - Cập nhật [test-frontend-deep.mjs](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/scripts/test-frontend-deep.mjs) hoặc bổ sung Playwright/Vitest kiểm thử luồng v2 end-to-end trên UI (đặc biệt khóa `DA_THANH_TOAN`, chọn thẻ BHYT hợp lệ, sơ đồ giường theo ngày và RBAC `KY_THUAT_VIEN`/`TIEP_NHAN`).
