# BÁO CÁO KIỂM THỬ TOÀN DIỆN CHỨC NĂNG & TẤT CẢ TRẠNG THÁI (E2E v2.0)

- **Ngày kiểm thử:** `16/11/2026` (`2026-11-16T01:19–01:23+07:00`)
- **Môi trường thực thi thực tế:**
  - **Backend NestJS v2:** `http://localhost:3001/api` (PostgreSQL `hospital_db` đã migrate + seed v2)
  - **Frontend Next.js v2 (`npm run start`):** `http://localhost:3000`
- **Phạm vi kiểm thử:** Toàn bộ **7 Giai đoạn E2E**, đủ **6 vai trò RBAC**, đủ **tất cả enum/trạng thái** của lược đồ v2, kiểm tra các **thuộc tính dẫn xuất**, **ràng buộc nghiệp vụ `BR-V2-01..13`**, cùng xác minh trực tiếp trên trình duyệt cho cả **8 route v2** (và route `/pharmacy` v1 đã bị loại bỏ).

---

## 1. Tổng Kết Kết Quả Chung

| Hạng mục kiểm thử | Số lượng | Đạt | Lỗi | Tỷ lệ |
| :--- | :---: | :---: | :---: | :---: |
| **Build & Static Quality (`tsc --noEmit`, `next lint`, `next build`)** | 3 | 3 | 0 | **100%** |
| **Kịch bản E2E 7 Giai đoạn – Đủ mọi Trạng thái (`run-full-status-scenario.mjs`)** | 66 | 66 | 0 | **100%** |
| **Frontend Deep Test v2 (`cd frontend && npm test`)** | 25 | 25 | 0 | **100%** |
| **Xác minh Trình duyệt Trực tiếp (`/login`, `/`, `/reception`, `/clinical`, `/laboratory`, `/inpatient`, `/cashier`, `/admin`)** | 8 | 8 | 0 | **100%** |

> **Phát hiện & xử lý trong phiên kiểm thử:**
> 1. Phát hiện `GioiTinhEnum` ở [types/index.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/types/index.ts#L5-L9) dùng `"Nam" | "Nữ" | "Khác"` lệch với `GioiTinh` enum (`"NAM" | "NU" | "KHAC"`) của backend. Đã đồng bộ lại giá trị enum trên frontend, build lại production và kiểm chứng API tạo nhân viên/bệnh nhân đạt đủ cả 3 giới tính.
> 2. Xác nhận field tổng hợp tài chính trả về từ `GET /api/reports/dashboard` là `doanhThu` (khớp giữa [report.service.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/src/modules/report/report.service.ts#L113) và [types/index.ts](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/src/types/index.ts#L334)).

---

## 2. Ma Trận Bao Phủ Tất Cả Trạng Thái & Miền Giá Trị v2

| Thực thể / Miền | Tất cả giá trị / trạng thái đã test | Kết quả |
| :--- | :--- | :---: |
| **Vai trò (`Role`)** | `ADMIN`, `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`, `TIEP_NHAN`, `THU_NGAN` + chặn `401`/`403` | **PASS** |
| **Giới tính (`GioiTinh`)** | `NAM`, `NU`, `KHAC` (trên cả `NHAN_VIEN` & `BENH_NHAN`) | **PASS** |
| **Chuyên biệt hóa `(d, p)` (`BR-V2-01`)** | `BAC_SI`, `KY_THUAT_VIEN`, `DIEU_DUONG`, và nhân sự Partial (`TIEP_NHAN`, `THU_NGAN`, `ADMIN`) | **PASS** |
| **Trạng thái vật lý giường (`TrangThaiGiuong`)** | `SAN_SANG`, `BAO_TRI`, `NGUNG_SU_DUNG` (chuyển đổi & chặn phân giường không sẵn sàng `BR-V2-11`) | **PASS** |
| **Chiếm giường theo ngày (`PHAN_GIUONG`)** | Có người nằm (`dangCoNguoiNam = true`), Trống (`false`), ranh giới nửa mở `[TuNgay, DenNgay)` | **PASS** |
| **Đợt nội trú (`DOT_NOI_TRU`)** | Đang điều trị (`NgayRaVien = null`), Đã ra viện (`NgayRaVien != null` tự đóng phân giường) | **PASS** |
| **Lượt khám (`TrangThaiLuotKham`)** | `CHO_KHAM`, `DANG_KHAM`, `CHO_XET_NGHIEM`, `HOAN_TAT`, và nhánh `HUY` | **PASS** |
| **Phiếu xét nghiệm (`PHIEU_XET_NGHIEM`)** | Chờ (`NgayGioXN = null`, `0đ` viện phí) -> Bắt đầu (`start`, tính phí `80.000đ`) -> Hoàn tất (`complete`, `KetQua` + `NgayGioTraKQ >= NgayGioXN`) | **PASS** |
| **Thẻ BHYT (`THE_BHYT`)** | Thẻ còn hạn (`MucHuong = 0.80`), Thẻ hết hạn (lọc bỏ / chặn áp dụng `400`), Không có thẻ (`TruBHYT = 0`) | **PASS** |
| **Trạng thái hóa đơn (`TrangThaiThanhToan`)** | `CHUA_THANH_TOAN` (kiểm tra `BR-V2-13`, cho sửa tăng hợp lệ) -> `DA_THANH_TOAN` (khóa hoàn toàn `409 BR-V2-08`) | **PASS** |
| **Hình thức thanh toán (`HinhThucThanhToan`)** | `TIEN_MAT`, `THE`, `CHUYEN_KHOAN` (từ seed `HD01`) | **PASS** |

---

## 3. Chi Tiết Kết Quả Thực Thi Theo 7 Giai Đoạn (`66/66 PASS`)

### Giai đoạn 1: Routes, Đăng nhập 6 Role & Kiểm soát Quyền RBAC (`20/20 PASS`)
- `GET http://localhost:3000/pharmacy` -> **`404`** (xác nhận đã loại bỏ route v1).
- `GET` toàn bộ 8 route v2 (`/`, `/login`, `/reception`, `/clinical`, `/laboratory`, `/inpatient`, `/cashier`, `/admin`) -> **`200`**.
- Đăng nhập đủ 6 tài khoản (`ADMIN01`, `BS01`, `DD01`, `KTV01`, `TT01`, `NV_TN_01`) -> **`200`**, trả đủ `role`, `hoTen`, `HoTen`, và `SoNamCongTac` dẫn xuất (`6`, `16`, `10`, `8`, `5`, `7` năm).
- Không có token gọi `GET /api/patients` -> **`401 Unauthorized`**.
- Kiểm tra chéo vai trò (chặn sai role):
  - `TIEP_NHAN` (`TT01`) gọi `POST /api/prescriptions` -> **`403`**
  - `BAC_SI` (`BS01`) gọi `PATCH /api/beds/G06/status` -> **`403`**
  - `KY_THUAT_VIEN` (`KTV01`) gọi `POST /api/billing/invoices` -> **`403`**
  - `DIEU_DUONG` (`DD01`) gọi `PATCH /api/lab-requests/PXN02/start` -> **`403`**

### Giai đoạn 2: Quản trị Cơ sở vật chất, 3 Trạng thái Giường & Nhân sự `(d, p)` (`8/8 PASS`)
- `POST /api/departments` và `POST /api/rooms` (loại `NOI_TRU`) -> **`201`**.
- `GET /api/beds/map?date=2026-11-16`: xác nhận `G01` (`SAN_SANG`, `dangCoNguoiNam = true`), `G06` (`BAO_TRI`).
- Chuyển trạng thái vật lý `G06`: `BAO_TRI` -> `NGUNG_SU_DUNG` (`200`) -> khôi phục `BAO_TRI` (`200`).
- Tạo nhân sự theo cây `(d, p)` (`BR-V2-01`) với đủ 3 giới tính:
  - `BAC_SI` (`GioiTinh = KHAC`) -> **`201`**, `SoNamCongTac = 11`.
  - `KY_THUAT_VIEN` (`GioiTinh = NU`) -> **`201`**.
  - `TIEP_NHAN` Partial (`GioiTinh = NAM`, không tồn tại ở `BAC_SI`/`DIEU_DUONG`/`KY_THUAT_VIEN`) -> **`201`**.

### Giai đoạn 3: Tiếp đón, 3 Giới tính, Tuổi dẫn xuất & Thẻ BHYT (`6/6 PASS`)
- Tạo 3 hồ sơ `BENH_NHAN` với địa chỉ tách 3 phần (`DiaChi_Duong`, `DiaChi_Phuong`, `DiaChi_Quan`) và 3 giới tính `NAM` (`Tuoi = 30`), `NU`, `KHAC` -> **`201`**.
- Chặn dữ liệu BHYT sai (`BR-V2-06`):
  - `NgayHetHan < NgayBatDau` -> **`400`**.
  - `MucHuong = 1.5` (`> 1`) -> **`400`**.
- Gắn 1 thẻ còn hạn 2026 (`MucHuong = 0.8`) và 1 thẻ hết hạn 2025 (`MucHuong = 0.95`) cho cùng bệnh nhân; truy vấn `GET /api/patients/:maBN/insurance-cards?validAt=2026-11-16` lọc trả về chính xác **1 thẻ** còn hạn.

### Giai đoạn 4: 5 Trạng thái Lượt khám & Đơn thuốc (`6/6 PASS`)
- Mở `LK1` trạng thái khởi tạo `CHO_KHAM` (`201`).
- Test nhánh `HUY` trên `LK2`: `CHO_KHAM` -> `DANG_KHAM` -> `HUY` (`200`).
- Chuyển `LK1`: `CHO_KHAM` -> `DANG_KHAM` (`200`).
- Chặn đơn thuốc 0 chi tiết (`items: []`) theo `BR-V2-06` -> **`400`**.
- Kê đơn `DT1` cho `LK1` (`TH01` x 10 @ `1.500` + `TH02` x 10 @ `3.500`) -> **`201`**, `TongTienThuoc = 50000`.
- Chặn kê đơn thuốc thứ 2 trên cùng `LK1` (`BR-V2-05`) -> **`409` (`ruleCode: "BR-V2-05"`)**.

### Giai đoạn 5: Xét nghiệm 2 bước đủ 3 Trạng thái & Tính `TongTienDichVu` (`6/6 PASS`)
- Bác sĩ tạo 2 phiếu `PXN_A` (`XN01`: `80.000`) và `PXN_B` (`XN02`: `120.000`) đều ở trạng thái chờ (`NgayGioXN = null`), đồng thời chuyển `LK1` -> `CHO_XET_NGHIEM` (`200`).
- `GET /api/billing/preview/:lk1` khi chưa có `NgayGioXN` -> **`TongTienDichVu = 0`** (`BR-V2-07` / `BR-V2-08`).
- Chặn gọi `PATCH /complete` khi phiếu chưa qua bước `start` -> **`400`**.
- `KTV01` gọi `PATCH /lab-requests/:pxnA/start` -> `PXN_A` chuyển sang trạng thái đang thực hiện (`NgayGioXN != null`), preview cập nhật ngay **`TongTienDichVu = 80000`** (vẫn không cộng `PXN_B` chưa bắt đầu).
- Chặn `NgayGioTraKQ < NgayGioXN` -> **`400`**.
- `KTV01` gọi `PATCH /lab-requests/:pxnA/complete` (`KetQua` + `DanhGia` + `NgayGioTraKQ >= NgayGioXN`) -> **`200`**; bác sĩ xóa `PXN_B` chưa làm (`200`) và chuyển `LK1` -> `HOAN_TAT` (`200`).

### Giai đoạn 6: Nội trú, Sơ đồ Giường theo Ngày, Chuyển giường & Xuất viện (`12/12 PASS`)
- Xác minh khoảng nửa mở `[2026-10-01, 2026-10-06)` của `DOT02` trên giường `G02`: ngày `2026-10-03` `dangCoNguoiNam = true`, ngày `2026-10-06` `dangCoNguoiNam = false`.
- Mở `DOT_NOI_TRU` (`NgayRaVien = null`) -> **`201`**; thử mở đợt thứ 2 song song cho cùng bệnh nhân -> **`409` (`ruleCode: "BR-V2-12"`)**.
- Chặn phân giường sai trạng thái (`BR-V2-11`) & trùng lịch (`BR-V2-03`):
  - Giường `G06` (`BAO_TRI`) -> **`409` (`BR-V2-11`)**.
  - Giường `G05` (`NGUNG_SU_DUNG` tạm thời rồi khôi phục `SAN_SANG`) -> **`409` (`BR-V2-11`)**.
  - Giường `G01` (đang có `DOT01` nằm) -> **`409` (`BR-V2-03`)**.
- Phân giường hợp lệ (`SAN_SANG`, `TuNgay = 2026-12-01`) -> **`201`**.
- Lượt khám nội trú (`FK11`, `BR-V2-04`):
  - Thử gán `MaDotNT` của BN3 cho BN2 -> **`409` (`ruleCode: "BR-V2-04"`)**.
  - Mở `LK3` nội trú đúng `MaBN` & khung ngày điều trị -> **`201`**.
- Chuyển giường sang giường kế tiếp ở ngày `2026-12-02` (`POST /api/inpatient/transfer-bed`) -> **`201`**: bản đồ `2026-12-01` giường cũ bận / giường mới trống; bản đồ `2026-12-02` giường cũ trống / giường mới bận.
- Xuất viện (`BR-V2-02`):
  - Chặn `NgayRaVien < NgayNhapVien` -> **`400`**.
  - Xuất viện `NgayRaVien = 2026-12-03` -> **`200`**, tự động đóng `PHAN_GIUONG`, bản đồ ngày `2026-12-04` giường trả về trống (`false`).

### Giai đoạn 7: Viện phí, BHYT, `CHUA_THANH_TOAN` -> `DA_THANH_TOAN`, `BR-V2-08/13` & Dashboard (`8/8 PASS`)
- Chặn áp dụng thẻ BHYT hết hạn (2025) cho lượt khám ngày `2026-11-16` -> **`400`**.
- Lập `HD1` áp dụng 1 thẻ BHYT còn hạn (`MucHuong = 0.80`), hình thức `TIEN_MAT` -> **`201`**, `TrangThaiThanhToan = CHUA_THANH_TOAN`, `TruBHYT = 104000`, `ThucThu = 26000`.
- Kiểm thử **`BR-V2-13`** khi đang `CHUA_THANH_TOAN`:
  - Giảm số lượng thuốc làm tổng chi phí nhỏ hơn `TruBHYT` (`104.000`) -> **`409` (`ruleCode: "BR-V2-13"`)**.
  - Tăng hợp lệ (`TH01` từ `10 -> 12`) khi chưa thanh toán -> **`200`**, `TongTienThuoc = 53000`.
- Chốt thanh toán `HD1` với hình thức `THE` -> **`200`**, `TrangThaiThanhToan = DA_THANH_TOAN`, `ThucThu = 29000`.
- Test luồng không có BHYT (`TruBHYT = 0`) + thanh toán `TIEN_MAT` trên `LK3` -> **`200`**, `ThucThu = 17000` (kèm `HD01` seed sẵn dùng `CHUYEN_KHOAN` -> phủ đủ cả 3 hình thức).
- Kiểm thử khóa sau thanh toán (**`BR-V2-08`**) trên `LK1`/`HD1`:
  - `PATCH /prescriptions/:dt1`, `DELETE /prescriptions/:dt1`, `POST /lab-requests`, `PATCH /billing/invoices/:hd1/pay` lần 2 -> đồng loạt trả **`409` (`ruleCode: "BR-V2-08"`)**.
- `GET /api/reports/dashboard?date=2026-11-16` -> **`200`**, trả đúng `congSuatGiuong` (`giuongSanSang`, `giuongBaoTri`, `giuongNgungSuDung`) và `doanhThu` (`daThanhToan.ThucThu = 159500`, `chuaThanhToan.soHoaDon = 0`).

---

## 4. Xác Minh Giao Diện Trực Tiếp Trên Trình Duyệt (`http://localhost:3000`)

Sau khi đăng nhập bằng tài khoản `ADMIN01` trên `/login` và đi tuần tự qua toàn bộ **7 màn hình nghiệp vụ**, tất cả trang đều render đầy đủ dữ liệu v2 với **0 Next.js Runtime Error Overlay** và **0 Console Exception**:

1. **`/login`**: Form đăng nhập chuẩn, 6 nút demo quick-fill theo 6 role v2; đăng nhập `ADMIN01` thành công kèm thông báo thâm niên `6 năm`.
2. **`/`**: Dashboard KPI (Tổng Bệnh nhân, Đợt Nội trú đang mở, Công suất giường `60%` / `1 bảo trì`, Thực thu `159.500 ₫`), bảng tách doanh thu từ `V_VIEN_PHI`, danh sách nhân sự kèm `SoNamCongTac`.
3. **`/reception`**: Thanh tra cứu theo `MaBN / CCCD / SDT / MaTheBHYT`, form tạo `BENH_NHAN` tách địa chỉ 3 phần, bảng danh sách bệnh nhân kèm `Tuoi`, panel quản lý `THE_BHYT` và đăng ký `LUOT_KHAM`.
4. **`/clinical`**: Danh sách `LUOT_KHAM` với đầy đủ badge `CHO_KHAM`, `DANG_KHAM`, `CHO_XET_NGHIEM`, `HOAN_TAT`, `HUY`, `ĐÃ THANH TOÁN`; panel đơn thuốc (`DonGiaKe`) và chỉ định xét nghiệm.
5. **`/laboratory`**: Bộ lọc trạng thái (`PENDING`, `WAITING`, `IN_PROGRESS`, `COMPLETED`) và quy trình 2 bước `PATCH /start` -> `PATCH /complete`.
6. **`/inpatient`**: Bộ lọc sơ đồ giường theo ngày và khoa, lưới giường hiển thị phân tách trạng thái khai thác vs có người nằm, form mở đợt, phân giường, chuyển giường và bảng xuất viện.
7. **`/cashier`**: Danh sách lượt khám chọn tính viện phí, chi tiết breakdown `TongTienThuoc + TongTienDichVu - TruBHYT = ThucThu`, hiển thị trạng thái khóa sau thanh toán.
8. **`/admin`**: Đủ 5 tab quản trị `KHOA`, `PHONG`, `GIUONG` (`SAN_SANG` / `BAO_TRI` / `NGUNG_SU_DUNG`), `NHAN_VIEN (d, p)` + `SoNamCongTac`, và danh mục `THUOC` / `LOAI_XET_NGHIEM`.

---

## 5. Hồi Quy Kỹ Thuật Sau Sửa Lỗi Cuối

- `cd frontend && npx tsc --noEmit`: Pass (`exit code 0`).
- `cd frontend && npm run lint`: `✔ No ESLint warnings or errors`.
- `cd frontend && npm run build`: Build production thành công cho đủ 8 route v2.
- `cd frontend && npm test` ([test-frontend-deep.mjs](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/frontend/scripts/test-frontend-deep.mjs)): **`25/25 PASS`**.
