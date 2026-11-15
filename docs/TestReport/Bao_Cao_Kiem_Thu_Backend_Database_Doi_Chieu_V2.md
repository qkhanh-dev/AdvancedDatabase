# BÁO CÁO KIỂM THỬ SÂU BACKEND & DATABASE ĐỐI CHIẾU TÀI LIỆU v2

- **Dự án:** Hệ Thống Quản Lý Bệnh Viện (QLBV)
- **Ngày kiểm thử:** `16/11/2026`
- **Phạm vi kiểm tra:**
  - **Backend:** [app.module.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/app.module.ts), [main.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/main.ts), tầng `common/` (RBAC, Guards, Exception Filters), 11 module nghiệp vụ dưới `backend/src/modules/`, [billing.service.spec.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/billing/billing.service.spec.ts), [hospital-deep-test.e2e-spec.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/test/hospital-deep-test.e2e-spec.ts).
  - **Database:** [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma), [seed.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/seed.ts), [docker-compose.yml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docker-compose.yml), và CSDL đang chạy `hospital_db` trên `PostgreSQL 18.6` (`localhost:5432`).
- **Tài liệu chuẩn đối chiếu (v2):**
  - [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml)
  - [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml)
  - [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt)
  - [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md)
  - [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md)

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

> [!WARNING]
> **Kết luận chung: BACKEND VÀ DATABASE HIỆN TẠI VẪN ĐANG Ở KIẾN TRÚC v1 (19 BẢNG) — CHƯA ĐỒNG BỘ VỚI ĐẶC TẢ v2 (18 BẢNG · 103 CỘT · 20 FK · 13 NHÓM QUY TẮC).**
> Codebase hiện biên dịch sạch (`tsc` pass) và chạy pass bộ unit test cũ (với mock v1), nhưng nếu đối chiếu trực tiếp với bộ tài liệu v2 mới, đa số bảng, cột, khóa ngoại, quy tắc toàn vẹn và endpoint API đều **CHƯA PASS** hoặc chỉ **ĐẠT MỘT PHẦN** về mặt logic nghiệp vụ cơ sở.

### Bảng Tổng Hợp Trạng Thái PASS / CHƯA PASS So Với Docs v2

| Hạng mục kiểm thử | Chỉ tiêu chuẩn v2 | Kết quả thực tế (BE + DB) | Tỷ lệ / Trạng thái |
| :--- | :--- | :--- | :---: |
| **Biên dịch TypeScript (`tsc --noEmit`)** | Build sạch không lỗi | `EXIT: 0` (không lỗi type trên code v1 hiện tại) | **PASS** (trên code v1) |
| **Jest Unit Test (`npm test`)** | Phủ logic tính tiền / quy tắc v2 | `2/2 passed` trong `billing.service.spec.ts`, nhưng mock theo `BR03` v1 (`HOA_DON`, `tienKham=50k`, `MucHuongBHYT=80`) | **PARTIAL** (v1 pass, v2 chưa có test) |
| **Hệ quản trị & Prisma Migrate** | SQL Server DDL tham chiếu (`NVARCHAR`, `DATETIME2(3)`) + kiểm chứng DDL | Đang chạy `PostgreSQL 18.6` (`hospital_db`); `MSSQLSERVER` `Stopped`; `prisma/migrations` rỗng (`migrate status` exit `1`) | **FAIL** |
| **Số lượng Bảng** | **18 bảng** chuẩn v2 | **19 bảng** v1: **11** bảng trùng tên (chỉ 1 bảng đủ cột v2), **7 bảng v2 thiếu hoàn toàn**, **8 bảng v1 dư/đã bỏ** | **FAIL** (`11/18` trùng tên, `0/18` khớp hoàn toàn) |
| **Số lượng Cột lưu trữ** | **103 cột** | `134` cột v1; chỉ **37/103** khớp đúng tên cột v2 (`35.9%`), **66/103** thiếu hoặc đổi tên | **FAIL** |
| **20 Khóa ngoại (`FK01`–`FK20`)** | 20 FK đều `ON DELETE NO ACTION / ON UPDATE NO ACTION` | **6/20 PASS** (`FK01–03, FK09, FK12, FK19`); **2/20 PARTIAL** (`FK04, FK05` sai `DELETE CASCADE`); **12/20 FAIL/THIẾU** | **FAIL** (`6/20` đạt chuẩn) |
| **6 Thuộc tính dẫn xuất (`VIEW / Query`)** | `SoNamCongTac`, `Tuoi`, `DON_THUOC.TongTienThuoc`, `VIEN_PHI.(TongTienDichVu, TongTienThuoc, ThucThu)` | Trong DB: **`0 VIEW`**; trong BE: `0/6` PASS đầy đủ (`4 FAIL`, `2 PARTIAL` vì cộng lệch tên/công thức v1) | **FAIL** |
| **Ràng buộc DB (DDL / Trigger / CHECK / Index)** | Thực thi đủ `CHECK`, Trigger, Filtered Unique Index (`BR-V2-10, 12`) | Live DB PostgreSQL có **`0` triggers**, **`0` CHECK constraints**, **`0` partial unique indexes**, **`0` file `.sql` DDL** | **FAIL** |
| **13 Nhóm Quy tắc (`BR-V2-01`..`13`)** | Tuân thủ đủ 13 nhóm quy tắc | **0/13 PASS hoàn toàn** · **4/13 PARTIAL** (`BR-V2-03, 05, 06, 08`) · **9/13 FAIL** (`BR-V2-01, 02, 04, 07, 09, 10, 11, 12, 13`) | **FAIL** |
| **RBAC & Error Contract v2** | Roles `(d, p)` gồm `KY_THUAT_VIEN`, `TIEP_NHAN` (bỏ `NV_HANH_CHINH`) + `ruleCode` | `Role` enum thiếu `KY_THUAT_VIEN`, `TIEP_NHAN`, vẫn giữ `NV_HANH_CHINH`; filter chưa trả `ruleCode` | **FAIL** |
| **38 Endpoint theo `API_Contract_v2.md`** | 38 API mục `5.1`–`5.10` | **1 PASS** (`login`) · **13 PARTIAL** · **9 lệch path/method/model** · **15 MISSING** (+ BE vẫn giữ **7 API v1 đã loại bỏ**) | **FAIL** |

---

## 2. Kết Quả Thực Thi Kiểm Chứng Trực Tiếp (Runtime & Live DB)

### 2.1. Kết quả chạy lệnh trên Backend (`backend/`)
1. **TypeScript typecheck (`cmd /c "npx tsc --noEmit"`):**
   - **PASS** (`EXIT: 0`), không có lỗi biên dịch TypeScript.
2. **Jest Unit Tests (`cmd /c "npm test -- --no-coverage"`):**
   - **PASS về mặt thực thi (`1 passed, 1 total` suite; `2 passed, 2 total` tests, `5.822 s`)** trên file [billing.service.spec.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/billing/billing.service.spec.ts).
   - **Giới hạn đối chiếu v2:** File spec này mock `PrismaService.luotKham.findUnique` và kiểm tra công thức **v1 (`BR03`)**: `tienKham = 50000`, `tienThuoc = 100000`, `tienDichVu = 50000`, `MucHuongBHYT = 80%` trên `(tienKham + tienDichVuBHYT)`. Chưa có bất kỳ unit test hay e2e test nào kiểm thử các bảng/quy tắc v2 (`VIEN_PHI`, `THE_BHYT`, `PHIEU_XET_NGHIEM`, `DOT_NOI_TRU`, `BR-V2-01..13`).
   - *Lưu ý:* Bộ E2E test cũ [hospital-deep-test.e2e-spec.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/test/hospital-deep-test.e2e-spec.ts) (1012 dòng, gồm 11 nhóm `describe`) toàn bộ được viết cho API/schema v1 (như `/api/patients/reception`, `/api/services/assign`, `/api/duty-schedules`, `/api/inpatient/admit`, `/api/prescriptions/:id/dispense`, `/api/billing/calculate/:examId`). Vì kiểm thử lần này không làm thay đổi dữ liệu vận hành hiện có trong `hospital_db`, chỉ kiểm tra cấu trúc và mã nguồn E2E thay vì chạy ghi đè dữ liệu E2E v1 vào DB.
3. **Prisma Migrate Status (`cmd /c "npx prisma migrate status"`):**
   - **EXIT: 1** — Thông báo: `No migration found in prisma/migrations` và `The current database is not managed by Prisma Migrate`. Toàn bộ thư mục `backend/prisma/` không có lịch sử migration và toàn repo không có file `.sql` DDL nào.

### 2.2. Kiểm tra dịch vụ & trạng thái Live Database (`hospital_db`)
- **Dịch vụ Windows & Cổng mạng đang lắng nghe:**
  - `postgresql-x64-18`: **Running** (cổng `5432` đang mở), backend lắng nghe cổng `3001`, frontend cổng `3000`.
  - `MSSQLSERVER` / `SQLBrowser`: **Stopped** (chưa khởi tạo SQL Server cho DDL tham chiếu v2).
- **Kết quả truy vấn trực tiếp `PostgreSQL 18.6 on x86_64-windows` (`hospital_db`, schema `public`):**
  - Tổng số bảng thực tế: **`19` bảng**, **`134` cột**, **`25` khóa ngoại**, **`37` index** (toàn bộ là PK hoặc Unique do Prisma sinh).
  - Số `VIEW`: **`0`**.
  - Số `TRIGGER`: **`0`**.
  - Số `CHECK CONSTRAINT` nghiệp vụ (ngoài `NOT NULL`): **`0`**.
  - Số `PARTIAL UNIQUE INDEX` (`WHERE ...`): **`0`**.
  - Số liệu bản ghi hiện có trong các bảng **đã bị loại bỏ ở v2**: `NV_HANH_CHINH (2)`, `BN_NGOAI_TRU (4)`, `BN_NOI_TRU (5)`, `CT_DON_THUOC (1)`, `DICH_VU (3)`, `SU_DUNG_DV (11)`, `HOA_DON (1)`, `LICH_TRUC (2)`. Các bảng còn lại: `KHOA (2)`, `PHONG (5)`, `GIUONG_BENH (14)`, `NHAN_VIEN (5)`, `BAC_SI (2)`, `DIEU_DUONG (1)`, `BENH_NHAN (8)`, `LUOT_KHAM (3)`, `PHAN_GIUONG (5)`, `DON_THUOC (1)`, `THUOC (3)`.
  - Trong 25 FK thực tế tại PostgreSQL: `20` FK có `delete_rule = NO ACTION`, còn **`5` FK bảng con chuyên môn đang là `delete_rule = CASCADE`** (`BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`, `BN_NGOAI_TRU`, `BN_NOI_TRU`), vi phạm chính sách `ON DELETE NO ACTION` của v2.

---

## 3. Đối Chiếu Chi Tiết Tầng Database (`schema.prisma` & `hospital_db` vs Schema 02 v2)

### 3.1. Hiện trạng 18 Bảng chuẩn v2 và 8 Bảng v1 cần loại bỏ

1. **7 bảng v2 HOÀN TOÀN CHƯA TỒN TẠI (`FAIL`):**
   - `KY_THUAT_VIEN` (`MaNV`, `ChuyenMonXetNghiem`, `BTD_ThietBiPhuTrach`)
   - `DOT_NOI_TRU` (`MaDotNT`, `MaBN`, `NgayNhapVien`, `NguoiNhaLienHe`, `TinhTrangNhapVien`, `NgayRaVien`)
   - `THE_BHYT` (`MaTheBHYT`, `MaBN`, `MucHuong`, `NgayBatDau`, `NgayHetHan`)
   - `CHI_TIET_DON_THUOC` (BE/DB đang đặt tên `CT_DON_THUOC` và dùng tên cột v1)
   - `LOAI_XET_NGHIEM` (`MaLoaiXN`, `TenXN`, `ChiTieuBinhThuong`, `DonGia`)
   - `PHIEU_XET_NGHIEM` (`MaPhieuXN`, `MaLuotKham`, `MaLoaiXN`, `MaNV_KTV`, `NgayGioXN`, `NgayGioTraKQ`, `KetQua`, `DanhGia`, `DonGiaXN`)
   - `VIEN_PHI` (`MaHoaDon`, `MaLuotKham`, `NgayLap`, `HinhThucThanhToan`, `TruBHYT`, `TrangThaiThanhToan`)

2. **8 bảng v1 ĐÃ LOẠI BỎ ở v2 nhưng VẪN TỒN TẠI (`FAIL`):**
   - `NV_HANH_CHINH`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `CT_DON_THUOC`, `DICH_VU`, `SU_DUNG_DV`, `HOA_DON`, `LICH_TRUC`.

3. **Đối chiếu cột cho 11 bảng trùng tên giữa v2 và [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma):**

| Bảng v2 | Số cột v2 / Prisma | Khớp đúng tên cột | Cột v2 bị THIẾU / ĐỔI TÊN trong Prisma | Cột v1 DƯ THỪA trong Prisma | Đánh giá |
| :--- | :---: | :---: | :--- | :--- | :---: |
| `NHAN_VIEN` | `9 / 13` | **9/9** | *(Không thiếu tên cột; lưu ý v2 dùng `DATE`, `NVARCHAR`)* | `Email`, `HeSoLuong`, `LoaiNV`, `MatKhau` *(auth)* | **PARTIAL** |
| `BAC_SI` | `4 / 5` | **2/4** (`MaNV`, `ChuyenKhoa`) | `TrinhDoHocVan`, `SoChungChiHanhNghe` | `HocVi`, `SoCCHN`, `PhuCapKham` | **FAIL** |
| `DIEU_DUONG` | `3 / 4` | **1/3** (`MaNV`) | `CapBac`, `ChungChiHanhNghe` | `TrinhDoChuyenMon`, `SoCCHN_DD`, `PhuCapTruc` | **FAIL** |
| `BENH_NHAN` | `10 / 12` | **6/10** (`MaBN`, `HoTen`, `NgaySinh`, `GioiTinh`, `CCCD`, `NhomMau`) | `SDT`, `DiaChi_Duong`, `DiaChi_Phuong`, `DiaChi_Quan` | `SoDienThoai`, `SoBHYT`, `MucHuongBHYT`, `DiaChi`, `CoNgoaiTru`, `CoNoiTru` | **FAIL** |
| `KHOA` | `4 / 6` | **2/4** (`MaKhoa`, `TenKhoa`) | `DiaDiem`, `SoDienThoai` | `ViTri`, `SoDienThoaiKhoa`, `MaTruongKhoa`, `NgayBoNhiem` | **FAIL** |
| `PHONG` | `5 / 6` | **3/5** (`MaPhong`, `MaKhoa`, `LoaiPhong`) | `TenPhong`, `ViTri` | `SoPhong`, `Tang`, `SucChuaToiDa` | **FAIL** |
| `GIUONG_BENH` | `6 / 6` | **5/6** (`MaGiuong`, `MaPhong`, `SoGiuong`, `LoaiGiuong`, `DonGiaNgay`) | `TrangThai` *(khai thác)* | `TrangThaiGiuong` *(trộn `DANG_SU_DUNG`)* | **FAIL** |
| `LUOT_KHAM` | `9 / 13` | **4/9** (`MaLuotKham`, `MaBN`, `TrieuChung`, `ChanDoanSoBo`) | `MaNV_BacSi`, `NgayGioKham`, `LyDoKham`, `TrangThai`, `MaDotNT` | `ThoiGianKham`, `HuyetAp`, `NhietDo`, `Mach`, `ChanDoanXacDinh`, `HuongXuTri`, `NgayTaiKham`, `MaBS`, `MaPhongKham` | **FAIL** |
| `PHAN_GIUONG` | `4 / 6` | **1/4** (`MaGiuong`) | `MaDotNT`, `TuNgay` (`DATE`), `DenNgay` (`DATE`) | `MaBN`, `NgayBatDau` (`DateTime`), `NgayKetThuc`, `GiaGiuongNgay`, `GhiChuChuyenGiuong` | **FAIL** |
| `DON_THUOC` | `4 / 5` | **1/4** (`MaLuotKham`) | `MaDonThuoc`, `NgayKeDon` (`DATE`), `LoiDanCuaBacSi` | `MaDon`, `NgayGioKe`, `LoiDanBacSi`, `TrangThaiPhatThuoc` | **FAIL** |
| `THUOC` | `7 / 8` | **3/7** (`MaThuoc`, `TenThuoc`, `DonViTinh`) | `HoatChat`, `HamLuong`, `DonGia`, `HuongDanSD` | `HoatChatChinh`, `DonGiaHienHanh`, `SoLuongTon`, `NuocSanXuat`, `HanSuDung` | **FAIL** |

- **Tổng hợp cột lưu trữ:** **`37 / 103`** cột trùng tên (`35.9%`), **`66 / 103`** thiếu hoặc lệch cấu trúc/kiểu.

### 3.2. Kiểm tra 20 Khóa ngoại (`FK01`–`FK20`) & Chính sách `NO ACTION`

- **PASS (`6/20`):** `FK01` (`PHONG.MaKhoa -> KHOA.MaKhoa`), `FK02` (`GIUONG_BENH.MaPhong -> PHONG.MaPhong`), `FK03` (`NHAN_VIEN.MaKhoa -> KHOA.MaKhoa`), `FK09` (`LUOT_KHAM.MaBN -> BENH_NHAN.MaBN`), `FK12` (`DON_THUOC.MaLuotKham -> LUOT_KHAM.MaLuotKham`), `FK19` (`PHAN_GIUONG.MaGiuong -> GIUONG_BENH.MaGiuong`) — đúng cả cột tham chiếu và `onDelete: NoAction, onUpdate: NoAction`.
- **PARTIAL (`2/20`):** `FK04` (`BAC_SI.MaNV -> NHAN_VIEN.MaNV`) và `FK05` (`DIEU_DUONG.MaNV -> NHAN_VIEN.MaNV`) — khớp cột nhưng trong [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma#L184-L198) và PostgreSQL đang cài **`onDelete: Cascade`**, trái với `ON DELETE NO ACTION` của [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml).
- **FAIL / THIẾU (`12/20`):** `FK06` (`KY_THUAT_VIEN`), `FK07` (`DOT_NOI_TRU`), `FK08` (`THE_BHYT`), `FK10` (`LUOT_KHAM.MaNV_BacSi` — BE dùng `MaBS`), `FK11` (FK ghép `LUOT_KHAM(MaDotNT, MaBN) -> DOT_NOI_TRU(MaDotNT, MaBN)`), `FK13` & `FK14` (`CHI_TIET_DON_THUOC`), `FK15`–`FK17` (`PHIEU_XET_NGHIEM`), `FK18` (`PHAN_GIUONG.MaDotNT`), `FK20` (`VIEN_PHI.MaLuotKham`).

### 3.3. Kiểm tra 6 Thuộc tính Dẫn xuất (`VIEW / Query`)

| STT | Thuộc tính dẫn xuất v2 | Tình trạng DB (`VIEW`) | Tình trạng Backend (`Service`) | Kết quả |
| :---: | :--- | :---: | :--- | :---: |
| 1 | `NHAN_VIEN.SoNamCongTac` | Không có VIEW | `AuthService.getProfile` & `StaffService` trả thẳng entity `nhanVien`, **không tính** `SoNamCongTac` | **FAIL** |
| 2 | `BENH_NHAN.Tuoi` | Không có VIEW | `PatientService.lookup` & `getAllPatients` **không tính** `Tuoi` | **FAIL** |
| 3 | `DON_THUOC.TongTienThuoc` | Không có VIEW | `PrescriptionService.getPrescriptionById` **không tính** `TongTienThuoc` | **FAIL** |
| 4 | `VIEN_PHI.TongTienDichVu` | Không có VIEW | `BillingService.calculateFee` tính từ `SU_DUNG_DV` **không lọc `NgayGioXN IS NOT NULL`** (lại dùng tên `tienDichVu` và cộng thêm `tienKham = 50000`, `tienGiuong`) | **FAIL** |
| 5 | `VIEN_PHI.TongTienThuoc` | Không có VIEW | `BillingService.calculateFee` có cộng `DonGiaBan * SoLuong` từ `CT_DON_THUOC`, nhưng trên schema v1 và tên field `chiTiet.tienThuoc` | **PARTIAL** |
| 6 | `VIEN_PHI.ThucThu` | Không có VIEW | `BillingService` & bảng `HOA_DON` dùng tên `TienBenhNhanTra`, lưu cứng cột vật lý thay vì dẫn xuất, và công thức có cộng `tienKham` + `tienGiuong`, chỉ giảm BHYT trên `(tienKham + tienDichVuBHYT)` | **PARTIAL** |

---

## 4. Đối Chiếu Chi Tiết 13 Nhóm Quy Tắc (`BR-V2-01` .. `BR-V2-13`)

| Mã quy tắc | Tên quy tắc (v2) | Cái đã có / PASS (theo hướng v1) | Cái CHƯA PASS / Vi phạm so với v2 (kèm bằng chứng) | Kết quả |
| :--- | :--- | :--- | :--- | :---: |
| **BR-V2-01** | Chuyên biệt hóa Nhân sự `(d, p)` | `BAC_SI` và `DIEU_DUONG` dùng `MaNV` là PK + FK tới `NHAN_VIEN`. | Không có `KY_THUAT_VIEN`; vẫn còn `NV_HANH_CHINH`; `NHAN_VIEN.LoaiNV` dùng enum v1; không có trigger/check disjoint giữa các bảng con; `StaffController` chưa có `POST /api/staff`; `FK04/05` dùng `Cascade`. | **FAIL** |
| **BR-V2-02** | Đợt nội trú `DOT_NOI_TRU` | `InpatientStayService.admitPatient` kiểm tra `MaBSTheoDoi` và cho phép tạo hồ sơ nội trú. | Vẫn dùng `BN_NOI_TRU` (PK `MaBN`, 1-1 vĩnh viễn với `BENH_NHAN`, không có `MaDotNT`, không lưu được nhiều đợt qua các lần nhập viện); không có `CHECK (NgayRaVien IS NULL OR NgayRaVien >= NgayNhapVien)` và chưa có API xuất viện (`discharge`). | **FAIL** |
| **BR-V2-03** | Phân giường `[TuNgay, DenNgay)` & chống trùng | [inpatient-stay.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/inpatient-stay/inpatient-stay.service.ts#L62-L243) đã dùng `Serializable` + `SELECT ... FOR UPDATE` trên `GIUONG_BENH` khi `assignBed` và `transferBed`. | Phân giường theo `MaBN` (`BN_NOI_TRU`) và `DateTime`, không theo `MaDotNT` và `DATE` nửa mở `[TuNgay, DenNgay)`; không kiểm tra `DenNgay > TuNgay`, `TuNgay >= NgayNhapVien`, giao khoảng lịch sử khi nhập/sửa ngày; chưa có đóng các phân giường mở trong cùng transaction cập nhật `NgayRaVien`; không có trigger DB. | **PARTIAL** |
| **BR-V2-04** | Lượt khám ngoại/nội trú & `FK11` ghép | `LUOT_KHAM` có `FK09` tới `BENH_NHAN` và `MaBN NOT NULL`. | `LUOT_KHAM` dùng `MaBS` và `MaPhongKham`, thiếu hoàn toàn `MaDotNT`, `UQ(MaDotNT, MaBN)` ở `DOT_NOI_TRU`, `FK11` ghép `(MaDotNT, MaBN)`, và logic kiểm tra `NgayGioKham` nằm trong khung đợt nội trú. | **FAIL** |
| **BR-V2-05** | Quan hệ `1 – 0..1` của `DON_THUOC` & `VIEN_PHI` | [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma#L303) cài `@unique` cho `DON_THUOC.MaLuotKham` & `HOA_DON.MaLuotKham`; [prescription.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/prescription/prescription.service.ts#L21-L23) và [billing.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/billing/billing.service.ts#L110-L115) đều chặn lập lần 2. | Chưa chuyển `HOA_DON` -> `VIEN_PHI`; nghiêm trọng hơn, [billing.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/billing/billing.service.ts#L68-L76) tự cộng **tiền giường `PHAN_GIUONG`** của `bnNoiTru` vào hóa đơn lượt khám — trái phạm vi chỉ tính theo lượt khám của `BR-V2-05` & `BR-V2-08`. | **PARTIAL** |
| **BR-V2-06** | Đơn thuốc >= 1 dòng, `DonGia >= 0`, `THE_BHYT`, 1 CCHN ĐD | [create-prescription.dto.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/prescription/dto/create-prescription.dto.ts#L11-L14) check `@IsPositive()` trên `soLuong`; [prescription.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/prescription/prescription.service.ts#L25-L27) chặn `items.length === 0`; `DIEU_DUONG` chỉ lưu 1 CCHN (`SoCCHN_DD`). | Thiếu bảng `THE_BHYT` (`NgayHetHan >= NgayBatDau`, `MucHuong` `[0..1]`); trong DB có `0` `CHECK` constraint cho `SoLuong > 0` hay đơn giá `>= 0`; chưa có API `PATCH/DELETE` chi tiết đơn giữ tối thiểu 1 dòng. | **PARTIAL** |
| **BR-V2-07** | Trạng thái nhất quán `PHIEU_XET_NGHIEM` | [clinical-service.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/clinical-service/clinical-service.service.ts#L46-L88) có kiểm tra tồn tại KTV (`DIEU_DUONG`) khi cập nhật `KetQuaCLS`. | Không có `PHIEU_XET_NGHIEM` & `LOAI_XET_NGHIEM` (đang dùng `SU_DUNG_DV` trỏ vào `DIEU_DUONG`); thiếu `NgayGioXN`, `NgayGioTraKQ`, `DanhGia`; không có luồng 2 bước `start`/`complete` trong transaction; không kiểm tra `NgayGioTraKQ >= NgayGioXN`. | **FAIL** |
| **BR-V2-08** | Giá lịch sử, `TruBHYT` & Khóa sau thanh toán | Snapshot giá lịch sử đã làm ở `CT_DON_THUOC.DonGiaBan` ([prescription.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/prescription/prescription.service.ts#L51)) và `SU_DUNG_DV.DonGiaDV` ([clinical-service.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/clinical-service/clinical-service.service.ts#L37)). | **(1)** Sai công thức BHYT: dùng `BENH_NHAN.MucHuongBHYT` (int `80/95/100`), không chọn 1 `THE_BHYT` còn hạn tại ngày khám, không giảm trên thuốc và tính cả `tienKham + tienGiuong`; **(2)** **KHÔNG khóa chi phí sau thanh toán**: `createPrescription`, `assignService`, `updateResult` đều **không kiểm tra `HOA_DON.TrangThaiTT === 'DA_THANH_TOAN'`**; **(3)** `handleVietQrWebhook` cập nhật trạng thái thanh toán không dùng lock đồng bộ với thao tác sửa chi phí. | **PARTIAL** |
| **BR-V2-09** | Dẫn xuất nhân sự/BN & không giữ `BN_NGOAI_TRU` | *(Không có điểm đạt)* | Vẫn còn bảng `BN_NGOAI_TRU`, cờ `CoNgoaiTru` ở `BENH_NHAN`, `PatientService.reception` tự chèn dòng vào `BN_NGOAI_TRU` ([patient.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/patient/patient.service.ts#L45-L54)); chưa có `Tuoi` & `SoNamCongTac`. | **FAIL** |
| **BR-V2-10** | Thực thi DDL, Constraint, Trigger thực tế | PK, FK, Unique index cơ bản đã tạo trên PostgreSQL qua Prisma. | Không có bất kỳ file DDL `.sql` nào; DB thực tế có **`0` triggers, `0` CHECK constraints, `0` views**; không có test chứng minh constraint liên bảng ở tầng DB. | **FAIL** |
| **BR-V2-11** | Tách bạch `GIUONG_BENH.TrangThai` & chiếm giường | *(Không có điểm đạt)* | `GIUONG_BENH.TrangThaiGiuong` vẫn dùng `'DANG_SU_DUNG'` lẫn với `'TRONG'`, `'BAO_TRI'`; `assignBed`/`transferBed` cập nhật tay trạng thái giường và `ReportService` đếm `TrangThaiGiuong = 'DANG_SU_DUNG'` thay vì suy diễn theo ngày từ `PHAN_GIUONG`. | **FAIL** |
| **BR-V2-12** | Tối đa 1 đợt nội trú mở & không chồng khoảng | `BN_NOI_TRU` dùng `MaBN` làm PK nên hiện tại chỉ tạo được 1 hồ sơ nội trú/bệnh nhân. | Thiếu `DOT_NOI_TRU`, thiếu Filtered Unique Index `UNIQUE (MaBN) WHERE NgayRaVien IS NULL` (`nonUniqueOrPartialIndexes = []`), thiếu lock theo `MaBN` và kiểm tra giao khoảng `[NgayNhapVien, NgayRaVien + 1)`. | **FAIL** |
| **BR-V2-13** | Kiểm tra lại `TruBHYT` khi đổi chi phí trước TT | *(Không có điểm đạt)* | Chưa có cột `VIEN_PHI.TruBHYT`, chưa có các API sửa/xóa đơn thuốc, phiếu XN hay chuyển `MaDotNT`/`MaLuotKham`, và chưa có logic kiểm tra lại `0 <= TruBHYT <= TongTienThuoc + TongTienDichVu` với khóa đồng bộ. | **FAIL** |

---

## 5. Đối Chiếu RBAC, Error Contract & 38 API Endpoints (`API_Contract_v2.md`)

### 5.1. RBAC (`Role` Enum, `RolesGuard`) & Cấu Trúc Lỗi Toàn Cục
1. **RBAC theo cây `NHAN_VIEN (d, p)` — `FAIL`:**
   - [role.enum.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/enums/role.enum.ts#L1-L7) chỉ có: `ADMIN`, `BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`, `THU_NGAN`.
   - **Thiếu** 2 vai trò chuẩn v2: `KY_THUAT_VIEN` (cho phòng xét nghiệm `/api/lab-requests`) và `TIEP_NHAN` (cho tiếp đón/BHYT/đăng ký khám).
   - [auth.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/auth/auth.service.ts#L49-L59) và [jwt.strategy.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/auth/jwt.strategy.ts#L44-L50) vẫn suy diễn role từ `NV_HANH_CHINH.BoPhanPhuTrach` và `ChucVuHC`, chứ chưa dùng cây `(d, p)` + `KY_THUAT_VIEN`.
   - Ghi nhận: các quyền hiện hành gán cho `DIEU_DUONG` ở [clinical-service.controller.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/clinical-service/clinical-service.controller.ts#L31-L40) (`PATCH /api/services/result`, `GET /api/services/pending`) cần chuyển sang `KY_THUAT_VIEN` theo v2.
2. **Global Exception Response — `FAIL`:**
   - [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md#L252-L270) yêu cầu chuẩn `{ statusCode, timestamp, path, ruleCode, message }` và trả **`409 Conflict`** cho vi phạm khoảng phân giường, đợt nội trú mở/chồng lấn, disjoint nhân sự, `UQ(MaLuotKham)`, hóa đơn đã thanh toán khóa sửa hoặc `NO ACTION`.
   - Thực tế [http-exception.filter.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/filters/http-exception.filter.ts#L29-L35) trả `{ statusCode, timestamp, path, message }` (thiếu `ruleCode`), các service hầu hết ném `BadRequestException` (`400`) thay vì `409 Conflict` (chỉ có conflict serialize `P2034`/`40001` ở `InpatientStayService` ném `409`), và [prisma-exception.filter.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/filters/prisma-exception.filter.ts#L35-L42) map `P2003` (FK constraint) thành `400 Bad Request` thay vì `409 Conflict`.

### 5.2. Bảng Đối Chiếu 10 Phân Hệ API (v2) & Các API v1 Dư Thừa

Backend hiện có **38 endpoints** trên **11 controller** (vẫn còn `DutyScheduleController` đã bị v2 loại bỏ). Đối chiếu với **38 endpoints đặc tả ở Mục 5.1–5.10** của [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md): **`1 PASS` · `13 PARTIAL` · `9 LỆCH PATH/METHOD/MODEL` · `15 MISSING`**.

| Phân hệ v2 | Endpoint chuẩn v2 | Hiện trạng tại Backend | Kết quả |
| :--- | :--- | :--- | :---: |
| **5.1. Auth** | `POST /api/auth/login` | Có tại [auth.controller.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/auth/auth.controller.ts#L15) (cũng nhận thêm `Email` ngoài `MaNV`/`CCCD`) | **PASS** |
| | `GET /api/auth/profile` | Có nhưng thiếu `SoNamCongTac`, vẫn trả `nvHanhChinh` và cột v1 | **PARTIAL** |
| **5.2. Dept/Room/Bed** | `GET /api/departments` | Có tại [department-room.controller.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/department-room/department-room.controller.ts#L13) nhưng trả schema `KHOA` v1 (có `MaTruongKhoa`, thiếu `DiaDiem`) | **PARTIAL** |
| | `POST /api/departments`, `PATCH /api/departments/:maKhoa` | Không có | **MISSING** |
| | `GET /api/rooms` | BE đặt là `GET /api/rooms/available`, thiếu `TenPhong`/`ViTri` | **CHANGED_PATH** |
| | `POST /api/rooms`, `PATCH /api/rooms/:maPhong` | Không có | **MISSING** |
| | `GET /api/beds/map?date=...` | Có `GET /api/beds/map` nhưng không nhận `?date=`, đọc `TrangThaiGiuong` v1 & `NgayKetThuc: null` | **PARTIAL** |
| | `PATCH /api/beds/:maGiuong/status` | Không có | **MISSING** |
| **5.3. Staff** | `GET /api/staff`, `/doctors`, `/nurses` | Có tại [staff.controller.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/staff/staff.controller.ts#L14-L35) nhưng thiếu `SoNamCongTac`, dùng query `loaiNV` & cột v1 | **PARTIAL** |
| | `GET /api/staff/technicians`, `POST /api/staff` | Không có `KY_THUAT_VIEN` và chưa có API tạo nhân sự kiểm tra `BR-V2-01` | **MISSING** |
| **5.4. Patient & BHYT** | `POST /api/patients` | BE dùng `POST /api/patients/reception`, tự tạo bản ghi `BN_NGOAI_TRU` | **CHANGED_PATH** |
| | `GET /api/patients/lookup?q=...` | Có nhưng tra `SoBHYT` trên `BENH_NHAN`, thiếu `Tuoi`, `theBHYTs`, `DOT_NOI_TRU` | **PARTIAL** |
| | `POST /api/patients/:maBN/insurance-cards`, `GET ...` | Không có bảng và module `THE_BHYT` | **MISSING** |
| **5.5. Examination** | `POST /api/examinations` | Có nhưng thiếu `MaDotNT`, `LyDoKham`, `TrangThai`; bắt buộc `MaPhongKham` & `HuongXuTri` | **PARTIAL** |
| | `PATCH /api/examinations/:id` | BE dùng `PATCH /api/examinations/:id/diagnose`, không cho cập nhật `MaDotNT` | **CHANGED_PATH** |
| | `GET /api/examinations/:id` | Có nhưng trả `donThuoc`/`suDungDvs`/`hoaDon` v1, thiếu trường dẫn xuất | **PARTIAL** |
| **5.6. Prescription** | `GET /api/medicines` | BE đặt là `GET /api/prescriptions/medicines`, trả `SoLuongTon` & giá v1 | **CHANGED_PATH** |
| | `POST /api/prescriptions` | Có tạo `DON_THUOC` + chi tiết, nhưng check `SoLuongTon` v1 và không check khóa `VIEN_PHI` | **PARTIAL** |
| | `PATCH /api/prescriptions/:id`, `DELETE ...` | Không có (BE chỉ có `PATCH /api/prescriptions/:id/dispense` v1 trừ kho) | **MISSING** |
| **5.7. LabTest** | `GET /api/lab-types`, `POST /api/lab-requests` | BE dùng `/api/services` & `/api/services/assign` trên `DICH_VU`/`SU_DUNG_DV` (lệch model & role) | **CHANGED_MODEL** |
| | `PATCH /api/lab-requests/:id/start`, `.../complete` | Không có quy trình 2 bước cho `KY_THUAT_VIEN` (BE gộp `PATCH /api/services/result` cho `DIEU_DUONG`) | **MISSING** |
| **5.8. Inpatient** | `POST /api/inpatient/admissions` | BE dùng `POST /api/inpatient/admit` trên `BN_NOI_TRU` (không tạo `DOT_NOI_TRU`) | **CHANGED_PATH_MODEL** |
| | `POST /api/inpatient/bed-allocations` | BE dùng `POST /api/inpatient/assign-bed` theo `MaBN` + `DateTime` | **CHANGED_PATH_MODEL** |
| | `POST /api/inpatient/transfer-bed` | Có route cùng tên nhưng dùng `MaBN` + `DateTime` + set `BAO_TRI`, thiếu `MaDotNT` & `ngayChuyen` `DATE` | **PARTIAL** |
| | `PATCH /api/inpatient/admissions/:id/discharge` | Không có API đóng đợt nội trú & đóng phân giường đang mở | **MISSING** |
| **5.9. Billing** | `GET /api/billing/preview/:maLuotKham` | BE dùng `POST /api/billing/calculate/:examId` + công thức `BR03` v1 (cộng cả khám & giường) | **CHANGED_METHOD_PATH** |
| | `POST /api/billing/invoices` | Có route cùng tên nhưng lưu `HOA_DON`, thiếu `maTheBHYT` / `TruBHYT` chuẩn v2 | **PARTIAL** |
| | `PATCH /api/billing/invoices/:id/pay` | Không có (BE chỉ có `@Public()` `POST /api/billing/webhook/vietqr` không lock chi phí) | **MISSING** |
| **5.10. Report** | `GET /api/reports/dashboard` | Có route cùng tên nhưng đếm `BN_NOI_TRU`, `TrangThaiGiuong = DANG_SU_DUNG`, doanh thu `HOA_DON` v1 | **PARTIAL** |

- **Các endpoint v1 vẫn đang hoạt động ở Backend nhưng bị loại bỏ / thay thế trong v2 (7 endpoints):**
  - `POST /api/duty-schedules`, `GET /api/duty-schedules`, `PATCH /api/duty-schedules/attendance` (thuộc `DutyScheduleModule` đã bỏ).
  - `PATCH /api/prescriptions/:id/dispense` (trừ tồn kho `SoLuongTon` v1).
  - `POST /api/billing/webhook/vietqr`, `GET /api/billing/invoices/:id/pdf`, `GET /api/billing/invoices/:id` (chưa đặc tả trong `API_Contract_v2.md`, dùng `HOA_DON`).

---

## 6. Kết Luận & Lộ Trình Đồng Bộ Lên v2

Backend và Database hiện tại **hoạt động ổn định ở phiên bản v1**, nhưng **chưa đáp ứng đặc tả v2** trên cả 3 tầng (CSDL, Quy tắc toàn vẹn, API Contract). Để chuyển từ `FAIL/PARTIAL` sang `PASS` đối chiếu v2, cần thực hiện tuần tự 4 bước sau:

1. **Tầng Database (Ưu tiên 1 — `BR-V2-01..13`):**
   - Chốt hệ quản trị mục tiêu (nếu viết SQL Server DDL như Schema 02 thì bật `MSSQLSERVER` và chạy kịch bản DDL; nếu dùng PostgreSQL + Prisma thì thiết lập `prisma/migrations` chuẩn 18 bảng, 103 cột, 20 FK đều `ON DELETE NO ACTION / ON UPDATE NO ACTION`).
   - Loại bỏ 8 bảng v1 (`NV_HANH_CHINH`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `CT_DON_THUOC`, `DICH_VU`, `SU_DUNG_DV`, `HOA_DON`, `LICH_TRUC`) và thêm đủ 7 bảng v2 (`KY_THUAT_VIEN`, `DOT_NOI_TRU`, `THE_BHYT`, `CHI_TIET_DON_THUOC`, `LOAI_XET_NGHIEM`, `PHIEU_XET_NGHIEM`, `VIEN_PHI`).
   - Bổ sung `UQ(MaDotNT, MaBN)` + `FK11` ghép, Filtered Unique Index `DOT_NOI_TRU(MaBN) WHERE NgayRaVien IS NULL`, các `CHECK` constraint, `VIEW` cho 6 thuộc tính dẫn xuất, và trigger/SP chống disjoint nhân sự, trùng khoảng `PHAN_GIUONG`/`DOT_NOI_TRU`, khóa chi phí sau thanh toán.
2. **Tầng RBAC & Error Filter (Ưu tiên 2):**
   - Cập nhật [role.enum.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/enums/role.enum.ts) thêm `KY_THUAT_VIEN`, `TIEP_NHAN` và bỏ `NV_HANH_CHINH`; cập nhật `AuthService`/`JwtStrategy` đọc theo cây `(d, p)`.
   - Chuẩn hóa [http-exception.filter.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/filters/http-exception.filter.ts) & [prisma-exception.filter.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/common/filters/prisma-exception.filter.ts) bổ sung `ruleCode` và mã `409 Conflict` cho vi phạm nghiệp vụ/FK.
3. **Tầng Nghiệp Vụ & API Endpoints v2 (Ưu tiên 3):**
   - Bỏ `DutyScheduleModule` và logic trừ `SoLuongTon`; tách `ClinicalServiceModule` -> `LabTestModule` (`/api/lab-types`, `/api/lab-requests/:id/start|complete`); bổ sung `THE_BHYT`, `POST /api/staff`, `PATCH /api/inpatient/admissions/:id/discharge`, `PATCH/DELETE /api/prescriptions/:id`.
   - Sửa `BillingService`: bỏ `tienKham` và `tienGiuong`, tính `TongTienDichVu` chỉ với `NgayGioXN IS NOT NULL`, chọn tối đa 1 `THE_BHYT` còn hạn tính `TruBHYT`, kiểm tra lại `TruBHYT` khi đổi chi phí trước thanh toán (`BR-V2-13`), và khóa mọi thay đổi khi `VIEN_PHI` đã thanh toán (`BR-V2-08`) bằng cùng cơ chế lock.
4. **Tầng Kiểm Thử Tự Động v2 (Ưu tiên 4):**
   - Viết mới bộ unit test + E2E test phủ đủ `13` quy tắc `BR-V2-01..13` (đặc biệt concurrency `PHAN_GIUONG`, `DOT_NOI_TRU`, khóa `DA_THANH_TOAN` và kiểm tra `TruBHYT` ở `BR-V2-13`).
