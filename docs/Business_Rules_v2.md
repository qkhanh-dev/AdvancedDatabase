# ĐẶC TẢ QUY TẮC NGHIỆP VỤ & RÀNG BUỘC TOÀN VẸN CSDL (v2.0)
## Hệ Thống Quản Lý Bệnh Viện (QLBV — Theo EER v2 & Lược Đồ Quan Hệ 18 Bảng)

- **Phiên bản:** `v2.0` | **Ngày cập nhật:** `15/11/2026`
- **Tài liệu nguồn đối chiếu tuyệt đối:**
  - [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml)
  - [02_Relational_Schema_18Bang_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_18Bang_v2.xml)
  - [Rang buoc DTB v2 - 13 muc.txt](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Rang%20buoc%20DTB%20v2%20-%2013%20muc.txt)

---

## 1. Tổng Quan Quy Mô & Phạm Vi Lược Đồ v2

1. **Quy mô vật lý:** **18 bảng** · **103 cột lưu trữ** · **20 khóa ngoại (`FK01`–`FK20`)** · **6 thuộc tính dẫn xuất (`VIEW / Query`)** · **13 nhóm quy tắc**.
2. **Kiểu dữ liệu tham chiếu (SQL Server):**
   - Tiền tệ (`DonGiaNgay`, `DonGia`, `DonGiaKe`, `DonGiaXN`, `TruBHYT`): `DECIMAL(18,2)`.
   - Mức hưởng BHYT (`THE_BHYT.MucHuong`): `DECIMAL(5,4)`, giá trị nằm trong `[0, 1]`.
   - Ngày theo lịch (`NgaySinh`, `NgayVaoLam`, `NgayNhapVien`, `NgayRaVien`, `TuNgay`, `DenNgay`, `NgayBatDau`, `NgayHetHan`, `NgayKeDon`, `NgayLap`): `DATE`.
   - Thời điểm chi tiết (`NgayGioKham`, `NgayGioXN`, `NgayGioTraKQ`): `DATETIME2(3)`.
   - Chuỗi: `VARCHAR(...)`, `NVARCHAR(...)` (cần chốt độ dài chính xác khi viết DDL thực thi).
3. **Chính sách toàn vẹn tham chiếu:** Toàn bộ 20 khóa ngoại `FK01`–`FK20` dùng `ON DELETE NO ACTION` và `ON UPDATE NO ACTION`.
4. **Phạm vi loại trừ có chủ đích của bản v2:**
   - Không tạo bảng `LICH_TRUC`, `NV_HANH_CHINH`, `CHI_TIET_VIEN_PHI`, `BN_NGOAI_TRU`, `BN_NOI_TRU`, `DICH_VU`, `SU_DUNG_DV`.
   - Bảng `THUOC` không quản lý cột tồn kho (`SoLuongTon`).
   - `VIEN_PHI` tính theo từng `LUOT_KHAM`, không tính tiền giường `PHAN_GIUONG` và không quyết toán tổng hợp cả đợt nội trú hay nhiều lần thu tiền.
5. **Tuyên bố học thuật:** Sơ đồ 02 chưa thay thế kiểm thử DDL thực tế và chưa khẳng định toàn bộ lược đồ đạt BCNF (ví dụ khóa chính 3 cột của `PHAN_GIUONG` được giữ nguyên theo EER v2, dư thừa `MaBN` ở `LUOT_KHAM` được kiểm soát qua `FK11`).

---

## 2. Danh Mục 6 Thuộc Tính Dẫn Xuất (`VIEW / Query`)

Các thuộc tính có ký hiệu `()` trên [01_EER_hoan_chinh_v2.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_hoan_chinh_v2.xml) **không lưu thành cột vật lý** trong 103 cột của 18 bảng:

| STT | Bảng | Thuộc tính dẫn xuất | Công thức / Nguồn tính (`VIEW / Query`) |
| :---: | :--- | :--- | :--- |
| 1 | `NHAN_VIEN` | `SoNamCongTac` | Số năm tính từ `NgayVaoLam` đến ngày hiện tại |
| 2 | `BENH_NHAN` | `Tuoi` | Tuổi tính từ `NgaySinh` đến ngày hiện tại |
| 3 | `DON_THUOC` | `TongTienThuoc` | `COALESCE(SUM(CHI_TIET_DON_THUOC.SoLuong * CHI_TIET_DON_THUOC.DonGiaKe), 0)` của đơn |
| 4 | `VIEN_PHI` | `TongTienDichVu` | `COALESCE(SUM(PHIEU_XET_NGHIEM.DonGiaXN), 0)` của `MaLuotKham`, **chỉ tính phiếu có `NgayGioXN IS NOT NULL`** |
| 5 | `VIEN_PHI` | `TongTienThuoc` | `COALESCE(SUM(CHI_TIET_DON_THUOC.SoLuong * CHI_TIET_DON_THUOC.DonGiaKe), 0)` của đơn thuộc `MaLuotKham` |
| 6 | `VIEN_PHI` | `ThucThu` | `TongTienThuoc + TongTienDichVu - TruBHYT` (phải `>= 0`; không phải lịch sử giao dịch thu tiền) |

*(Lưu ý: `VIEN_PHI.TruBHYT` là **thuộc tính LƯU TRỮ**, kiểu `DECIMAL(18,2) NOT NULL DEFAULT 0`, KHÔNG phải thuộc tính dẫn xuất).*

---

## 3. Chi Tiết 13 Nhóm Quy Tắc Toàn Vẹn & Nghiệp Vụ (BR-V2-01 đến BR-V2-13)

### BR-V2-01: Chuyên biệt hóa Nhân sự `(d, p)`
- **Bảng liên quan:** `NHAN_VIEN`, `BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN` (`FK04`, `FK05`, `FK06`).
- **Quy tắc:**
  - `MaNV` ở 3 bảng con vừa là `PK` vừa là `FK` tham chiếu `NHAN_VIEN(MaNV)`.
  - **Disjoint (`d`):** Một `MaNV` chỉ được tồn tại ở tối đa 1 trong 3 bảng con (`BAC_SI`, `DIEU_DUONG`, `KY_THUAT_VIEN`).
  - **Partial (`p`):** Cho phép tồn tại nhân viên trong `NHAN_VIEN` không thuộc cả 3 bảng con (ví dụ nhân viên tiếp nhận, thu ngân, quản trị).
- **Thực thi CSDL:** Trigger `INSERT/UPDATE` trên 3 bảng con (hoặc cột phân loại + FK có điều kiện) để ngăn `MaNV` xuất hiện ở nhiều hơn 1 bảng con.

### BR-V2-02: Đợt Điều Trị Nội Trú `DOT_NOI_TRU`
- **Bảng liên quan:** `DOT_NOI_TRU` (`FK07 -> BENH_NHAN`).
- **Quy tắc:**
  - `MaDotNT` là `PK`; `MaBN` là `FK NOT NULL` tới `BENH_NHAN`.
  - `NgayRaVien` cho phép `NULL` khi bệnh nhân đang điều trị.
  - Khi `NgayRaVien IS NOT NULL`, bắt buộc `NgayRaVien >= NgayNhapVien`.
- **Thực thi CSDL:** `CHECK (NgayRaVien IS NULL OR NgayRaVien >= NgayNhapVien)`.

### BR-V2-03: Phân Giường Theo Khoảng Nửa Mở `[TuNgay, DenNgay)` & Chống Trùng Lịch
- **Bảng liên quan:** `PHAN_GIUONG` (`PK: (MaDotNT, MaGiuong, TuNgay)`; `FK18 -> DOT_NOI_TRU`, `FK19 -> GIUONG_BENH`).
- **Quy tắc:**
  - Quản lý theo ngày (`DATE`), **không quản lý nhiều lần chuyển giường trong cùng một ngày**.
  - `TuNgay` là ngày bắt đầu sử dụng giường; `DenNgay` là **ngày đầu tiên KHÔNG còn sử dụng giường** (khoảng nửa mở `[TuNgay, DenNgay)`).
  - `DenNgay` cho phép `NULL` khi đang sử dụng; khi kiểm tra trùng khoảng, `NULL` được coi là vô hạn (`+∞`).
  - Khi `DenNgay IS NOT NULL`, bắt buộc `DenNgay > TuNgay`.
  - Quan hệ với `DOT_NOI_TRU`: `NgayNhapVien` và `NgayRaVien` bao gồm cả ngày đó (`[NgayNhapVien, NgayRaVien + 1)`):
    - `TuNgay >= NgayNhapVien`.
    - Khi đợt đã ra viện (`NgayRaVien IS NOT NULL`), mọi phân giường của đợt phải có `DenNgay IS NOT NULL` và `DenNgay <= DATEADD(DAY, 1, NgayRaVien)`. *(Ví dụ: nhập và ra viện cùng ngày `10/01` thì phân giường hợp lệ là `[10/01, 11/01)`).*
  - **Không trùng khoảng:**
    1. Trên cùng `MaGiuong`: không có 2 phân giường có khoảng `[TuNgay, DenNgay)` giao nhau.
    2. Trên cùng `MaDotNT`: một đợt nội trú không được nằm 2 giường khác nhau trong các khoảng giao nhau.
  - **Đồng bộ & khóa tranh chấp:** Dùng transaction/trigger có khóa chống tranh chấp khi `INSERT`, `UPDATE` trên `PHAN_GIUONG` và khi cập nhật `NgayNhapVien`/`NgayRaVien` của `DOT_NOI_TRU`; đóng các phân giường đang mở trong **cùng transaction** cập nhật `NgayRaVien`.

### BR-V2-04: Lượt Khám Ngoại Trú / Nội Trú & Khóa Ngoại Ghép `FK11`
- **Bảng liên quan:** `LUOT_KHAM`, `DOT_NOI_TRU`, `BENH_NHAN` (`FK09`, `FK10`, `FK11`).
- **Quy tắc:**
  - `LUOT_KHAM.MaDotNT` là `FK` cho phép `NULL` (`NULL` = lượt khám ngoại trú).
  - Khi `MaDotNT IS NOT NULL` (lượt khám nội trú), `LUOT_KHAM.MaBN` phải trùng `DOT_NOI_TRU.MaBN`.
  - Triển khai bằng ràng buộc phụ `UQ(MaDotNT, MaBN)` trên `DOT_NOI_TRU` và **FK ghép `FK11`**: `LUOT_KHAM(MaDotNT, MaBN) → DOT_NOI_TRU(MaDotNT, MaBN)` (vẫn giữ `FK09: MaBN → BENH_NHAN` `NOT NULL`, và không làm mất khả năng `MaDotNT = NULL`).
  - **Khung thời gian khám nội trú:** Khi `MaDotNT IS NOT NULL`, `NgayGioKham >= đầu ngày NgayNhapVien` và nếu đợt đã ra viện thì `NgayGioKham < đầu ngày (NgayRaVien + 1 ngày)`.
  - Kiểm tra cả khi sửa `LUOT_KHAM` lẫn sửa `DOT_NOI_TRU`; không cho đổi `DOT_NOI_TRU.MaBN` khi còn dữ liệu liên quan không khớp.

### BR-V2-05: Quan Hệ `1 – 0..1` Của `DON_THUOC` & `VIEN_PHI` Theo `LUOT_KHAM`
- **Bảng liên quan:** `LUOT_KHAM`, `DON_THUOC` (`FK12`), `VIEN_PHI` (`FK20`).
- **Quy tắc:**
  - `DON_THUOC.MaLuotKham` và `VIEN_PHI.MaLuotKham` đều là `FK NOT NULL` và `UNIQUE`.
  - Mỗi lượt khám có tối đa 1 đơn thuốc và tối đa 1 hóa đơn viện phí.
  - `VIEN_PHI` chỉ tính theo lượt khám, không gộp nhiều lượt/cả đợt nội trú và không tách nhiều lần thu tiền.

### BR-V2-06: Ràng Buộc Đơn Thuốc, Thẻ BHYT & Chứng Chỉ Điều Dưỡng
- **Bảng liên quan:** `CHI_TIET_DON_THUOC`, `THUOC`, `LOAI_XET_NGHIEM`, `GIUONG_BENH`, `PHIEU_XET_NGHIEM`, `THE_BHYT`, `DON_THUOC`, `DIEU_DUONG`.
- **Quy tắc:**
  - `CHI_TIET_DON_THUOC.SoLuong > 0`.
  - Các cột đơn giá (`GIUONG_BENH.DonGiaNgay`, `THUOC.DonGia`, `LOAI_XET_NGHIEM.DonGia`, `CHI_TIET_DON_THUOC.DonGiaKe`, `PHIEU_XET_NGHIEM.DonGiaXN`) đều `>= 0`.
  - `THE_BHYT`: `NgayHetHan >= NgayBatDau`, `MucHuong` thuộc `[0, 1]`.
  - Một đơn thuốc đã xác nhận phải có ít nhất 1 dòng `CHI_TIET_DON_THUOC`.
  - `DIEU_DUONG.ChungChiHanhNghe` chỉ lưu 1 chứng chỉ chính.
- *(Ghi chú triển khai: Vì bảng `DON_THUOC` v2 không có cột trạng thái nháp/đã xác nhận, việc ép đơn đã xác nhận phải có chi tiết thuốc nên kiểm tra ở tầng Transaction/Stored Procedure sau khi chèn đủ `DON_THUOC` và `CHI_TIET_DON_THUOC`, tránh dùng trigger `AFTER INSERT` từng dòng trên `DON_THUOC` gây chặn trước khi kịp thêm chi tiết).*

### BR-V2-07: Trạng Thái Nhất Quán Của `PHIEU_XET_NGHIEM`
- **Bảng liên quan:** `PHIEU_XET_NGHIEM` (`FK15 -> LUOT_KHAM`, `FK16 -> LOAI_XET_NGHIEM`, `FK17? -> KY_THUAT_VIEN`).
- **Quy tắc:**
  - `MaNV_KTV`, `NgayGioXN`, `NgayGioTraKQ`, `KetQua`, `DanhGia` đều cho phép `NULL` khi phiếu đang chờ thực hiện.
  - Khi có `NgayGioXN` thì bắt buộc phải có `MaNV_KTV`.
  - Khi có `KetQua` hoặc `NgayGioTraKQ` thì bắt buộc phải có `MaNV_KTV` và `NgayGioXN`.
  - Khi ghi nhận kết quả hoàn tất phải có đủ cả `KetQua` và `NgayGioTraKQ`, đồng thời `NgayGioTraKQ >= NgayGioXN`.
  - Kết quả và thời gian phải được ghi trong cùng một transaction để tránh trạng thái thiếu nhất quán.
- *(Ghi chú triển khai: Vì `DonGiaXN` là `NOT NULL` trên sơ đồ 02, cần chụp `LOAI_XET_NGHIEM.DonGia` vào `DonGiaXN` ngay khi lập phiếu chỉ định; có thể cập nhật lại giá tại thời điểm `NgayGioXN` nếu chưa chốt thanh toán).*

### BR-V2-08: Giá Lịch Sử, Tính `TruBHYT` & Khóa Chi Phí Sau Thanh Toán
- **Bảng liên quan:** `CHI_TIET_DON_THUOC`, `PHIEU_XET_NGHIEM`, `THE_BHYT`, `VIEN_PHI`.
- **Quy tắc:**
  - `DonGiaKe` và `DonGiaXN` là giá lịch sử, không tự thay đổi khi `THUOC.DonGia` hay `LOAI_XET_NGHIEM.DonGia` thay đổi.
  - `VIEN_PHI.TruBHYT` là cột lưu trữ (`DECIMAL(18,2) NOT NULL DEFAULT 0`), `CHECK (TruBHYT >= 0)`. Giới hạn trên `TruBHYT <= TongTienThuoc + TongTienDichVu` kiểm tra qua transaction/procedure có khóa dữ liệu chi phí.
  - **Quy tắc BHYT mô phỏng của đồ án:**
    - Người lập hóa đơn chọn **tối đa 1 thẻ `THE_BHYT`** thuộc đúng `BENH_NHAN` của lượt khám và còn hạn tại ngày khám (`NgayBatDau <= CAST(NgayGioKham AS DATE) <= NgayHetHan`).
    - Nếu không có thẻ áp dụng: `TruBHYT = 0`.
    - Nếu có thẻ được chọn: `TruBHYT = ROUND((TongTienThuoc + TongTienDichVu) * MucHuong, 2)` (không cộng dồn nhiều thẻ).
    - Không tự tính lại `TruBHYT` khi `THE_BHYT.MucHuong` thay đổi sau này.
  - **Khóa sau thanh toán:** Sau khi `VIEN_PHI` đã ở trạng thái đã thanh toán, **khóa hoàn toàn** mọi thao tác:
    - Sửa/xóa `VIEN_PHI`;
    - Thêm/sửa/xóa `DON_THUOC`, `CHI_TIET_DON_THUOC`, `PHIEU_XET_NGHIEM` của lượt khám đó (kể cả `DonGiaKe`, `DonGiaXN`, `NgayGioXN`, `MaNV_KTV`, `KetQua`);
    - Thay đổi các khóa liên kết (`DON_THUOC.MaLuotKham`, `CHI_TIET_DON_THUOC.MaDonThuoc`, `PHIEU_XET_NGHIEM.MaLuotKham`, `VIEN_PHI.MaLuotKham`) có thể làm chuyển chi phí sang lượt khác.
  - Thao tác chốt thanh toán và thay đổi chi phí phải dùng **cùng cơ chế khóa** để không phát sinh tranh chấp.
  - Không tính tiền giường hay quyết toán cả đợt nội trú trong `VIEN_PHI`.

### BR-V2-09: Thuộc Tính Dẫn Xuất Nhân Sự/Bệnh Nhân & Không Tái Tạo `BN_NGOAI_TRU`
- **Quy tắc:**
  - `NHAN_VIEN.SoNamCongTac` và `BENH_NHAN.Tuoi` là dẫn xuất (`VIEW / Query`).
  - Số lần khám hoặc ngày khám gần nhất của bệnh nhân (nếu cần) truy vấn trực tiếp từ `LUOT_KHAM`, không tạo lại bảng `BN_NGOAI_TRU`.

### BR-V2-10: Thực Thi DDL / Trigger & Phạm Vi Kiểm Chứng
- **Quy tắc:**
  - Toàn bộ khóa chính, khóa ngoại, `NOT NULL`, `UNIQUE`, `CHECK` và ràng buộc liên bảng (1–13) phải được hiện thực hóa bằng DDL, constraint và trigger/transaction khi cài đặt CSDL.
  - Sơ đồ thiết kế không thay thế bước kiểm thử DDL/DB thực tế.

### BR-V2-11: Tách Bạch `GIUONG_BENH.TrangThai` (Khai Thác) & Tình Trạng Chiếm Giường
- **Bảng liên quan:** `GIUONG_BENH`, `PHAN_GIUONG`.
- **Quy tắc:**
  - `GIUONG_BENH.TrangThai` chỉ biểu diễn **tình trạng khai thác vật lý** (ví dụ: `Sẵn sàng`, `Bảo trì`, `Ngừng sử dụng`).
  - Việc giường có bệnh nhân đang nằm tại ngày `D` được xác định **hoàn toàn từ `PHAN_GIUONG`** (`TuNgay <= D AND (DenNgay IS NULL OR D < DenNgay)`), **không nhập tay** một trạng thái chiếm giường độc lập.
  - Chỉ cho phép phân giường đang ở trạng thái được phép khai thác (`Sẵn sàng`).

### BR-V2-12: Tối Đa 1 Đợt Nội Trú Đang Mở & Không Chồng Lấn Khoảng Điều Trị
- **Bảng liên quan:** `DOT_NOI_TRU`.
- **Quy tắc:**
  - Mỗi `BENH_NHAN` có tối đa **1 đợt nội trú đang mở** (`NgayRaVien IS NULL`) — triển khai bằng Conditional Unique Index: `UNIQUE (MaBN) WHERE NgayRaVien IS NULL`.
  - Khoảng điều trị của mỗi đợt theo quy ước ngày là `[NgayNhapVien, NgayRaVien + 1 ngày)` (nếu `NgayRaVien IS NULL` thì đầu cuối là `+∞`).
  - Hai đợt nội trú bất kỳ của cùng một `MaBN` không được giao nhau (áp dụng khi tạo mới hoặc cập nhật `MaBN`, `NgayNhapVien`, `NgayRaVien`).
  - Kiểm tra phải đặt **khóa theo `MaBN`** trong transaction/trigger để ngăn hai yêu cầu đồng thời cùng tạo 2 đợt chồng lấn; quy ước theo ngày không biểu diễn 2 đợt nhập viện tách biệt cho cùng bệnh nhân trong cùng một ngày.

### BR-V2-13: Kiểm Tra Lại Giới Hạn `TruBHYT` Khi Chi Phí Thay Đổi Trước Thanh Toán
- **Bảng liên quan:** `DON_THUOC`, `CHI_TIET_DON_THUOC`, `PHIEU_XET_NGHIEM`, `VIEN_PHI`.
- **Quy tắc:**
  - Trước khi hóa đơn thanh toán, mọi thao tác làm thay đổi tổng chi phí của lượt khám (thêm/sửa/xóa đơn hoặc dòng thuốc, đổi `SoLuong`/`DonGiaKe`, thêm/sửa/xóa phiếu XN, đổi `NgayGioXN`/`DonGiaXN`, hoặc đổi khóa liên kết chuyển chi phí sang lượt khác) đều phải kiểm tra lại `0 <= TruBHYT <= TongTienThuoc + TongTienDichVu`.
  - Khi chuyển chi phí giữa các lượt khám, phải kiểm tra **cả hai lượt** có hóa đơn (nếu một trong hai đã thanh toán -> từ chối theo BR-V2-08; nếu chưa thanh toán -> kiểm tra lại giới hạn `TruBHYT`).
  - Nếu `TruBHYT` đang lưu vượt quá tổng chi phí mới: hoặc **từ chối thay đổi**, hoặc **xác định và lưu lại `TruBHYT`** theo quy tắc BHYT đã chốt trong cùng transaction (không tự suy ra từ số tiền trừ cũ).
  - Đảm bảo `ThucThu >= 0` sau khi mọi kiểm tra hoàn tất; dùng cùng cơ chế khóa với thao tác chốt thanh toán.

---

## 4. Bảng Chốt Miền Giá Trị Tham Chiếu Cho DDL & API v2

Vì sơ đồ `02_Relational_Schema_18Bang_v2.xml` chưa khóa cứng các chuỗi Enum vào DDL, khi triển khai CSDL và API v2 cần chốt `CHECK` constraint thống nhất cho các cột phân loại sau:

| Bảng.Cột | Giá trị gợi ý chuẩn hóa | Ghi chú từ đặc tả v2 |
| :--- | :--- | :--- |
| `GIUONG_BENH.TrangThai` | `'SAN_SANG'`, `'BAO_TRI'`, `'NGUNG_SU_DUNG'` | Chỉ là tình trạng khai thác (Mục 11); không dùng `'DANG_SU_DUNG'` |
| `LUOT_KHAM.TrangThai` | `'CHO_KHAM'`, `'DANG_KHAM'`, `'CHO_XET_NGHIEM'`, `'HOAN_TAT'`, `'HUY'` | Phục vụ luồng khám & chỉ định |
| `VIEN_PHI.TrangThaiThanhToan` | `'CHUA_THANH_TOAN'`, `'DA_THANH_TOAN'` | Khi `'DA_THANH_TOAN'` khóa toàn bộ chi phí (Mục 8, 13) |
| `VIEN_PHI.HinhThucThanhToan` | `'TIEN_MAT'`, `'CHUYEN_KHOAN'`, `'THE'` | Hoặc bổ sung `'VIETQR'` nếu dùng cổng QR |
| `NHAN_VIEN.GioiTinh`, `BENH_NHAN.GioiTinh` | `'NAM'`, `'NU'`, `'KHAC'` | Thống nhất giữa UI và CSDL |
| `BENH_NHAN.CCCD`, `NHAN_VIEN.CCCD` | Chuỗi 12 ký tự số | Cân nhắc bổ sung `UNIQUE` (hoặc filtered unique nếu cho phép NULL) khi viết DDL |
