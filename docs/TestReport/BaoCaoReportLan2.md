# BÁO CÁO RÀ SOÁT LẦN 2 & HƯỚNG DẪN SỬA CHI TIẾT BÁO CÁO ĐỒ ÁN QUẢN LÝ BỆNH VIỆN (THEO PHƯƠNG ÁN GIỮ SƠ ĐỒ EER MỚI 19 BẢNG)

> **Tài liệu đối chiếu:** Bản thảo PDF [doan_csdlnc_qlbv.pdf](file:///C:/Users/Administrator/.gemini/antigravity/brain/bf3e0005-bb1b-420c-bb19-ccf4fa5f47c1/.user_uploaded/media_1794706151351_3cab4383.pdf) (49 trang)  
> **Các nguồn đối chiếu trong dự án:**
> - [Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md) (Báo cáo rà soát lần 1)
> - [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_ChuanHoa_19Bang.xml) & [02_Relational_Schema_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_19Bang.xml)
> - Bộ tài liệu Tuần 3 (`W3-A`, `W3-B`, `W3-C`) & Tuần 4 (`W4-A`, `W4-B`, `W4-C`, `W4-D`, `00_Khoi_tao_va_nap_mau.sql`, `01_Doi_soat_sau_nap.sql`, `kiem_tra_tinh.py`, `seed.json`)
> - Nhánh Web App [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma)

---

## PHẦN 0: TỔNG QUAN CHIẾN LƯỢC SỬA & CHỐT NGUỒN CHUẨN TRƯỚC KHI CHỈNH WORD

### 0.1. Tình trạng hiện tại của bản demo 49 trang (`doan_csdlnc_qlbv.pdf`)
So với thời điểm rà soát lần 1 (bản thảo `.docx` chỉ mới dừng ở cuối Chương 3), bản PDF demo 49 trang **đã hoàn thành được các đầu việc lớn sau**:
- Xóa trang bìa trùng thứ 2; sửa một số lỗi chính tả tiêu đề Chương 1, Chương 3 (`Armstrong`), thêm bảng trống Phần 4/5/6 vào bố cục.
- Điền cột ký hiệu vào Bảng ràng buộc phân cấp ở Chương 2.
- Chuyển Chương 3 sang mô hình **19 bảng** (`NV_HANH_CHINH`, `DICH_VU`, `SU_DUNG_DV`, `HOA_DON`, `LICH_TRUC`; gộp BHYT vào `BENH_NHAN`; bổ sung cây `BENH_NHAN [o, t]`), điền 25 khóa ngoại ở cuối Chương 3.
- Nạp đầy đủ nội dung cho **Chương 4** (Schema, Data Dictionary, Constraints), **Chương 5** (Kế hoạch & 12 ca kiểm thử `TC01–TC12`), và bước đầu mở **Chương 6**.

Tuy nhiên, bản PDF 49 trang **vẫn giữ nguyên Chương 1, Chương 2 và Hình 1 Sơ đồ EER (trang 16) của mô hình 20 bảng cũ (Tuần 1–2)**, đồng thời Chương 3–6 phát sinh các lỗi trình bày, lỗi đánh số `CK`, lỗi câu lệnh `INSERT` trong Test Case và một số điểm chưa đồng bộ giữa nhánh **T-SQL Tuần 4 (`W4-D`)** với nhánh **Prisma/PostgreSQL (`schema.prisma` + Báo cáo Lần 1)**.

### 0.2. Hai việc bắt buộc chốt trước khi bắt tay sửa Chương 4–5
Theo định hướng bạn đã chọn (**Sửa lại Chương 1, Chương 2, thay Hình 1 bằng EER mới 19 bảng ở trang 16, đồng thời sửa toàn bộ lỗi nhẹ và điểm vướng ở Chương 3, 4, 5, 6**), nhóm chỉ cần thống nhất **1 quyết định duy nhất** để Chương 4 và Chương 5 không tự mâu thuẫn với file code nộp kèm:

| Hạng mục cần chốt | Lựa chọn A: Chốt theo bộ SQL Server Tuần 4 (`00_Khoi_tao_va_nap_mau.sql` + `W4-B/C/D`) | Lựa chọn B: Chốt theo Báo cáo Lần 1 & Web App ([schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma)) |
| :--- | :--- | :--- |
| **Hệ quản trị CSDL trình bày ở Ch. 4–5** | Microsoft SQL Server (T-SQL `2019/2022`). | PostgreSQL 16 + Prisma ORM (hoặc viết lại DDL SQL Server tương ứng). |
| **Cây `NHAN_VIEN`** | **`[d, p]` (Disjoint, Partial)** — khớp 100% với Hình `01_EER_ChuanHoa_19Bang.xml` và Bước 7 Ch.3 (tr. 18). | Cần giữ `[d, p]` giống `01_EER_ChuanHoa_19Bang.xml` (nếu đổi `[d, t]` phải sửa lại cả XML EER và Ch.3). |
| **Cây `BENH_NHAN`** | **`[o, t]` (Overlapping, Total)** — khớp `01_EER_ChuanHoa_19Bang.xml` và Ch.3 (tr. 18). | **`[o, t]`** (Overlapping, Total). |
| **`HOA_DON.TienBenhNhanTra`** | Không lưu cột vật lý trong bảng `HOA_DON` (chỉ có 8 cột trong `00_Khoi_tao_va_nap_mau.sql`); bỏ hoặc chú thích là tính qua `VIEW`/`SELECT` ở Ch.3 (tr. 22). | Lưu cột vật lý / Computed Column `TienBenhNhanTra` (`AS (TongTienGoc - TienBHYTChiTra) PERSISTED`) — phải **bổ sung dòng này vào bảng `HOA_DON` trang 36** để khớp Ch.3 (tr. 22) và `02_Relational_Schema_19Bang.xml`. |
| **Hành vi `ON DELETE`** | Toàn bộ 25 FK dùng `ON DELETE NO ACTION` (trong `00_Khoi_tao_va_nap_mau.sql`). Cần sửa câu chữ ở Ch.3 (tr. 21–22) từ `CASCADE` sang `NO ACTION` (hoặc giải thích bản thiết kế lý thuyết dùng `CASCADE`, bản T-SQL cài `NO ACTION`). | 5 bảng IS-A + `CT_DON_THUOC` dùng `ON DELETE CASCADE`, các FK còn lại `Restrict`/`NoAction` (khớp Ch.3 & `schema.prisma`). |
| **Tên Filtered Unique Index** | `UX_BENH_NHAN_01` (`SoBHYT`) và `UX_BENH_NHAN_02` (`CCCD`) theo file `00_Khoi_tao_va_nap_mau.sql`. | `UX_BENH_NHAN_CCCD` và `UX_BENH_NHAN_BHYT` (phải sửa lại file SQL nếu nộp SQL). |
| **Tỷ lệ `NOT NULL` / `NULL` trong 132 cột** | `96 NOT NULL / 36 NULL` (khớp `00_Khoi_tao_va_nap_mau.sql`). | Nếu giữ bảng kiểu đang viết ở Ch.4 PDF thì không được chép con số kiểm toán `96 NOT NULL / 36 NULL` hay `1.405` asserts của gói Python/SQLite Tuần 4 vào. |

> **Khuyến nghị thực tế:**
> - Giữ **`[d, p]`** cho `NHAN_VIEN` và **`[o, t]`** cho `BENH_NHAN` ở toàn bộ Chương 1, 2, 3, 6 để **khớp tuyệt đối 100% với [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_ChuanHoa_19Bang.xml)**.
> - Nếu nộp đồ án môn CSDL Nâng cao kèm bộ kịch bản **`W4-D` (`00_Khoi_tao_va_nap_mau.sql`)**, hãy chọn **Lựa chọn A** (áp dụng các chỉnh sửa nhỏ ở Phần 4 & Phần 5 dưới đây để Ch.3–Ch.5 ăn khớp hoàn toàn với file `.sql` thật). Nếu nộp kèm **Web App PostgreSQL/Prisma**, chọn **Lựa chọn B** và nhớ sửa tất cả lỗi nội tại của Chương 4–5 được liệt kê ở mục **5.1 & 5.2**.

---

## PHẦN 1: SỬA TRANG BÌA (TRANG 1) & TRANG NHẬN XÉT GIẢNG VIÊN (TRANG 2)

### 1.1. Trang bìa (Trang 1 PDF)
- **Hiện trạng trong PDF:**
  - Ghi `Giảng viên hướng dẫn:` / xuống dòng `Huỳnh Minh Trí` (thiếu học vị `ThS.`).
  - Dùng lẫn dấu gạch ngang `-` và dấu `–` ở danh sách sinh viên.
  - Thành viên số 5: `5. Cô Thành Long – 31244102192` (**11 chữ số**, trong khi 4 thành viên đầu đều 10 chữ số `3124410xxx`).
  - Dòng cuối ghi `TP. HCM THÁNG 11/2026`.
- **Thao tác sửa:**
  1. Bổ sung học vị trên 1 dòng: `Giảng viên hướng dẫn: ThS. Huỳnh Minh Trí`.
  2. Thống nhất dùng cùng một định dạng MSSV và dấu phân cách cho cả 5 thành viên; **kiểm tra lại MSSV của bạn Cô Thành Long** (khả năng thừa số `1` hoặc `2`, ví dụ `3124410219` hoặc `3124410292`).
  3. Chuẩn hóa dòng địa danh – thời gian ở chân trang bìa: `TP. HỒ CHÍ MINH, THÁNG 11/2026`.

### 1.2. Trang Nhận xét của Giảng viên (Trang 2 PDF)
- **Hiện trạng trong PDF:** Chứa tiêu đề `NHẬN XÉT CỦA GIẢNG VIÊN` và **24 dòng chấm thủ công (`......`)** chiếm nguyên trang trống.
- **Thao tác sửa:** Xóa toàn bộ 24 dòng chấm và chèn bảng chuẩn sau:

| HẠNG MỤC ĐÁNH GIÁ | NỘI DUNG / ĐIỂM |
| :--- | :--- |
| **Nhận xét về mô hình & tài liệu** | *(Phần dành cho Giảng viên)*<br><br><br><br> |
| **Nhận xét về cài đặt & kiểm thử** | *(Phần dành cho Giảng viên)*<br><br><br> |
| **Điểm quá trình / Điểm báo cáo** | …………… / 10 |
| **Ngày … tháng … năm 2026** | **Giảng viên hướng dẫn**<br>*(Ký và ghi rõ họ tên)*<br><br> |

---

## PHẦN 2: SỬA CHI TIẾT CHƯƠNG 1 — TỔNG QUAN VÀ KHẢO SÁT (TRANG 5 – 12)

Toàn bộ Chương 1 đang phản ánh **đề bài 20 bảng cũ** (`KY_THUAT_VIEN`, `THE_BHYT`, `PHIEU_XET_NGHIEM`, `LOAI_XET_NGHIEM`, `VIEN_PHI`). Dưới đây là nội dung thay thế chi tiết từng mục để bạn sao chép trực tiếp vào Word.

### 2.1. Sửa Mục I.1 & I.3.1 — Đối tượng & Phạm vi hệ thống (Trang 5 – 6 PDF)
1. **Trang 5 (cuối đoạn giới thiệu nhân sự):**
   - **Tìm:** `(bác sĩ, điều dưỡng, kỹ thuật viên)`
   - **Thay bằng:** `(bác sĩ, điều dưỡng và nhân viên hành chính)`
2. **Trang 6 (Mục 3.1 — Phạm vi chức năng):**
   - **Lỗi trình bày:** Đoạn `Quản lý hồ sơ bệnh nhân: ...` và `Quy trình khám chữa bệnh & Cận lâm sàng: ...` đang **dính liền trên cùng một đoạn văn**.
   - **Nội dung lỗi cần bỏ:** Nhắc đến `Kỹ thuật viên xét nghiệm`, `lịch sử thẻ Bảo hiểm y tế (BHYT)`, và `phiếu xét nghiệm chuyên môn`.
   - **Thao tác:** Xóa khối đoạn lỗi ở Mục 3.1 (trang 6) và dán thay bằng 5 gạch đầu dòng tách đoạn rõ ràng sau:

```text
• Quản lý tổ chức & nhân sự y tế: Quản lý danh mục Khoa, Phòng chức năng (phòng khám, phòng điều trị nội trú, phòng kỹ thuật/xét nghiệm), Giường bệnh nội trú và hồ sơ Nhân viên bệnh viện phân nhóm theo Bác sĩ, Điều dưỡng, Nhân viên hành chính; hỗ trợ lập và theo dõi Lịch trực theo ngày và ca trực tại từng phòng.
• Quản lý hồ sơ bệnh nhân: Tiếp nhận và lưu trữ thông tin định danh của Bệnh nhân (bao gồm thông tin Bảo hiểm y tế hiện hành như số thẻ BHYT và mức hưởng gắn trực tiếp trên hồ sơ bệnh nhân để tối ưu tra cứu), phân loại linh hoạt theo đối tượng Bệnh nhân ngoại trú và Bệnh nhân nội trú (cho phép một bệnh nhân vừa có hồ sơ ngoại trú vừa nhập viện nội trú).
• Quy trình khám chữa bệnh & Cận lâm sàng: Ghi nhận đầy đủ nhật ký Lượt khám (triệu chứng, chỉ số sinh tồn, chẩn đoán sơ bộ/xác định, hướng xử trí), cấp Đơn thuốc kèm Chi tiết đơn thuốc từ danh mục Thuốc, và chỉ định thực hiện các Dịch vụ kỹ thuật/cận lâm sàng (xét nghiệm, chẩn đoán hình ảnh, thủ thuật) thông qua Danh mục dịch vụ và Chi tiết sử dụng dịch vụ do Điều dưỡng chuyên trách thực hiện.
• Quản lý điều trị nội trú & Phân giường: Theo dõi quá trình nhập viện của Bệnh nhân nội trú, bác sĩ phụ trách theo dõi và lịch sử phân bổ Giường bệnh theo khoảng thời gian [Ngày bắt đầu, Ngày kết thúc], bảo đảm không xếp trùng giường tại cùng thời điểm.
• Thanh toán viện phí: Tổng hợp chi phí khám bệnh, thuốc và dịch vụ kỹ thuật để lập Hóa đơn quyết toán cho từng lượt khám do Nhân viên hành chính (thu ngân) thực hiện, tính toán phần BHYT chi trả và phần bệnh nhân tự thanh toán.
```

### 2.2. Sửa Mục II.2 — Mô tả 5 Quy trình Nghiệp vụ & Bổ sung Quy trình Trực (Trang 7 – 9 PDF)
Thay thế các đoạn bị lệch tên thực thể trong 5 quy trình hiện tại và bổ sung quy trình phân công lịch trực để khớp 100% với `01_EER_ChuanHoa_19Bang.xml`:

1. **Quy trình 1 (Trang 7):**
   - **Tìm:** `Tạo lập hồ sơ BENH_NHAN và ghi nhận thông tin THE_BHYT tương ứng.`
   - **Thay bằng:** `Tạo lập hoặc tra cứu hồ sơ BENH_NHAN, ghi nhận trực tiếp thông tin bảo hiểm y tế hiện hành (SoBHYT, MucHuongBHYT nếu có) trên hồ sơ bệnh nhân, đồng thời xác lập phân loại ngoại trú (CoNgoaiTru / BN_NGOAI_TRU) hoặc nội trú (CoNoiTru / BN_NOI_TRU).`
2. **Quy trình 2 (Trang 7 – 8):**
   - **Tìm toàn bộ đoạn nhắc tới `PHIEU_XET_NGHIEM`, `LOAI_XET_NGHIEM`, `Kỹ thuật viên tại phòng xét nghiệm`.**
   - **Thay bằng đoạn chuẩn 19 bảng:**
     ```text
     Nếu cần cận lâm sàng, bác sĩ chỉ định các kỹ thuật thuộc danh mục DICH_VU và ghi nhận qua thực thể kết hợp SU_DUNG_DV gắn với LUOT_KHAM và thời gian chỉ định. Điều dưỡng có chuyên môn phụ trách thực hiện (MaKTVThucHien tham chiếu DIEU_DUONG) tiến hành kỹ thuật và cập nhật kết quả (KetQuaCLS) trực tiếp vào bản ghi SU_DUNG_DV để bác sĩ đưa ra chẩn đoán xác định (ChanDoanXacDinh).
     ```
3. **Quy trình 4 (Trang 8):**
   - **Tìm:** `TuNgay`
   - **Thay bằng:** `NgayBatDau` (và diễn giải thêm `NgayKetThuc`, `GiaGiuongNgay`, `GhiChuChuyenGiuong` khi bệnh nhân chuyển giường hoặc xuất viện).
4. **Quy trình 5 (Trang 8 – 9):**
   - **Tìm các cụm từ cũ:** `DenNgay`, `hóa đơn VIEN_PHI`, `phiếu xét nghiệm cận lâm sàng`, `nếu có THE_BHYT hợp lệ căn cứ theo MucHuong`.
   - **Thay bằng:** `NgayKetThuc`, `hóa đơn HOA_DON (do nhân viên hành chính thu ngân thuộc NV_HANH_CHINH lập)`, `các dịch vụ cận lâm sàng trong SU_DUNG_DV`, và `nếu BENH_NHAN có SoBHYT hợp lệ sẽ căn cứ theo MucHuongBHYT để xác định TienBHYTChiTra và TienBenhNhanTra`.
   - **Lưu ý đặc biệt về câu `"Chi phí lưu trú tại buồng bệnh"` ở Quy trình 5 (tr. 8–9):** Phải thêm 1 câu giải thích rõ: *“Ở mức lược đồ quan hệ chuẩn hóa, bảng `HOA_DON` liên kết trực tiếp 1-1 với `LUOT_KHAM`; chi phí lưu trú tại giường bệnh (`PHAN_GIUONG.GiaGiuongNgay`) được tầng ứng dụng tổng hợp vào `TongTienGoc` của hóa đơn quyết toán khi xuất viện (chi tiết xem phần giới hạn P04 ở Chương 6).”* Điều này giúp tránh bị giảng viên hỏi vặn tại sao Quy trình 5 nhắc tiền giường mà trong Bảng `HOA_DON` không có `FK` trỏ tới `PHAN_GIUONG`.
5. **Bổ sung Quy trình 6 — Phân công lịch trực nhân sự (chèn cuối Mục II.2, trang 9):**
   ```text
   Quy trình 6: Phân công lịch trực chuyên môn và hành chính
   Đầu mỗi kỳ công tác, quản lý khoa lập kế hoạch LICH_TRUC cho từng NHAN_VIEN theo ngày trực (NgayTruc) và ca trực (CaTruc: Sáng / Chiều / Đêm) gắn với một PHONG cụ thể. Mỗi nhân viên trong một ngày và một ca trực chỉ được phân công trực tại tối đa một phòng để bảo đảm không chồng chéo lịch làm việc và phục vụ chấm công điểm danh (TrangThaiDiemDanh).
   ```

### 2.3. Sửa Mục III — Bảng Tổng hợp Danh mục Quy tắc Nghiệp vụ `BR01–BR25` (Trang 9 – 12 PDF)
- **Nguyên nhân lỗi số thứ tự ở bản PDF hiện tại:** Trong bản demo, nhóm đã chèn thêm dòng `LICH_TRUC` vào giữa bảng tại vị trí **`BR16`**, làm toàn bộ các quy tắc từ `BR16` đến `BR24` bị **đẩy lùi 1 số thành `BR17–BR25`**, dẫn đến:
  1. Chương 5 (TC11, trang 45) vẫn trích **`BR22`** cho ràng buộc chống trùng giường, nhưng trong Bảng BR quy tắc đó bị đẩy thành **`BR23`**!
  2. Dòng `BR25` ở trang 12 bị **cụt câu cuối**: `"...mỗi lượt khám có tối đa một đơn thuốc và tối đa"`.
- **Cách xử lý khuyến nghị (Giữ nguyên số `BR01–BR24` gốc và đặt `LICH_TRUC` ở cuối thành `BR25` — hoặc cập nhật đồng bộ `BR22 -> BR23` ở Chương 5):**
  Khuyến nghị **đặt `LICH_TRUC` vào cuối bảng làm `BR25`** để giữ đúng chuẩn số `BR01–BR24` (trong đó `BR22` = Phân giường không trùng thời gian, khớp `TC11` ở Chương 5 và khớp Báo cáo rà soát lần 1). Dưới đây là **những dòng cần sửa trong Bảng BR** (kèm sửa chính tả và định dạng):

| Mã BR | Thực thể / Quan hệ | Quy tắc nghiệp vụ chuẩn hóa (Business Rule) | Bản số | Ghi chú / Ràng buộc tham gia |
| :--- | :--- | :--- | :--- | :--- |
| **BR04** | `NHAN_VIEN – (BAC_SI, DIEU_DUONG, NV_HANH_CHINH)` | Mỗi nhân viên thuộc tối đa một trong ba nhóm chuyên biệt (`BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`), cho phép tồn tại nhân sự khối hỗ trợ/kỹ thuật chung ngoài ba bảng con này. | `IS-A` | **Disjoint, Partial `[d, p]`** (Khớp `01_EER_ChuanHoa_19Bang.xml` & Ch.3 Bước 7). |
| **BR05** | `BENH_NHAN – (BN_NGOAI_TRU, BN_NOI_TRU)` | Một bệnh nhân bắt buộc thuộc ít nhất một nhóm ngoại trú hoặc nội trú, và có thể thuộc đồng thời cả hai nhóm trong vòng đời hồ sơ (từng khám ngoại trú rồi nhập viện nội trú). | `IS-A` | **Overlapping, Total `[o, t]`** (Khớp `01_EER_ChuanHoa_19Bang.xml` & Ch.3 Bước 7). |
| **BR06** | `BENH_NHAN` (BHYT) | Thông tin bảo hiểm y tế hiện hành (`SoBHYT`, `MucHuongBHYT`) được gộp trực tiếp vào thực thể `BENH_NHAN`. Mỗi bệnh nhân có 0 hoặc 1 mã số BHYT duy nhất đang hiệu lực. | Thuộc tính `0..1` | `SoBHYT` là `UNIQUE` có điều kiện (`WHERE SoBHYT IS NOT NULL`); `MucHuongBHYT` từ `0` đến `100` (hoặc `NULL` khi không có thẻ). |
| **BR10** | `BENH_NHAN – LUOT_KHAM` *(hoặc kiểm tra lại dòng BR10 trong PDF)* | Sửa ký hiệu `1:0…1` thành **`1:0..1`** (hoặc đúng bản số của quan hệ tương ứng). | `1:0..1` | Thống nhất dùng đúng 2 dấu chấm `..` trên toàn bộ bảng. |
| **BR12** | `LUOT_KHAM – SU_DUNG_DV` | Một lượt khám có thể có không hoặc nhiều lượt chỉ định dịch vụ kỹ thuật / cận lâm sàng; mỗi bản ghi chỉ định phải thuộc về đúng một lượt khám. | `1:N` | `LUOT_KHAM` Partial; `SU_DUNG_DV` Total (Thực thể kết hợp). |
| **BR13** | `DICH_VU – SU_DUNG_DV` | Một loại dịch vụ kỹ thuật có thể **được dùng** trong nhiều lượt chỉ định khám; mỗi bản ghi sử dụng dịch vụ ứng với đúng một dịch vụ trong danh mục. | `1:N` | Sửa typo `"được dung"` thành `"được dùng"`. |
| **BR14** | `DIEU_DUONG – SU_DUNG_DV` | Một điều dưỡng chuyên trách có thể thực hiện nhiều dịch vụ kỹ thuật / cận lâm sàng; mỗi bản ghi `SU_DUNG_DV` do một điều dưỡng thực hiện (`MaKTVThucHien` tham chiếu `DIEU_DUONG(MaNV)`). | `1:N` | Sửa typo `"PHIEU_XET_NGHEM Total"` thành `SU_DUNG_DV Total`, `DIEU_DUONG Partial`. |
| **BR15** | `LUOT_KHAM – HOA_DON` | Mỗi lượt khám phát sinh tối đa một hóa đơn quyết toán viện phí; mỗi hóa đơn thuộc đúng một lượt khám duy nhất. *(Và do một `NV_HANH_CHINH` thu ngân lập — 1:N)*. | `1:0..1` | `LUOT_KHAM` Partial; `HOA_DON` Total; `MaLuotKham` là `UNIQUE`. |
| **BR20** | Quy định BHYT | Sửa `"thẻ BHYT"` thành `"số BHYT (SoBHYT) và mức hưởng (MucHuongBHYT) hợp lệ trên hồ sơ BENH_NHAN"`. | Ràng buộc miền & logic | Khi `SoBHYT IS NULL` thì `TienBHYTChiTra = 0`; luôn có `TienBHYTChiTra <= TongTienGoc`. |
| **BR21** | `CT_DON_THUOC – THUOC` | Sửa lỗi chính tả `"Số lương thuốc"` thành **`"Số lượng thuốc"`**. | Ràng buộc miền | `CT_DON_THUOC.SoLuong > 0`, kiểm soát tồn kho (`SoLuongTon`). |
| **BR22** | `BN_NOI_TRU – PHAN_GIUONG – GIUONG_BENH` | **Phân giường theo thời gian**: Tại cùng một khoảng thời gian `[NgayBatDau, NgayKetThuc]`, một giường bệnh chỉ cấp cho tối đa một bệnh nhân nội trú và một bệnh nhân chỉ nằm tại một giường (`NgayKetThuc >= NgayBatDau`). | `N:M` (có thời gian) | Khóa chính `(MaBN, MaGiuong, NgayBatDau)` + `UNIQUE(MaGiuong, NgayBatDau)`. *(Nếu giữ bảng có `LICH_TRUC` ở `BR16` thì đây là `BR23`, nhớ sửa Chương 5 theo!)*. |
| **BR23** | Người thực hiện dịch vụ CLS | Mỗi dịch vụ kỹ thuật trong `SU_DUNG_DV` bắt buộc do một **Điều dưỡng** (`DIEU_DUONG`, đóng vai trò kỹ thuật viên điều dưỡng) đã xác lập trong hệ thống thực hiện (`MaKTVThucHien` tham chiếu `DIEU_DUONG`). | Toàn vẹn tham chiếu | Thay cho `"người thực hiện phiếu xét nghiệm phải là kỹ thuật viên"` cũ. |
| **BR24** | Ràng buộc 1-1 Hóa đơn & Đơn thuốc | Mỗi lượt khám có tối đa một đơn thuốc (`DON_THUOC.MaLuotKham` là `UNIQUE`) và tối đa **một hóa đơn quyết toán (`HOA_DON.MaLuotKham` là `UNIQUE`)**. | `1:0..1` | Sửa câu bị cụt cuối trang 12 (`"...và tối đa"`). |
| **BR25** | `NHAN_VIEN – LICH_TRUC – PHONG` | Một nhân viên có thể được phân nhiều ca trực; mỗi bản ghi `LICH_TRUC` gắn với đúng 1 nhân viên và 1 phòng theo `(NgayTruc, CaTruc)`. Tại một thời điểm `(NgayTruc, CaTruc)`, một nhân viên chỉ trực tại tối đa 1 phòng. | `1:N` (theo ca) | `NHAN_VIEN` Partial; `LICH_TRUC` Total; khóa chính tối ưu `(MaNV, NgayTruc, CaTruc)`. |

> **Lưu ý kiểm tra trong file Word gốc của Chương 1:** Trước khi dán, rà `Ctrl + F` toàn bộ Chương 1 xem còn bất kỳ chữ `THE_BHYT`, `PHIEU_XET_NGHIEM`, `LOAI_XET_NGHIEM`, `VIEN_PHI`, `KY_THUAT_VIEN`, `TuNgay`, `DenNgay`, `Bussiness`, `quy tắt` nào sót lại hay không.

---

## PHẦN 3: SỬA CHI TIẾT CHƯƠNG 2 & THAY HÌNH 1 SƠ ĐỒ EER MỚI (TRANG 12 – 16)

### 3.1. Sửa Mục II.1 — Cây chuyên biệt hóa `NHAN_VIEN` (Trang 14 PDF)
- **Các lỗi ở bản PDF hiện tại:**
  1. Dòng mô tả `BAC_SI` bị **ngắt dòng gãy thành 2 bullet** (`• BAC_SI: Kế thừa toàn bộ thông tin từ` / `• NHAN_VIEN; bổ sung ... TrinhDoHocVan, SoChungChiHanhNghe`).
  2. Vẫn liệt kê subclass cũ là `KY_THUAT_VIEN (ChuyenMonXetNghiem, STT_ThietBiPhuTrach)` thay vì `NV_HANH_CHINH`.
  3. Tên thuộc tính của `BAC_SI` (`TrinhDoHocVan`, `SoChungChiHanhNghe`) và `DIEU_DUONG` (`CapBac`, `ChungChiHanhNghe`) **không khớp** với tên cột trong Chương 3–4 (`HocVi`, `SoCCHN`, `TrinhDoChuyenMon`, `SoCCHN_DD`).
- **Nội dung thay thế chuẩn cho Mục II.1 (copy-paste vào Word):**

```text
1. Cây chuyên biệt hóa NHAN_VIEN — Ràng buộc [d, p] (Disjoint, Partial)
• Thực thể cha (Superclass) NHAN_VIEN: Mã nhân viên (MaNV - PK), Họ tên (HoTen), Ngày sinh (NgaySinh), Giới tính (GioiTinh), Số CCCD (CCCD), Số điện thoại (SoDienThoai), Email, Địa chỉ (DiaChi), Ngày vào làm (NgayVaoLam), Hệ số lương (HeSoLuong), Loại nhân viên (LoaiNV), Số năm công tác (SoNamCongTac — thuộc tính dẫn xuất từ NgayVaoLam ở mức ý niệm), thuộc Khoa (MaKhoa - FK).
• Thực thể con BAC_SI (Subclass): Kế thừa toàn bộ thuộc tính của NHAN_VIEN; bổ sung Học vị (HocVi), Chuyên khoa (ChuyenKhoa), Số chứng chỉ hành nghề (SoCCHN), Phụ cấp khám (PhuCapKham).
• Thực thể con DIEU_DUONG (Subclass): Kế thừa toàn bộ thuộc tính của NHAN_VIEN; bổ sung Trình độ chuyên môn (TrinhDoChuyenMon), Số chứng chỉ hành nghề điều dưỡng (SoCCHN_DD), Phụ cấp trực (PhuCapTruc). Đảm nhiệm chăm sóc bệnh nhân và thực hiện các kỹ thuật cận lâm sàng trong SU_DUNG_DV.
• Thực thể con NV_HANH_CHINH (Subclass): Kế thừa toàn bộ thuộc tính của NHAN_VIEN; bổ sung Bộ phận phụ trách (BoPhanPhuTrach), Chức vụ hành chính (ChucVuHC), Bậc kỹ thuật (BacKyThuat). Đảm nhiệm tiếp đón, điều phối và thu ngân lập HOA_DON.
• Giải thích ràng buộc [d, p]: Một nhân viên chỉ có thể thuộc tối đa một vai trò chuyên biệt trong 3 bảng con (Disjoint); đồng thời cho phép hệ thống ghi nhận một số nhân sự hỗ trợ/kỹ thuật thuộc bảng cha NHAN_VIEN chưa phân bổ vào 3 nhóm trên (Partial).
```

*(Ghi chú: Nếu nhóm chọn Lựa chọn B theo Prisma Web App, bổ sung thêm `MatKhau` ở `NHAN_VIEN` để khớp [02_Relational_Schema_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_19Bang.xml); nếu chọn Lựa chọn A theo `00_Khoi_tao_va_nap_mau.sql` thì giữ danh sách trên như `W4-B`.)*

### 3.2. Sửa Mục II.2 — Cây chuyên biệt hóa `BENH_NHAN` (Trang 15 PDF)
- **Các lỗi ở bản PDF hiện tại:**
  1. Đang ghi ràng buộc là **`[d, t]` (Disjoint, Total)** — **TRÁI NGƯỢC** với Sơ đồ EER mới `01_EER_ChuanHoa_19Bang.xml` (`o, t`) và Chương 3 Bước 7 trang 18 (`Overlapping, Total`).
  2. Liệt kê thuộc tính cũ Tuần 1–2 (`SDT`, `DiaChi_Duong, DiaChi_Phuong, DiaChi_Quan`, `(Tuoi)`, `MaHoSoNoiTru, NguoiNhaLienHe`, `SoLanKhamGanNhat, NgayKhamGanNhat`) không tồn tại ở Chương 3–4.
- **Nội dung thay thế chuẩn cho Mục II.2:**

```text
2. Cây chuyên biệt hóa BENH_NHAN — Ràng buộc [o, t] (Overlapping, Total)
• Thực thể cha (Superclass) BENH_NHAN: Mã bệnh nhân (MaBN - PK), Họ tên (HoTen), Ngày sinh (NgaySinh), Giới tính (GioiTinh), Số CCCD (CCCD), Số điện thoại (SoDienThoai), Số thẻ BHYT (SoBHYT), Mức hưởng BHYT (MucHuongBHYT), Địa chỉ (DiaChi — đơn trị hóa), Nhóm máu (NhomMau), Cờ ngoại trú (CoNgoaiTru), Cờ nội trú (CoNoiTru). (Thuộc tính Tuổi được dẫn xuất khi truy vấn từ NgaySinh nên không lưu dư thừa vật lý).
• Thực thể con BN_NGOAI_TRU (Subclass): Kế thừa toàn bộ thuộc tính của BENH_NHAN; bổ sung Số sổ khám bệnh (SoSoKhamBenh), Ngày đăng ký đầu (NgayDangKyDau), Tình trạng theo dõi (TinhTrangTheoDoi).
• Thực thể con BN_NOI_TRU (Subclass): Kế thừa toàn bộ thuộc tính của BENH_NHAN; bổ sung Số hồ sơ bệnh án (SoHoSoBenhAn), Ngày nhập viện (NgayNhapVien), Ngày xuất viện dự kiến (NgayXuatVienDuKien), Chẩn đoán nhập viện (ChanDoanNhapVien), Tình trạng nhập viện (TinhTrangNhapVien), Bác sĩ theo dõi (MaBSTheoDoi - FK).
• Giải thích ràng buộc [o, t]: Mọi bệnh nhân khi lập hồ sơ đều phải thuộc ít nhất một trong hai nhóm Ngoại trú hoặc Nội trú (Total); đồng thời một bệnh nhân hoàn toàn có thể thuộc cả hai nhóm trong lịch sử điều trị (Overlapping — ví dụ khám ngoại trú xong chuyển nhập viện nội trú).
```

### 3.3. Rà soát phần còn lại của Chương 2 (nếu có liệt kê các thực thể khác)
Dùng `Ctrl + F` trong toàn bộ Chương 2 để thay thế mọi tên thực thể/thuộc tính cũ còn sót:
- `THE_BHYT` -> gộp vào `BENH_NHAN` (`SoBHYT`, `MucHuongBHYT`).
- `LOAI_XET_NGHIEM` -> `DICH_VU`.
- `PHIEU_XET_NGHIEM` -> `SU_DUNG_DV`.
- `VIEN_PHI` -> `HOA_DON`.
- `KY_THUAT_VIEN` -> `NV_HANH_CHINH` (và vai trò thực hiện CLS ghi rõ do `DIEU_DUONG` đảm nhận).
- Thêm mục giới thiệu **`LICH_TRUC`** (Phân ca trực của nhân viên tại phòng) nếu Mục I/II có danh mục 19 thực thể.

### 3.4. Hướng dẫn kiểm tra & thay Hình 1 Sơ đồ EER mới vào Trang 16 PDF
Trong kho lưu trữ của nhóm đã có sẵn file sơ đồ mới tại:
- [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_ChuanHoa_19Bang.xml)

Qua kiểm tra trực tiếp cấu trúc XML của file này:
- **Điểm đã đạt chuẩn 100%:** Đã vẽ đầy đủ **19 thực thể** chia thành **8 khu vực màu sắc rõ ràng**, có đủ `NV_HANH_CHINH`, `LICH_TRUC`, `DICH_VU`, `SU_DUNG_DV`, `HOA_DON`; cây `NHAN_VIEN` ghi đúng **`d, p (IS-A)`**; cây `BENH_NHAN` ghi đúng **`o, t (IS-A)`**; đánh dấu đúng thực thể yếu/kết hợp (`PHAN_GIUONG`, `CT_DON_THUOC`, `SU_DUNG_DV`, `LICH_TRUC`) và bản số `(min, max)` trên các nhánh.
- **2 điểm nhỏ cần lưu ý / tinh chỉnh trước khi xuất PNG dán vào trang 16:**
  1. Tại nhánh nối `SU_DUNG_DV` với `DIEU_DUONG` (`id="R_DD_THUC_HIEN"` trong XML), hình thoi đang ghi nhãn `"KTV / Điều dưỡng thực hiện (N:1)"`. Bạn nên cân nhắc sửa nhãn này trong draw.io thành **`"Điều dưỡng thực hiện (N:1)"`** (hoặc giữ nguyên nhưng chú thích rõ bên dưới hình) để tránh Hội đồng tưởng vẫn còn bảng `KY_THUAT_VIEN`.
  2. File `01_EER_ChuanHoa_19Bang.xml` là **EER mức tổng quan thực thể – mối kết hợp (không vẽ các hình oval thuộc tính xung quanh)** vì kích thước canvas lớn (`3200 x 2400`) để chứa 19 thực thể gọn gàng trên 1 trang. Khi chèn vào Word:
     - Mở [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_ChuanHoa_19Bang.xml) bằng **draw.io** (app.diagrams.net hoặc bản Desktop).
     - Chọn **File -> Export as -> PNG...** -> đặt **Zoom: 200%** (hoặc 300 DPI), chọn **Border Width: 10**, tick **Transparent Background** (hoặc nền trắng).
     - Trong Word (tại trang 16): Bật **Section Break (Next Page)** cho riêng trang chứa Hình 1 sang **khổ ngang (Landscape)** nếu thấy hình bị nhỏ chữ khi để khổ dọc, nhấp chuột phải vào ảnh cũ -> **Change Picture -> From a File** -> chọn ảnh PNG mới xuất.
     - Cập nhật chú thích dưới hình thành:
       `Hình 1: Sơ đồ Thực thể – Mối kết hợp Mở rộng (EER) chuẩn hóa 19 thực thể của Hệ thống Quản lý Bệnh viện (Chi tiết thuộc tính từng thực thể được đặc tả ở Mục II Chương 2 và Từ điển dữ liệu Chương 4).`
  3. *(Tùy chọn cộng điểm)* File [02_Relational_Schema_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/02_Relational_Schema_19Bang.xml) cũng đã vẽ sẵn lược đồ 19 bảng & 25 FK rất đẹp — **nhưng lưu ý**: XML đó đang dùng kiểu dữ liệu **PostgreSQL/Prisma** (`ENUM(...)`, `BOOLEAN`, `TIMESTAMP`, `MatKhau`, `TienBenhNhanTra`). Nếu bạn chọn **Lựa chọn B** (Prisma/PostgreSQL), có thể xuất thêm ảnh này làm *Hình 2: Lược đồ Cơ sở dữ liệu Quan hệ 19 bảng* đặt ở cuối Chương 3 hoặc đầu Chương 4. Nếu chọn **Lựa chọn A** (SQL Server `00_Khoi_tao_va_nap_mau.sql`), không nên dán trực tiếp XML đó khi chưa đổi kiểu dữ liệu sang T-SQL (`NVARCHAR`, `BIT`, `DATETIME2`).

---

## PHẦN 4: SỬA CHI TIẾT CHƯƠNG 3 — CHUYỂN ĐỔI MÔ HÌNH & CHUẨN HÓA (TRANG 17 – 22)

Chương 3 nhìn chung đã tốt nhưng còn **6 lỗi kỹ thuật và nhất quán** cần sửa ngay:

1. **Bước 1 (Trang 17) — Thiếu 2 thực thể mạnh:**
   - **Hiện trạng:** Chỉ liệt kê 6 thực thể mạnh, bỏ sót `BENH_NHAN` và `NHAN_VIEN`.
   - **Cách sửa:** Bổ sung `NHAN_VIEN` và `BENH_NHAN` vào danh sách thực thể mạnh ở Bước 1 (đủ 8 thực thể mạnh ban đầu gồm `KHOA, PHONG, GIUONG_BENH, NHAN_VIEN, BENH_NHAN, LUOT_KHAM, THUOC, DICH_VU`, cùng `DON_THUOC` và `HOA_DON` ánh xạ 1:0..1 ở bước tương ứng).
2. **Bước 5 (Trang 17) — Tham chiếu sai số mục:**
   - **Hiện trạng:** Ghi xem tối ưu hóa bảng `LICH_TRUC` tại **`mục 3.4`**, nhưng Chương 3 không có mục 3.4.
   - **Cách sửa:** Sửa `"mục 3.4"` thành đúng tên mục chứa phần chuẩn hóa bảng `LICH_TRUC` trong Chương 3 (ví dụ: `phần Phân tích Phụ thuộc hàm và Chuẩn hóa bảng LICH_TRUC bên dưới`).
3. **Bước 3 / Chuẩn hóa `PHAN_GIUONG` (Trang 19) vs Danh mục quan hệ mục 17 (Trang 22):**
   - **Hiện trạng:** Trang 19 chứng minh bắt buộc phải có `UNIQUE(Ma_Giường, Ngày_Bắt_Đầu)` để chống 2 bệnh nhân cùng nằm 1 giường tại cùng `NgayBatDau`, nhưng đến danh mục quan hệ ở **mục 17 (trang 22)** lại quên ghi ràng buộc `[UK]` này!
   - **Cách sửa:** Ở dòng `17. PHAN_GIUONG` (trang 22), bổ sung rõ: `UK: (MaGiuong, NgayBatDau)`.
4. **Lỗi gõ thiếu dấu phẩy ở mục 3 (Trang 21):**
   - **Tìm:** `TrangThaiGiuong MaPhong`
   - **Thay bằng:** `TrangThaiGiuong, MaPhong`
5. **Lỗi gõ dính chữ & thiếu thuyết minh ở mục 16 (Trang 22):**
   - **Tìm:** `FKMaKTVThucHien → DIEU_DUONG(MaNV)`
   - **Thay bằng:** `FK: MaKTVThucHien → DIEU_DUONG(MaNV)` và bổ sung câu chú thích: *“(Tên cột `MaKTVThucHien` được giữ theo quy ước nghiệp vụ cận lâm sàng, nhưng khóa ngoại trỏ về `DIEU_DUONG(MaNV)` sau khi chuẩn hóa nhân sự thực hiện kỹ thuật về ngạch Điều dưỡng).”*
6. **Đồng bộ `ON DELETE` & `HOA_DON.TienBenhNhanTra` theo Lựa chọn A hoặc B:**
   - **Nếu chọn Lựa chọn A (Nộp SQL `00_Khoi_tao_va_nap_mau.sql`):**
     - Ở các mục 5, 6, 7, 8, 9, 14 (trang 21–22): Chú thích rõ *“Về mặt lý thuyết mô hình kế thừa/yếu đề xuất `ON DELETE CASCADE`; tuy nhiên khi cài đặt vật lý trên SQL Server để tránh xung đột multiple cascade paths và bảo vệ dữ liệu y khoa, toàn bộ 25 khóa ngoại được thiết lập `ON DELETE NO ACTION` (xóa thông qua quy trình nghiệp vụ/transaction).”*
     - Ở mục 18 `HOA_DON` (trang 22): Giải trình rõ `TienBenhNhanTra` là thuộc tính dẫn xuất `TongTienGoc - TienBHYTChiTra` được tính động khi truy vấn/VIEW để bảo đảm tối giản 8 cột vật lý trong DDL (`00_Khoi_tao_va_nap_mau.sql`) — **khớp 100% với bảng `HOA_DON` ở Chương 4 trang 36**.
   - **Nếu chọn Lựa chọn B (Giữ `CASCADE` & Computed Column theo Ch.3 + Prisma):**
     - Giữ nguyên mục 5–9, 14, 18 ở Chương 3, nhưng **bắt buộc phải quay xuống Chương 4 trang 36 thêm cột `TienBenhNhanTra` vào bảng `HOA_DON`**.

---

## PHẦN 5: SỬA "LỖI NHẸ" & ĐỒNG BỘ CHƯƠNG 4, CHƯƠNG 5 (TRANG 23 – 47)

Phần này chia làm 2 lớp: **(5.1) Các lỗi nhẹ & lỗi nội tại bắt buộc sửa** (dù giữ Chương 4–5 theo nhánh nào cũng phải sửa để không bị trừ điểm oan), và **(5.2) Bảng tinh chỉnh đồng bộ giữa Chương 4–5 với code thật**.

### 5.1. Lỗi chính tả, định dạng và mâu thuẫn nội tại BẮT BUỘC SỬA (Chương 4 & 5)

#### A. Chương 4 (Trang 23 – 40 PDF)
1. **Trang 23 (lỗi chính tả):** Tìm `nguyên tác` -> Sửa thành **`nguyên tắc`**.
2. **Trang 25 (chữ dư từ Markdown):** Ngay phía trên đoạn code `CREATE UNIQUE NONCLUSTERED INDEX`, xóa chữ **`sql`** đứng trơ trọi một dòng.
3. **Trang 28 – 38 (lỗi rớt chữ trong cột bảng Data Dictionary):** Các cột `Nullability` và `Kiểu dữ liệu` bị hẹp nên chữ bị ngắt ngang (`NUL` / `L`, `Compute` / `d`, `NVARCHA` / `R`, `TIMESTAM` / `P`).
   - **Cách sửa nhanh trong Word:** Chọn toàn bộ bảng -> tab **Layout -> AutoFit -> AutoFit Window**, sau đó chỉnh lại chiều rộng cột `Kiểu dữ liệu` tối thiểu `2.8 cm` và cột `Nullability` tối thiểu `1.8 cm`, hoặc giảm font chữ trong bảng xuống `10.5 pt` – `11 pt` (Times New Roman hoặc Calibri).
4. **Trang 31 (lỗi chính tả):** Tìm `Khám chửa bệnh` -> Sửa thành **`Khám chữa bệnh`**.
5. **Trang 36 vs Trang 38–40 (MẤT MÃ RÀNG BUỘC `CK39, CK40, CK41`):**
   - **Hiện trạng:** Trong các bảng Data Dictionary ở trang 36 có gán mã **`CK39`, `CK40`, `CK41`**, nhưng xuống Mục **IV.1 Danh sách CHECK Constraints (trang 38–40)** lại **chỉ liệt kê từ `CK01` đến `CK38`**! (Tổng số bảng đếm chỉ thấy 38 + 35 + 44 + 3 = 120, nhưng tên hiệu ứng bị đánh lệch!).
   - **Cách sửa:** Đối chiếu 3 cột có ghi `CK39, CK40, CK41` ở trang 36 (nhiều khả năng nằm ở `SU_DUNG_DV`, `HOA_DON` hoặc `LICH_TRUC` vì bị đếm tách so với `CK01–CK38` trong `W4-C`) và xử lý bằng 1 trong 2 cách:
     - *Cách 1 (Khớp `W4-C` / `00_Khoi_tao_va_nap_mau.sql` vốn có đúng `CK01–CK38`):* Sửa 3 ký hiệu `CK39, CK40, CK41` ở trang 36 về đúng mã tương ứng nằm trong `CK01–CK38` (ví dụ `CK36`, `CK37`, `CK38` hoặc các mã `CK` của `SU_DUNG_DV`/`HOA_DON`/`LICH_TRUC` đã liệt kê ở trang 40).
     - *Cách 2:* Nếu 3 điều kiện đó là ràng buộc riêng, bổ sung thêm đủ 3 dòng **`CK39, CK40, CK41`** vào cuối danh sách ở trang 40 (và cập nhật tổng số CHECK nếu cần).
6. **Trang 38 (thiếu tiền tố `CK_` ở nhóm ràng buộc độ dài/ký tự):**
   - **Tìm:** `MID_*`, `TXT_*`, `TEL_*` (ở bảng tổng hợp hoặc đoạn dẫn Mục IV.1).
   - **Thay bằng:** **`CK_MID_*`**, **`CK_TXT_*`**, **`CK_TEL_*`** (35 `CK_MID`, 44 `CK_TXT`, 3 `CK_TEL` — đúng với tên ràng buộc trong kịch bản SQL).

#### B. Chương 5 (Trang 41 – 47 PDF)
7. **Trang 42 – 46 (sót ký tự Markdown `` ` ``):** Xóa toàn bộ dấu nháy huyền `` ` `` bao quanh tên bảng, tên cột, tên mã test trong toàn bộ Chương 5 (dùng `Ctrl + H` tìm `` ` `` và Replace All bằng rỗng trong phạm vi Chương 5, trừ các khối code SQL nếu không muốn mất định dạng).
8. **Trang 43 – 46 (Sửa câu lệnh `INSERT` trong `TC01, TC02, TC04, TC10` để CHẠY ĐƯỢC THẬT):**
   - **Hiện trạng nghiêm trọng:** Các ví dụ `INSERT` trong `TC01`, `TC02`, `TC04`, `TC10` ở bản PDF **bỏ trống nhiều cột `NOT NULL` bắt buộc** (như `HoTen`, `NgaySinh`, `GioiTinh`, `LoaiNV`, `MaKhoa`, `SoGiuong`, `MaPhong`, `NgayBatDau`, v.v.). Nếu Giảng viên hoặc sinh viên copy câu SQL đó dán vào SSMS, SQL Server sẽ báo lỗi thiếu cột `NOT NULL` (`Cannot insert the value NULL into column...`) ngay ở bước phân tích cú pháp, **không hề chạm tới rule `C01–C10` hay `CK` cần kiểm thử**!
   - **Cách sửa — Bảng SQL mẫu chuẩn sẵn sàng dán đè vào `TC01, TC02, TC04, TC10` (đã đủ toàn bộ cột `NOT NULL`):**
     - **Sửa `TC01` (Kiểm thử `C01` — Xung đột Disjoint giữa `BAC_SI` và `DIEU_DUONG`):**
       ```sql
       -- Giả sử NV001 đã tồn tại trong NHAN_VIEN (LoaiNV = 'BacSi') và BAC_SI.
       -- Cố tình chèn NV001 vào DIEU_DUONG (đủ cột NOT NULL theo bảng DIEU_DUONG):
       INSERT INTO DIEU_DUONG (MaNV, TrinhDoChuyenMon, SoCCHN_DD, PhuCapTruc)
       VALUES ('NV001', N'Cử nhân Điều dưỡng', 'CCHN-DD-TEST99', 500000);
       ```
     - **Sửa `TC02` (Kiểm thử `C03` — Chặn `BENH_NHAN` vi phạm Total nếu không có subtype khi `CoNgoaiTru = 0` và `CoNoiTru = 0`):**
       ```sql
       -- Chèn BENH_NHAN với đủ cột NOT NULL, cố tình để cả hai cờ CoNgoaiTru = 0, CoNoiTru = 0 (hoặc test CHECK CoNgoaiTru=1 OR CoNoiTru=1):
       INSERT INTO BENH_NHAN (MaBN, HoTen, NgaySinh, GioiTinh, CCCD, SoDienThoai, DiaChi, CoNgoaiTru, CoNoiTru)
       VALUES ('BN_TEST01', N'Nguyễn Văn Test', '1990-01-01', N'Nam', '079090009999', '0909999888', N'TP.HCM', 0, 0);
       ```
       *(Ghi chú: Nếu test trường hợp `BENH_NHAN` có `CoNoiTru = 1` nhưng cố ý không chèn vào `BN_NOI_TRU`, dùng câu `INSERT` đủ 9 cột trên với `(..., 0, 1)` rồi chạy câu kiểm tra đối soát `C03` không khớp bảng con!)*
     - **Sửa `TC04` (Kiểm thử `C04` — Chặn sai lệch phân loại `CoNoiTru` với `BN_NOI_TRU` hoặc `PHAN_GIUONG`):**
       ```sql
       -- Cố tình phân giường cho bệnh nhân BN005 chưa thuộc BN_NOI_TRU (đủ cột NOT NULL của PHAN_GIUONG):
       INSERT INTO PHAN_GIUONG (MaBN, MaGiuong, NgayBatDau, NgayKetThuc, GiaGiuongNgay)
       VALUES ('BN005', 'G001', '2026-10-15T08:00:00', NULL, 500000);
       ```
     - **Sửa `TC10` (Kiểm thử trùng ca trực / bác sĩ / lượt khám — đối chiếu `PK` hoặc `UNIQUE`):**
       ```sql
       -- Ví dụ cố tình phân công NV001 trực cùng ngày và cùng ca ở 2 phòng khác nhau (đủ cột NOT NULL của LICH_TRUC):
       INSERT INTO LICH_TRUC (MaNV, NgayTruc, CaTruc, MaPhong, VaiTroTruc, TrangThaiDiemDanh)
       VALUES ('NV001', '2026-10-15', N'Sáng', 'P002', N'Trực chính', N'Chưa điểm danh');
       ```
       *(Kiểm tra lại đúng mục tiêu kịch bản `TC10` trong file Word của nhóm — `C10` hay `PK_LICH_TRUC` — để điền đúng bảng tương ứng nhưng **luôn bảo đảm đủ các cột `NOT NULL`**).*
9. **Trang 43 – 46 (Sửa mã `CK` không khớp giữa Chương 5 và Chương 4):**
   - Trong bản PDF, Chương 5 đang trích **`CK13`, `CK21`, `CK16`**, nhưng đối chiếu lại bảng danh sách `CK01–CK38` ở Chương 4 (trang 38–40) thì chúng tương ứng với **`CK18`, `CK25`, `CK19`** (lệch đánh số giữa file Word và bản cũ).
   - **Thao tác:** Mở trang 38–40 (bảng `CK01–CK38`), kiểm tra từng điều kiện test trong Chương 5 và **đổi lại mã `CK` trong Chương 5 cho trùng khớp 100%** với Chương 4 (`CK18`, `CK25`, `CK19`).
10. **Trang 45 (`TC11` — Lỗi trích dẫn `BR` & logic mốc giờ `09:00` – `11:00`):**
    - Nếu bạn đặt `LICH_TRUC` ở cuối Bảng BR thành `BR25` theo hướng dẫn ở Phần 2.3, thì `TC11` giữ nguyên trích dẫn **`BR22`** sẽ khớp chuẩn. (Ngược lại, nếu vẫn giữ `LICH_TRUC` ở `BR16`, bắt buộc sửa `BR22` trong `TC11` thành **`BR23`**).
    - Ở phần mô tả tình huống `TC11`, sửa câu văn bị tối nghĩa về `09:00` – `11:00` thành diễn giải rõ ràng hai khoảng thời gian giao nhau `[NgayBatDau_1, NgayKetThuc_1]` và `[NgayBatDau_2, NgayKetThuc_2]` trên cùng một `MaGiuong` (trong đó khoảng `[09:00, 11:00]` hoặc bệnh nhân A đang nằm chưa có `NgayKetThuc` mà chèn tiếp bệnh nhân B vào lúc `09:00` cùng ngày trên cùng `MaGiuong`), đồng thời nêu rõ **cơ chế phát hiện**: `PK/UQ(MaGiuong, NgayBatDau)` chặn trùng thời điểm bắt đầu `=` nhau, còn khoảng giao nhau `<>` nhau được phát hiện qua câu truy vấn đối soát overlap (BR22 / P07).
11. **Trang 43 – 46 (Xóa thông báo lỗi tự chế `RULE_C0*_VIOLATION` & Tách nhãn `MUT01–MUT12` khỏi `TC01–TC12`):**
    - Xóa tên thông báo lỗi giả định `RULE_C0X_VIOLATION` nếu chạy T-SQL tiêu chuẩn (SQL Server trả về mã lỗi chuẩn như `Msg 547` với FK/CHECK, `Msg 2627` với PK/UNIQUE, hoặc mã lỗi `50001..50010` nếu nhóm viết thêm Trigger/RAISERROR).
    - **Không gộp ngang nhãn `MUT01–MUT12` với `TC01–TC12`**: Trong kịch bản `kiem_tra_tinh.py` / `ket_qua_kiem_tra.json`, bộ `MUT01–MUT12` là 12 ca đột biến riêng của trình kiểm tra tĩnh Python/SQLite, **không trùng 1-1** với `TC01–TC12` của Chương 5. Do đó, trong Chương 5 hãy tách thành 2 tiểu mục rõ ràng:
      - *Mục 5.2: Kết quả Kiểm thử Tĩnh & Mutation Testing bằng Python/SQLite (`1.405 assertions`, `12/12 ca đột biến MUT01–MUT12`).*
      - *Mục 5.3: 12 Kịch bản Kiểm thử Nghiệp vụ trên CSDL (`TC01–TC12`) & Kết quả đối soát.*

### 5.2. Sửa trung thực phần Thực thi trên SQL Server & Khớp Lựa chọn A/B (Trang 24–46)

| Hạng mục trong Ch. 4–5 PDF | Nếu chốt Lựa chọn A (`W4-D`: `00_Khoi_tao_va_nap_mau.sql`) | Nếu chốt Lựa chọn B (Web App `Prisma/PostgreSQL`) |
| :--- | :--- | :--- |
| **Tên Index trên `BENH_NHAN` (tr. 25)** | Sửa `UX_BENH_NHAN_CCCD`, `UX_BENH_NHAN_BHYT` -> **`UX_BENH_NHAN_02` (`CCCD`)** và **`UX_BENH_NHAN_01` (`SoBHYT`)**. | Giữ nguyên hoặc đồng bộ tên index trong migration PostgreSQL của Prisma. |
| **Cột `TienBenhNhanTra` trong `HOA_DON` (tr. 36)** | Giữ bảng 8 cột ở trang 36; sửa lại Chương 3 mục 18 (tr. 22) cho khớp (tính bằng VIEW/truy vấn). | **Bổ sung dòng cột `TienBenhNhanTra`** (`DECIMAL(18,2) / Computed`) vào bảng `HOA_DON` trang 36 để khớp Chương 3 & Prisma. |
| **Độ dài `VARCHAR/NVARCHAR` & `NULL / NOT NULL`** | Cập nhật các bảng Data Dictionary về đúng chuẩn `96 NOT NULL / 36 NULL` và dùng **`NVARCHAR(...)`**, **`DATETIME2(0)`**, **`BIT`** (khớp `00_Khoi_tao_va_nap_mau.sql` & giữ con số `132 cột / 120 CHECK / 7 DF`). | Đổi phần giới thiệu đầu Chương 4 từ T-SQL sang **PostgreSQL 16 + Prisma ORM**; **xóa bỏ** các số liệu của gói SQLite/SQL Server Tuần 4 (`96 NOT NULL / 36 NULL`, `BV_W4C_WRITE`, `293` chỉ tiêu T-SQL) để tránh râu ông nọ cắm cằm bà kia. |
| **13 Enum vs Ràng buộc `CHECK` mở rộng** | Ghi rõ các cột `LoaiGiuong`, `LoaiDichVu`, `TinhTrangNhapVien`, `HuongXuTri`, `NhomMau` (gồm cả Rh `A+, A-, B+, B-, AB+, AB-, O+, O-`) theo đúng `CK01–CK38` của `00_Khoi_tao_va_nap_mau.sql`. | Liệt kê rõ đúng 13 Enum trong [schema.prisma](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/backend/prisma/schema.prisma) và đối chiếu cách kiểm thử bằng Enum PostgreSQL thay cho `CHECK` T-SQL. |
| **Bằng chứng chạy SQL Server (tr. 42 & 46)** | **Bắt buộc tự mở SSMS chạy `00_Khoi_tao_va_nap_mau.sql` và `01_Doi_soat_sau_nap.sql`**, chụp 2–3 ảnh màn hình kết quả `293` chỉ tiêu `0 vi phạm` dán vào Chương 5 trước khi nộp (tới hiện tại trong repo chỉ mới chạy trên Python/SQLite!). | Chụp ảnh kết quả chạy `npx prisma migrate status`, chạy seed hoặc test suite của backend trên PostgreSQL 16 để làm bằng chứng thực nghiệm thay cho lời tuyên bố chạy SQL Server. |

---

## PHẦN 6: HOÀN THIỆN CHƯƠNG 6, TÀI LIỆU THAM KHẢO & PHỤ LỤC (TRANG 47 – 49)

### 6.1. Sửa 2 lỗi nhỏ ở Chương 6 hiện có (Trang 47 – 48 PDF)
1. **Trang 47 (ràng buộc cây `BENH_NHAN` chưa chốt):**
   - **Tìm:** `[d, t] / [o, t]`
   - **Thay bằng:** **`[o, t]` (`Overlapping, Total`)** — thống nhất tuyệt đối với Chương 1 (`BR05`), Chương 2 (`II.2`), Chương 3 (Bước 7) và `01_EER_ChuanHoa_19Bang.xml`.
2. **Trang 48 (thiếu dấu đầu dòng ở ý kết luận cuối):**
   - **Tìm dòng:** `Phương pháp luận QA và Kiểm thử...` (đang bị thụt lề không có dấu `•`).
   - **Thay bằng:** Thêm ký hiệu bullet `•` (hoặc đánh số `4.`) đồng bộ với 3 ý phía trên.

### 6.2. Bổ sung các mục còn thiếu (Mục 6.2, 6.3, TLTK, Phụ lục A & B)
Hiện bản demo đang dừng ở mục tổng kết kết quả (6.1) hoặc thiếu hệ thống hạn chế `P01–P08` và Phụ lục. Dựa theo khung chuẩn ở [Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/Bao_Cao_Rao_Soat_Va_Sua_Loi_Do_An_QLBV.md#L821-L891) **nhưng đã được hiệu chỉnh để khớp với việc bạn đã sửa Chương 1–2–3**, hãy bổ sung các mục sau vào cuối báo cáo:

1. **Mục 6.2. Các Hạn chế và Tồn đọng Kỹ thuật (`P01 – P08`):**
   - **P01 (Gộp BHYT vào `BENH_NHAN`):** Tinh gọn 1 bảng và giữ BCNF theo thẻ hiện hành, nhưng chưa lưu lịch sử gia hạn/đổi mã thẻ BHYT qua nhiều năm.
   - **P02 (Cột `MaKTVThucHien` gắn vào `DIEU_DUONG`):** Sau khi chuẩn hóa subtype thứ 3 thành `NV_HANH_CHINH`, điều dưỡng đảm nhận vai trò thực hiện CLS; khi mở rộng quy mô viện lớn cần tách bảng chuyên môn kỹ thuật viên y học riêng.
   - **P03 (Tổng quát hóa xét nghiệm vào `DICH_VU` / `SU_DUNG_DV`):** Linh hoạt nhưng chưa tách chi tiết bảng tham số từng chỉ số sinh hóa (khoảng tham chiếu nam/nữ, đơn vị đo từng chỉ tiêu).
   - **P04 (Mô hình hóa đợt điều trị nội trú & liên kết viện phí):** `PHAN_GIUONG` gắn trực tiếp vào `BN_NOI_TRU` theo khoảng thời gian, và `HOA_DON` liên kết 1-1 với `LUOT_KHAM`; khi bệnh nhân tái nhập viện nhiều đợt hoặc tách hóa đơn tạm ứng giường nội trú, cần bổ sung thực thể `DOT_DIEU_TRI_NOI_TRU`.
   - **P05 (Đơn trị hóa địa chỉ & lược bớt thuộc tính phụ):** Gộp địa chỉ thành 1 cột `DiaChi` và bỏ thuộc tính phụ khảo sát ban đầu (`NguoiNhaLienHe`) để tối ưu lược đồ.
   - **P06 (Khóa chính `PHAN_GIUONG`):** Bộ ba `(MaBN, MaGiuong, NgayBatDau)` là siêu khóa tối ưu cho Clustered Index lịch sử, kết hợp `UNIQUE(MaGiuong, NgayBatDau)` để bảo vệ toàn vẹn.
   - **P07 (Cưỡng chế chồng lấn khoảng thời gian ở mức Runtime):** `UNIQUE(MaGiuong, NgayBatDau)` chặn trùng thời điểm bắt đầu; các khoảng thời gian giao nhau `[NgayBatDau, NgayKetThuc]` hiện được kiểm soát qua truy vấn đối soát trước commit (cần bổ sung Trigger `INSTEAD OF` / Stored Procedure khi vận hành đồng thời cao).
   - **P08 (Phạm vi kiểm chứng thực thi):** Ghi nhận trung thực ranh giới giữa kiểm thử tĩnh (`Python/SQLite`) và kiểm thử thực thi trực tiếp trên hệ quản trị CSDL mục tiêu (`SQL Server` hoặc `PostgreSQL`).
2. **Mục 6.3. Hướng phát triển tiếp theo:** Quản trị kho thuốc theo lô/tương tác thuốc; Trigger chống trùng giờ phòng/giường ở mức runtime; Phân quyền RBAC & mã hóa CCCD/bệnh án; Hoàn thiện giao diện Web App tích hợp đầy đủ quy trình.
3. **Tài liệu tham khảo:** Trích dẫn chuẩn giáo trình Elmasri & Navathe (7th ed.), Connolly & Begg (6th ed.), Silberschatz et al. (7th ed.), Tài liệu bài giảng CSDL Nâng cao (ThS. Huỳnh Minh Trí), Microsoft SQL Server Docs, Thông tư 54/2017/TT-BYT, Luật Khám bệnh, chữa bệnh số 15/2023/QH15.
4. **Phụ lục A & Phụ lục B:**
   - **Phụ lục A:** Hướng dẫn cài đặt và chạy thực thi kịch bản SQL (`00_Khoi_tao_va_nap_mau.sql` -> `01_Doi_soat_sau_nap.sql`) kèm hình ảnh kết quả chạy thật trên SSMS *(hoặc hướng dẫn chạy `Prisma + PostgreSQL` nếu chọn Lựa chọn B)*.
   - **Phụ lục B:** Danh mục hồ sơ bàn giao theo Tuần 1 -> Tuần 4 (`W1..W4`, file `.xml` sơ đồ, file `.sql`, script `kiem_tra_tinh.py`, và mã nguồn Web App nếu nộp kèm).

---

## PHẦN 7: CHECKLIST NGHIỆM THU 10 BƯỚC TRƯỚC KHI XUẤT PDF NỘP

- [ ] **Bước 1 (Chốt nhánh chuẩn):** Thống nhất cả nhóm chọn **Lựa chọn A (`SQL Server W4-D`)** hay **Lựa chọn B (`PostgreSQL/Prisma`)** để sửa nhất quán mục `ON DELETE`, `HoaDon.TienBenhNhanTra`, `UX_BENH_NHAN_*`, và kiểu dữ liệu ở Chương 3–5.
- [ ] **Bước 2 (Trang bìa & Nhận xét):** Bổ sung `ThS.`, đồng nhất dấu gạch nối, kiểm tra lại MSSV 11 chữ số của `Cô Thành Long` (`31244102192`), thay 24 dòng chấm ở trang 2 bằng bảng nhận xét chuẩn.
- [ ] **Bước 3 (Chương 1):** Cập nhật Mục 3.1 (tách đoạn bị dính, bỏ KTV/THE_BHYT/PHIEU_XET_NGHIEM), sửa Quy trình 1–5 + thêm Quy trình 6 (`LICH_TRUC`) + giải trình chi phí giường ở Quy trình 5, sửa Bảng `BR01–BR25` (đặt `LICH_TRUC` về `BR25` để giữ `BR22` cho `TC11`, sửa `BR04=[d,p]`, `BR05=[o,t]`, câu cụt `BR24/25`, chính tả).
- [ ] **Bước 4 (Chương 2 & EER):** Sửa Mục II.1 (`NHAN_VIEN [d,p]`, gộp bullet `BAC_SI`, đổi `KY_THUAT_VIEN` -> `NV_HANH_CHINH`, chuẩn hóa tên thuộc tính) và Mục II.2 (`BENH_NHAN [o,t]`, bỏ `DiaChi_*` & `(Tuoi)`), chạy `Ctrl+F` xóa hết chữ `THE_BHYT`/`VIEN_PHI`/`PHIEU_XET_NGHIEM`/`LOAI_XET_NGHIEM`.
- [ ] **Bước 5 (Thay Hình 1 ở trang 16):** Mở [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/docs/diagrams/01_EER_ChuanHoa_19Bang.xml) trên draw.io, chỉnh nhãn `R_DD_THUC_HIEN` thành `Điều dưỡng thực hiện (N:1)` nếu cần, xuất PNG độ phân giải cao (Zoom 200% / 300 DPI) và thay ảnh cũ ở trang 16 (xoay trang Landscape nếu chữ nhỏ).
- [ ] **Bước 6 (Chương 3):** Bổ sung `BENH_NHAN, NHAN_VIEN` vào Bước 1; sửa tham chiếu `mục 3.4`; thêm dấu phẩy `TrangThaiGiuong, MaPhong`; sửa `FK: MaKTVThucHien` + thuyết minh; thêm `UK(MaGiuong, NgayBatDau)` ở `PHAN_GIUONG` mục 17 (tr. 22); chốt `CASCADE`/`NO ACTION` và `TienBenhNhanTra` theo Bước 1.
- [ ] **Bước 7 (Lỗi nhẹ Chương 4):** Sửa `nguyên tác` -> `nguyên tắc`, `Khám chửa bệnh` -> `Khám chữa bệnh`, xóa chữ `sql` tr. 25, AutoFit độ rộng bảng tránh rớt chữ `NUL/L`, giải quyết dứt điểm 3 mã **`CK39–CK41`** ở tr. 36 vs tr. 38–40, thêm prefix **`CK_MID_*`, `CK_TXT_*`, `CK_TEL_*`**.
- [ ] **Bước 8 (Sửa sâu Chương 5):** Xóa toàn bộ dấu backtick `` ` ``; sửa 4 câu `INSERT` thiếu cột `NOT NULL` ở `TC01, TC02, TC04, TC10`; đồng bộ mã `CK` giữa Ch.5 (`CK13/21/16`) và Ch.4 (`CK18/25/19`); tách riêng bảng `MUT01–MUT12` khỏi `TC01–TC12`; sửa mô tả `TC11` & xóa nhãn giả định `RULE_C0*_VIOLATION`.
- [ ] **Bước 9 (Chụp ảnh thực nghiệm thật):** Chạy trực tiếp `00_Khoi_tao_va_nap_mau.sql` & `01_Doi_soat_sau_nap.sql` trên SSMS (hoặc test suite Prisma nếu chọn B) để lấy ảnh chụp màn hình thật dán vào Chương 5 / Phụ lục A.
- [ ] **Bước 10 (Chương 6, Phụ lục & Xuất PDF):** Chốt `[o, t]` ở trang 47, thêm bullet đoạn cuối trang 48, bổ sung `P01–P08`, Hướng phát triển, Tài liệu tham khảo, Phụ lục A/B, nhấn **Update entire table** cho Mục lục Word trước khi **Export PDF**.
