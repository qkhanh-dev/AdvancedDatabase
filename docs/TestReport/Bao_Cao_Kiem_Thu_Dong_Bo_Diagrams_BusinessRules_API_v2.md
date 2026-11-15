# BÁO CÁO KIỂM THỬ SÂU ĐỒNG BỘ SƠ ĐỒ, BUSINESS RULES, API CONTRACT v2 & TÀI LIỆU MỚI

- **Ngày kiểm thử:** `15/11/2026`
- **Phạm vi kiểm thử (Scope):** Chỉ kiểm thử và đối chiếu chéo các tài liệu & sơ đồ v2 mới cập nhật (không chạy kiểm thử mã nguồn `backend/` / `frontend/` v1):
  1. Bộ 6 sơ đồ Draw.io XML trong `docs/diagrams/` (`01`–`06`) và [docs/diagrams/README.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/README.md)
  2. [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt) & [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md)
  3. [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md) & ghi chú chuyển tiếp trên [API_Contract_v1.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v1.md)
  4. [Techstack_QuanLyBenhVien.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Techstack_QuanLyBenhVien.md)

---

## 1. Tóm Tắt Kết Quả Kiểm Thử (Executive Summary)

| Hạng mục kiểm thử | Số lượng / Phạm vi | Kết quả | Chi tiết chính |
| :--- | :---: | :---: | :--- |
| **1. Toàn vẹn cấu trúc XML Draw.io (`01`–`06`)** | 6 tệp XML (`1,259` ID) | **PASS** | 6/6 tệp parse hợp lệ, `0` tham chiếu `parent`/`source`/`target` lỗi. |
| **2. Hình học & chống đè khối/nhãn (`03`–`06`)** | 4 sơ đồ mới tạo | **PASS** | `0` va chạm bounding-box giữa các khối, `0` mũi tên sequence đè lên phase banner/footer. |
| **3. Đối chiếu Schema 1-1 (`01` vs `02` vs `API_Contract_v2`)** | 18 bảng · 103 cột · 6 dẫn xuất · 20 FK | **PASS** | Khớp 100% tên bảng, `103` cột lưu trữ và `6` thuộc tính dẫn xuất trên `01`, `02` (cả `schemaData` lẫn visual rows) và 18 TypeScript interfaces của `API_Contract_v2.md`. |
| **4. Độ phủ 13 nhóm quy tắc (`Rang buoc DTB v2` vs Docs & Diagrams)** | 13 mục (`BR-V2-01`..`13`) | **PASS (kèm 1 lưu ý metadata)** | `02.designNotes == Rang buoc DTB v2 - 13 muc.txt` (`True`); `Business_Rules_v2.md` phủ 13/13 mục; lưu ý `01.designNotes` hiện mới chứa mục 1–11 (thiếu 12–13). |
| **5. Quét rò rỉ lược đồ v1 cũ (Legacy Leakage Scan)** | 8 tệp v2 (`03`–`06`, README, Docs) | **PASS** | Không có thực thể/cột v1 nào bị dùng nhầm làm chức năng hiện hành; mọi chuỗi trùng tên cũ chỉ nằm trong chú thích loại trừ tường minh hoặc làm chuỗi con hợp lệ (`TongTienDichVu`, `MaHoaDon`). |
| **6. Kiểm tra liên kết tệp (`file:///`)** | 40 liên kết trong 5 tệp `.md` | **PASS** | `40/40` liên kết tồn tại thực tế trên đĩa (`0` broken links). |

---

## 2. Chi Tiết Kiểm Thử Sơ Đồ XML (`docs/diagrams/`)

### 2.1. Kết quả kiểm tra cấu trúc XML & tham chiếu Draw.io

Kiểm tra bằng `xml.etree.ElementTree` trên cả thẻ `<mxCell>`, `<UserObject>` và `<object>`:

| Tệp sơ đồ | Tổng số ID (`mxCell`/`UserObject`) | Tham chiếu lỗi (`parent`/`source`/`target`) | Va chạm hình học | Trạng thái |
| :--- | :---: | :---: | :---: | :---: |
| [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml) | 518 | 0 | 0 | **PASS** |
| [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml) | 559 | 0 | 0 | **PASS** |
| [03_UseCase_TongQuan_QLBV_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/03_UseCase_TongQuan_QLBV_v2.xml) | 61 | 0 | 0 | **PASS** |
| [04_Sequence_KhamBenh_XetNghiem_VienPhi_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/04_Sequence_KhamBenh_XetNghiem_VienPhi_v2.xml) | 44 | 0 | 0 | **PASS** |
| [05_Sequence_NoiTru_PhanGiuong_KhoaDong_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/05_Sequence_NoiTru_PhanGiuong_KhoaDong_v2.xml) | 41 | 0 | 0 | **PASS** |
| [06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/06_KienTruc_BCE_Va_ToanVen_18Bang_v2.xml) | 36 | 0 | 0 | **PASS** |

### 2.2. Đối chiếu visual rows vs metadata của Sơ đồ 01 & 02
- `01_EER_hoan_chinh_v2.xml` (`mermaidData`): **18 thực thể**, **109 thuộc tính** (gồm **103** thuộc tính lưu trữ + **6** thuộc tính dẫn xuất `()`).
- `02_Relational_Schema_18Bang_v2.xml` (`schemaData` & rendered `<mxCell>` table rows): **18 bảng**, **103 dòng cột lưu trữ hiển thị trực tiếp (`103 == 103`)**, **20 khóa ngoại (`FK01`–`FK20`)**, **6 thuộc tính dẫn xuất (`VIEW/query`)**.
- Tập bảng giữa `01` và `02` khớp **100%** (`diff_tables = NONE`), thứ tự và tên cột lưu trữ trong từng bảng khớp **100%**.

---

## 3. Chi Tiết Kiểm Thử Đối Chiếu Schema & `API_Contract_v2.md`

Đối chiếu tự động 18 bảng và 103 cột lưu trữ + 6 thuộc tính dẫn xuất từ `02_Relational_Schema_18Bang_v2.xml` sang 18 TypeScript `export interface` trong [API_Contract_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/API_Contract_v2.md):

| Bảng CSDL (`02`) | Interface TS (`API_Contract_v2`) | Số cột lưu trữ khớp | Thuộc tính dẫn xuất khớp | Kết quả |
| :--- | :--- | :---: | :---: | :---: |
| `KHOA` | `Khoa` | 4 / 4 | - | **PASS** |
| `PHONG` | `Phong` | 5 / 5 | - | **PASS** |
| `GIUONG_BENH` | `GiuongBenh` | 6 / 6 | - | **PASS** |
| `NHAN_VIEN` | `NhanVien` | 9 / 9 | `SoNamCongTac` | **PASS** |
| `BAC_SI` | `BacSi` | 4 / 4 | - | **PASS** |
| `DIEU_DUONG` | `DieuDuong` | 3 / 3 | - | **PASS** |
| `KY_THUAT_VIEN` | `KyThuatVien` | 3 / 3 | - | **PASS** |
| `BENH_NHAN` | `BenhNhan` | 10 / 10 | `Tuoi` | **PASS** |
| `THE_BHYT` | `TheBHYT` | 5 / 5 | - | **PASS** |
| `DOT_NOI_TRU` | `DotNoiTru` | 6 / 6 | - | **PASS** |
| `PHAN_GIUONG` | `PhanGiuong` | 4 / 4 | - | **PASS** |
| `LUOT_KHAM` | `LuotKham` | 9 / 9 | - | **PASS** |
| `DON_THUOC` | `DonThuoc` | 4 / 4 | `TongTienThuoc` | **PASS** |
| `CHI_TIET_DON_THUOC` | `ChiTietDonThuoc` | 5 / 5 | - | **PASS** |
| `THUOC` | `Thuoc` | 7 / 7 | - | **PASS** |
| `LOAI_XET_NGHIEM` | `LoaiXetNghiem` | 4 / 4 | - | **PASS** |
| `PHIEU_XET_NGHIEM` | `PhieuXetNghiem` | 9 / 9 | - | **PASS** |
| `VIEN_PHI` | `VienPhi` | 6 / 6 | `TongTienDichVu`, `TongTienThuoc`, `ThucThu` | **PASS** |
| **TỔNG CỘNG** | **18 Interfaces** | **103 / 103** | **6 / 6** | **PASS (100%)** |

---

## 4. Kiểm Thử Độ Phủ 13 Nhóm Quy Tắc & Quét Rò Rỉ Phiên Bản v1

### 4.1. Độ phủ 13 nhóm quy tắc (`BR-V2-01` → `BR-V2-13`)
- [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt) khớp từng ký tự với `designNotes` của [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml).
- [Business_Rules_v2.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Business_Rules_v2.md) bao phủ đủ `13/13` quy tắc (`BR-V2-01`..`BR-V2-13`) và `6/6` công thức thuộc tính dẫn xuất.
- Các quy tắc trọng yếu được phản ánh nhất quán qua sơ đồ `03`–`06`, `API_Contract_v2.md` và `Techstack_QuanLyBenhVien.md`:
  - `NHAN_VIEN (d, p)` disjoint & partial (không có `NV_HANH_CHINH`).
  - `PHAN_GIUONG` khoảng nửa mở `[TuNgay, DenNgay)` theo `DATE`, khóa chống trùng giường và trùng đợt, đóng phân giường khi ra viện `DenNgay <= NgayRaVien + 1`.
  - `DOT_NOI_TRU` tối đa 1 đợt đang mở (`WHERE NgayRaVien IS NULL`) và không chồng khoảng `[NgayNhapVien, NgayRaVien + 1)` của cùng `MaBN`.
  - `LUOT_KHAM` dùng khóa ngoại ghép `FK11(MaDotNT, MaBN)` với `MaDotNT` nullable.
  - `GIUONG_BENH.TrangThai` tách bạch tình trạng khai thác; trạng thái có người nằm suy diễn từ `PHAN_GIUONG`.
  - `PHIEU_XET_NGHIEM` ràng buộc đồng bộ `MaNV_KTV`, `NgayGioXN`, `KetQua`, `NgayGioTraKQ >= NgayGioXN`.
  - `VIEN_PHI` lập 1–0..1 theo `LUOT_KHAM`, lưu trữ `TruBHYT`, tính `ThucThu >= 0` (không tính tiền giường), khóa chi phí sau thanh toán và đồng bộ khóa khi chi phí thay đổi trước thanh toán.

### 4.2. Kết quả quét rò rỉ khái niệm v1 cũ
Quét từ khóa cũ (`LICH_TRUC`, `DutySchedule`, `NV_HANH_CHINH`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `DICH_VU`, `SU_DUNG_DV`, `HOA_DON`, `CT_DON_THUOC`, `CHI_TIET_VIEN_PHI`, `SoLuongTon`, `DonGiaBan`, `DonGiaDV`, `GiaGiuongNgay`, `NgayKetThuc`, `TienBHYTChiTra`, `TienBenhNhanTra`, `TongTienGoc`, `VietQR`, `19 bảng`, `25 FK`, `BR01`–`BR06`) trên 8 tệp v2:
- **05_Sequence_NoiTru_PhanGiuong_KhoaDong_v2.xml:** `0` lần xuất hiện.
- **03, 04, 06, README.md, Business_Rules_v2.md, API_Contract_v2.md, Techstack_QuanLyBenhVien.md:** Toàn bộ các lần khớp đều là **chú thích loại trừ tường minh** (ví dụ *"Không tồn tại bảng LICH_TRUC..."*, *"không lưu cột tồn kho SoLuongTon"*) hoặc là **chuỗi con hợp lệ** của tên cột chuẩn v2 (`DichVu` trong `TongTienDichVu`, `HoaDon` trong `MaHoaDon`). **Không có rò rỉ chức năng hay schema v1.**

---

## 5. Kiểm Tra Liên Kết Nội Bộ (`file:///`)

Kiểm tra toàn bộ **40** đường dẫn `file:///` trong 5 tệp tài liệu (`docs/diagrams/README.md`, `Business_Rules_v2.md`, `API_Contract_v2.md`, `API_Contract_v1.md`, `Techstack_QuanLyBenhVien.md`):
- **40 / 40** đường dẫn tồn tại hợp lệ trên đĩa (`0` liên kết gãy).

---

## 6. Các Điểm Lưu Ý / Gap Ghi Nhận Cho Bước Triển Khai Tiếp Theo

1. **Đồng bộ `designNotes` ở Sơ đồ 01:** `01_EER_hoan_chinh_v2.xml` hiện có mục 1–11, chưa chép bổ sung mục 12–13 từ `02_Relational_Schema_18Bang_v2.xml` / `Rang buoc DTB v2 - 13 muc.txt`.
2. **Chốt DDL thực thi:** Khi viết script SQL tạo CSDL cho bản v2, cần chốt độ dài chuỗi `VARCHAR`/`NVARCHAR`, quyết định `UNIQUE` (hoặc filtered unique) cho `CCCD`/`SoChungChiHanhNghe`, tập giá trị `CHECK` cho `GIUONG_BENH.TrangThai`, `LUOT_KHAM.TrangThai`, `VIEN_PHI.TrangThaiThanhToan`, `VIEN_PHI.HinhThucThanhToan`, và cài đặt trigger/procedure có khóa cho 13 nhóm quy tắc (đặc biệt lưu ý kiểm tra đơn thuốc có chi tiết ở tầng giao dịch chứ không dùng trigger `AFTER INSERT` từng dòng trên `DON_THUOC`).
3. **Khoảng cách với mã nguồn hiện tại (`backend/`, `frontend/`):** Mã nguồn ứng dụng hiện trong repository đang bám lược đồ v1 (19 bảng PostgreSQL/Prisma); tài liệu v2 này là chuẩn đặc tả cho mô hình EER v2 (18 bảng).
