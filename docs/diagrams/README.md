# DANH MỤC SƠ ĐỒ KỸ THUẬT HỆ THỐNG QUẢN LÝ BỆNH VIỆN (QLBV — Phiên bản EER v2)
Học phần: **Cơ sở dữ liệu nâng cao** – Khoa CNTT, Đại học Sài Gòn (SGU)  
Nhóm 5 thực hiện (Trưởng nhóm: Cao Nguyễn Quốc Khánh)

Tất cả các tệp trong thư mục này đều được lưu dưới định dạng chuẩn **XML Draw.io (`.xml`)**, có thể mở, xem và chỉnh sửa trực tiếp trên [app.diagrams.net](https://app.diagrams.net), ứng dụng Draw.io Desktop hoặc tiện ích mở rộng *Draw.io Integration* trên VS Code.

---

## 1. Danh Mục Chi Tiết 6 Sơ Đồ (Đồng Bộ 100% Theo EER v2)

| Tên File | Loại Sơ Đồ | Nội Dung Chi Tiết & Quy Chuẩn Kỹ Thuật |
| :--- | :--- | :--- |
| [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml) | **Mô hình EER Hoàn chỉnh v2** | Mô hình Thực thể Kết hợp Mở rộng (EER) tối giản **18 thực thể** với cây chuyên biệt hóa `NHAN_VIEN` theo `(d, p)` (`BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`), tách `THE_BHYT`, `DOT_NOI_TRU`, `PHAN_GIUONG`, `LOAI_XET_NGHIEM`, `PHIEU_XET_NGHIEM`, `VIEN_PHI` và **6 thuộc tính dẫn xuất `()`**; đính kèm **13 nhóm quy tắc** thiết kế CSDL trong `designNotes`. |
| [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml) | **Lược đồ Quan hệ 18 Bảng v2** | Biểu diễn **18 bảng**, **103 cột lưu trữ**, **20 khóa ngoại (`FK01`–`FK20`)** với hành vi `ON DELETE NO ACTION / ON UPDATE NO ACTION`, khóa ghép `FK11: LUOT_KHAM(MaDotNT, MaBN) → DOT_NOI_TRU(MaDotNT, MaBN)`, unique có điều kiện `DOT_NOI_TRU(MaBN) WHERE NgayRaVien IS NULL`, kiểu dữ liệu tham chiếu **SQL Server** và **6 thuộc tính dẫn xuất** qua `VIEW / Query`. |
| [03_UseCase_TongQuan_QLBV_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/03_UseCase_TongQuan_QLBV_v2.xml) | **Sơ đồ Use Case Tổng quan v2** | Biểu diễn ranh giới hệ thống, **5 tác nhân** (`BENH_NHAN`, `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`, và `NHAN_VIEN` nhóm *partial* cho Tiếp nhận/Thu ngân/Quản trị) cùng **16 Use Case** thuộc 5 phân hệ bám sát phạm vi 18 bảng v2. |
| [04_Sequence_KhamBenh_XetNghiem_VienPhi_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/04_Sequence_KhamBenh_XetNghiem_VienPhi_v2.xml) | **Sơ đồ Trình tự Khám, XN & Viện phí v2** | Mô tả 5 giai đoạn tuần tự: Tiếp đón `BENH_NHAN` & `THE_BHYT` ➔ Khám `LUOT_KHAM` & chỉ định `PHIEU_XET_NGHIEM` (snapshot `DonGiaXN`) ➔ `KY_THUAT_VIEN` thực hiện & trả kết quả đồng bộ ➔ Kê `DON_THUOC` (1–0..1) & snapshot `DonGiaKe` ➔ Lập `VIEN_PHI`, lưu `TruBHYT` và khóa chi phí sau thanh toán (Quy tắc 4, 5, 6, 7, 8, 9, 13). |
| [05_Sequence_NoiTru_PhanGiuong_KhoaDong_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/05_Sequence_NoiTru_PhanGiuong_KhoaDong_v2.xml) | **Sơ đồ Trình tự Nội trú & Phân giường v2** | Mô tả 4 giai đoạn điều trị nội trú: Mở `DOT_NOI_TRU` (≤ 1 đợt đang mở/`MaBN`, không chồng khoảng điều trị) ➔ Tra cứu `GIUONG_BENH.TrangThai` khai thác & `PHAN_GIUONG` tại ngày `D` ➔ Xử lý tranh chấp đồng thời trên khoảng `[TuNgay, DenNgay)` ➔ Chuyển giường khác ngày & đóng phân giường khi ra viện (`DenNgay <= NgayRaVien + 1`) (Quy tắc 2, 3, 4, 11, 12). |
| [06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml) | **Sơ đồ Kiến trúc BCE & Toàn vẹn 18 Bảng v2** | Ánh xạ 4 tầng: Tác nhân (`NHAN_VIEN (d, p)` & `BENH_NHAN`) ➔ `<<boundary>>` (Next.js App Router) ➔ `<<control>>` (NestJS Services & Transaction/Lock Coordinator) ➔ `<<entity>>` (18 bảng tham chiếu SQL Server, `20 FK`, `6 VIEW/Query` dẫn xuất & `13 nhóm quy tắc`). |

---

## 2. Thông Số Cốt Lõi & Quy Ước Phạm Vi EER v2

Toàn bộ sơ đồ `03`–`06` tuân thủ tuyệt đối nội dung của [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml) và [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml):

1. **Tổng quy mô lược đồ:** **18 bảng** · **103 cột lưu trữ** · **20 khóa ngoại (`FK01`–`FK20`)** (`NO ACTION` khi xóa/cập nhật) · **6 thuộc tính dẫn xuất (`VIEW / Query`)**.
2. **Phạm vi loại trừ có chủ đích của bản v2:**
   - Không tạo bảng `LICH_TRUC`, `NV_HANH_CHINH`, `CHI_TIET_VIEN_PHI`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `DICH_VU`, `SU_DUNG_DV`.
   - Bảng `THUOC` không lưu cột tồn kho (`SoLuongTon`).
   - `VIEN_PHI` lập theo từng `LUOT_KHAM` (`MaLuotKham` `FK, UQ`), tính trên `TongTienThuoc + TongTienDichVu - TruBHYT`; không tính tiền giường `PHAN_GIUONG` và không quyết toán gộp cả đợt nội trú.
3. **Chuyên biệt hóa nhân sự `(d, p)`:** `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN` là các bảng con *disjoint, partial* của `NHAN_VIEN` (cho phép nhân viên tiếp nhận/thu ngân/quản trị nằm ngoài 3 nhóm chuyên môn).
4. **6 thuộc tính dẫn xuất (`()` — tính qua `VIEW / Query`, không lưu cột):**
   - `NHAN_VIEN.SoNamCongTac`
   - `BENH_NHAN.Tuoi`
   - `DON_THUOC.TongTienThuoc` = `COALESCE(SUM(CHI_TIET_DON_THUOC.SoLuong * DonGiaKe), 0)`
   - `VIEN_PHI.TongTienDichVu` = `COALESCE(SUM(PHIEU_XET_NGHIEM.DonGiaXN), 0)` *(chỉ tính phiếu có `NgayGioXN IS NOT NULL`)*
   - `VIEN_PHI.TongTienThuoc` = `COALESCE(SUM(CHI_TIET_DON_THUOC.SoLuong * DonGiaKe), 0)`
   - `VIEN_PHI.ThucThu` = `TongTienThuoc + TongTienDichVu - TruBHYT` *(>= 0; `TruBHYT` là cột lưu trữ `DECIMAL(18,2) NOT NULL DEFAULT 0`)*
5. **13 nhóm quy tắc toàn vẹn & nghiệp vụ (triển khai bằng DDL, `CHECK`, `UNIQUE`, `VIEW` và `Transaction/Trigger` có khóa):**
   - Khóa ghép `FK11`: `LUOT_KHAM(MaDotNT, MaBN) → DOT_NOI_TRU(MaDotNT, MaBN)` kết hợp `UQ(MaDotNT, MaBN)` và kiểm tra thời điểm khám thuộc `[NgayNhapVien, NgayRaVien + 1 ngày)`.
   - Phân giường theo khoảng nửa mở `[TuNgay, DenNgay)` theo `DATE`, không chồng khoảng theo giường và theo đợt; `GIUONG_BENH.TrangThai` chỉ biểu diễn tình trạng khai thác (*sẵn sàng / bảo trì / ngừng sử dụng*).
   - Tối đa 1 đợt nội trú đang mở (`DOT_NOI_TRU(MaBN) WHERE NgayRaVien IS NULL`) và không giao nhau giữa các khoảng điều trị của cùng bệnh nhân.
   - `PHIEU_XET_NGHIEM`: ràng buộc nhất quán giữa `MaNV_KTV`, `NgayGioXN`, `KetQua`, `DanhGia`, `NgayGioTraKQ >= NgayGioXN`.
   - `VIEN_PHI`: áp dụng tối đa 1 thẻ `THE_BHYT` còn hạn của đúng bệnh nhân tại ngày khám, lưu `TruBHYT` (`0 <= TruBHYT <= TongTienThuoc + TongTienDichVu`), khóa hóa đơn và toàn bộ chi phí liên quan sau khi đã thanh toán.

---

## 3. Hướng Dẫn Mở & Xuất Ảnh Sơ Đồ

1. Truy cập [app.diagrams.net](https://app.diagrams.net) (hoặc mở VS Code có cài *Draw.io Integration*).
2. Chọn **File** ➔ **Open From** ➔ **Device...** và mở tệp `.xml` tương ứng trong thư mục `docs/diagrams/`.
3. Để xuất ảnh chất lượng cao phục vụ chèn báo cáo:
   - Chọn **File** ➔ **Export as** ➔ **PNG...** (Đặt Zoom `200%` hoặc DPI `300`, giữ nền trắng `#FFFFFF`).
