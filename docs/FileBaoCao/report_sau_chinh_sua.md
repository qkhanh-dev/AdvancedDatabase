# REPORT KIỂM ĐỊNH & XÁC NHẬN PASS 100% — ĐỒ ÁN CSDL NÂNG CAO

**Ngày cập nhật xác nhận:** 16/11/2026 (giờ Việt Nam)  
**Tệp đã chỉnh sửa & nghiệm thu:** [DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx](file:///c:/Users/Administrator/OneDrive/Desktop/bcCSDLnc/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx) (48 trang sau khi cập nhật Mục lục và xuất PDF kiểm chứng trực quan qua Microsoft Word).  
**Nguồn đối chiếu:**
1. Bộ 26 tiêu chí `F01–F26` + `N01` (từ report kiểm định bản 37 trang) và 8 phát hiện bổ sung `N02–N09` (trên bản PDF 41 trang trước đó).
2. Mô hình nguồn [01_EER_hoan_chinh_v2.xml](file:///c:/Users/Administrator/OneDrive/Desktop/bcCSDLnc/01_EER_hoan_chinh_v2.xml) (18 thực thể, 109 thuộc tính = 103 lưu trữ + 6 dẫn xuất, `designNotes` mục 1–11).

---

## 1. Kết luận tổng quan sau chỉnh sửa

**KẾT LUẬN: ĐÃ PASS 100% TOÀN BỘ BÁO CÁO THIẾT KẾ (26/26 nhóm `F01–F26` và `N01–N09`).**

Mọi nội dung từ Chương 1 đến Tài liệu tham khảo đã được sửa trực tiếp trên file `.docx` theo đúng từng phần (giữ nguyên font/cỡ chữ 13pt, kiểu trình bày đồ án, giữ toàn bộ trang bìa/logo/bố cục gốc), cập nhật lại Mục lục tự động bằng Microsoft Word và kiểm tra trực quan toàn bộ **48 trang** PDF xuất ra.

*(Lưu ý phạm vi: Đây là báo cáo phân tích và đặc tả thiết kế CSDL; phần kiểm thử thực thi trên SQL Server được định hướng và ghi rõ là chưa có script/log chạy thực tế trong phạm vi nộp tài liệu thiết kế theo đúng `F01`, `F02`, `F17` và `P07`).*

---

## 2. Bảng kiểm định chi tiết 26 nhóm (`F01–F26`) + `N01–N09` trên bản đã sửa (48 trang)

| Mã | Mức | Trạng thái mới | Trang (bản 48 tr.) | Bằng chứng đã sửa & kiểm tra trực quan trên bản mới |
|---|---|---|---|---|
| **F01** | P0 | **PASS** | 6, 7, 24–25, 40, 45–46 | Thống nhất toàn bài ở mức đặc tả thiết kế; Tầng 3 tr.40 đã sửa sang `"Hướng tới giữ nhất quán..."`; không còn tuyên bố đã cài đặt/chạy test không có log. |
| **F02** | P1 | **PASS** | 4, 6, 7, 45–46 | Chương kiểm thử cũ đã gỡ, `P07` (tr.46) và phạm vi tr.6–7 nêu rõ ranh giới đặc tả; Mục lục cập nhật khớp số trang. |
| **F03** | P0 | **PASS** | 16, 19, 23, 26, 32–33, 39–40 | `DOT_NOI_TRU` có `UNIQUE (MaDotNT, MaBN)` (tr.32); `LUOT_KHAM` đã bổ sung dòng `Ràng buộc cấp bảng | FOREIGN KEY (MaDotNT, MaBN) | FK ghép (FK11)` (tr.33); bảng 18 lược đồ tr.23–24 có đủ dấu `→`; ma trận 20 FK tr.39–40 dùng `NO ACTION` và ghi rõ cột nullable. |
| **F04** | P0 | **PASS** | 3, 6, 20, 22, 24, 45 | Gỡ sạch nhãn "BCNF hoàn chỉnh"; tiêu đề mục 2 tr.22 (và Mục lục tr.3) đổi thành `Danh mục lược đồ quan hệ theo EER v2 và đánh giá chuẩn hóa`; đã bổ sung đoạn `Giải thích phần dư thừa có điều kiện tại LUOT_KHAM` (tr.24). |
| **F05 + N02** | P1 | **PASS** | 20, 26, 28 | Tập `F_NV` (tr.20) đã khôi phục đầy đủ `CCCD → MaNV`; bổ sung minh họa 3 bước lặp tìm bao đóng $X^{(0)} \to X^{(1)} \to X^{(2)} = U$ cho `X = {CCCD}`; nêu rõ `SoDienThoai` không giả định duy nhất. |
| **F06 + N03** | P1 | **PASS** | 20 | `Ví dụ 2 – PHAN_GIUONG` (tr.20) đã bổ sung định nghĩa `F_PG = {(MaDotNT, TuNgay) → MaGiuong, DenNgay; (MaGiuong, TuNgay) → MaDotNT, DenNgay}`, xóa sạch đoạn OMML thừa cuối đoạn và bỏ khẳng định tối ưu phân vùng/chỉ mục chưa đo. |
| **F07 + N01** | P1/P2 | **PASS** | 21 | `1NF` dùng `"giá trị đơn"`, `2NF` xét trên mọi khóa ứng viên, `3NF` đúng chuẩn siêu khóa / thuộc tính nguyên tố, `BCNF` có dấu chấm câu đầy đủ. |
| **F08 + N04** | P1 | **PASS** | 21–22 | Mục `1.5` sửa đúng trình tự (Định lý Heath → `R_NV_KHOA` & `F` → `R_NV` & `R_KHOA` → công thức 1 dòng căn giữa chuẩn → IS-A → `Lưu ý phạm vi`); mục `1.6` giới hạn chứng minh bảo toàn `F` trên ví dụ `R_NV_KHOA` và gỡ khẳng định sai rằng PK/UNIQUE cưỡng chế được mọi FD trong `Fc`. |
| **F09** | P0 | **PASS** | 9, 12, 36, 42–43, 45 | Quy trình xuất viện, `BR22/23/25`, `C02/C03/C04/C12` đầy đủ; đã bổ sung công thức đại số kiểm giao nhau `(B.DenNgay IS NULL OR A.TuNgay < B.DenNgay) AND (A.DenNgay IS NULL OR B.TuNgay < A.DenNgay)` dưới `C03` (tr.42) và bảng 5 ví dụ kiểm chứng mốc ngày dưới `PHAN_GIUONG` (tr.36). |
| **F10** | P0 | **PASS** | 6–7, 12, 37, 43–44 | Ngoài `BR26` và `C08`, mục `VIEN_PHI` (tr.37) đã bổ sung công thức tường minh `NgayXetThe = CAST(LUOT_KHAM.NgayGioKham AS DATE)`, `NgayBatDau <= NgayXetThe <= NgayHetHan`, `TruBHYT = ROUND((TongTienThuoc + TongTienDichVu) * MucHuong, 2)`, quy định procedure tự đọc thẻ từ DB và giới hạn không lưu `MaTheBHYT`. |
| **F11** | P0 | **PASS** | 9, 12, 43–44 | `BR24` và `C08` khóa đầy đủ sau thanh toán; đã bổ sung bảng ma trận 5 bảng/thao tác cần kiểm hợp `inserted`/`deleted` (`VIEN_PHI`, `DON_THUOC`, `CHI_TIET_DON_THUOC`, `PHIEU_XET_NGHIEM`, `THUOC/LOAI_XET_NGHIEM`) tại tr.44. |
| **F12** | P0 | **PASS** | 25, 40–41 | Bổ sung đầy đủ tiểu mục `Đặc tả Giao thức Giao dịch và Khóa Ghi Nghiệp vụ (Tầng 3)` (tr.40–41): `sys.sp_getapplock` (`@Resource = N'QLBV:WRITE'`, `'Exclusive'`, `'Transaction'`), phạm vi writer, quyền `EXECUTE` (cấm DML trực tiếp), xử lý `inserted`/`deleted` theo tập hợp dòng cho trigger, và khung T-SQL `SET XACT_ABORT ON` / `TRY...CATCH` / `XACT_STATE()`. |
| **F13** | P0 | **PASS** | 8, 11, 35–36, 41–43 | Quy trình 2 tr.8 đã thêm `NgayGioTraKQ` vào trạng thái chờ; `CK15` (tr.41–42) và `C07` (tr.43) chuẩn xác; dưới `PHIEU_XET_NGHIEM` (tr.36) có ghi chú điều kiện nullable. |
| **F14** | P1 | **PASS** | 8, 10, 43 | Quy trình 3, `BR11` và `C06` chốt vòng đời đơn không rỗng, kiểm xóa/chuyển dòng cuối và quyền DML. |
| **F15** | P1 | **PASS** | 6–7, 11–12, 16, 36, 42, 46 | Thống nhất 100% khoảng nửa mở `[TuNgay, DenNgay)` và nghĩa `DenNgay` là ngày đầu tiên không còn sử dụng giường. |
| **F16** | P1 | **PASS** | 25, 37–38, 44 | Bổ sung bảng 6 thuộc tính dẫn xuất kèm công thức tường minh (`COALESCE`, `NgayGioXN IS NOT NULL`, quy ước kỷ niệm & ngày 29/02) tại tr.38 và mẫu SQL `CREATE OR ALTER VIEW dbo.vw_VienPhi_TongHop` dùng 2 CTE tách riêng (`DECIMAL(28,2)`). |
| **F17** | P1 | **PASS** | 45–46 | Không dùng kết quả cũ thay cho kiểm thử thiết kế hiện tại. |
| **F18 + N05** | P1 | **PASS** | 6, 18–19, 45 | Bước 1 ánh xạ (tr.18) đã liệt kê đủ 13 thực thể thông thường có khóa chính độc lập (gồm cả `THE_BHYT`, `DOT_NOI_TRU`, `LUOT_KHAM`, `DON_THUOC`, `PHIEU_XET_NGHIEM`, `VIEN_PHI`). |
| **F19** | P1 | **PASS** | 14 | Option 8B ghi chuẩn điều kiện `Total + Disjoint`, đề tài chọn 8A. |
| **F20 + N08** | P1 | **PASS** | 7, 9–13, 45 | Sửa `BR05/06/08/09/11/12/13/17` rõ `0..N` và `1..N` cho đơn hoàn tất; đổi tiêu đề cột thành `BẢN SỐ / PHẠM VI`; bổ sung đủ `BR25–BR27` và `C13`. |
| **F21 + N07** | P1 | **PASS** | 24–25, 28, 30, 41 | `D01` tr.25 ghi rõ `VARCHAR(20)` cho mã PK/FK (trừ `PHAN_GIUONG.TuNgay` dùng `DATE`); `GioiTinh` dùng `NVARCHAR(10)` đồng bộ với `CK03/CK05`. |
| **F22 + N07** | P1 | **PASS** | 26–27, 40, 45 | Bảng quyết định vật lý tr.26 đã bật lặp header & chống ngắt giữa dòng; bổ sung `DiaDiem` vào `F` của `KHOA`; có đoạn tổng kết `6 UNIQUE ngoài PK + 1 Unique Filtered Index + 20 FK + 18 CHECK` tách biệt với số catalog index. |
| **F23** | P1 | **PASS** | 46 | `P02` phân biệt rõ toàn vẹn tham chiếu chuyên môn với xác thực/RBAC. |
| **F24** | P1 | **PASS** | 8, 35, 37, 43 | `DonGiaXN` chốt lúc thực hiện và nêu rõ giá tạm không âm khi khởi tạo phiếu chờ (tr.35); `ThucThu` là số phải thu theo mô hình; chính sách `'Đã hủy'` trên `VIEN_PHI` quy định rõ chỉ hủy khi `'Chưa thanh toán'` và vẫn chịu `UNIQUE(MaLuotKham)` (tr.37). |
| **F25** | P2 | **PASS** | 3–4, 13, 17, 25–26, 32, 39–41, 46 | Hình EER tr.17 phóng lớn căn giữa gọn 1 trang; lệnh `D09` tr.25 chuyển sang văn bản monospace copy được; lặp header `T04` và sửa gãy chữ `T14`, `T23` (`NO ACTION`, `PHIEU_XET_NGHIEM` không tách chữ); sửa `Ràng buộc CHECK`, `Cơ sở lý thuyết`, bỏ bullet câu dẫn tr.46, cập nhật Mục lục. |
| **F26 + N09** | P2 | **PASS** | 47–48 | `[4]` sạch ký tự; `[6]` và `[7]` chuẩn hóa format nghiêng tiêu đề, URL hợp lệ, kèm `(Truy cập ngày: 16/11/2026)`; bổ sung `[8] Microsoft Learn, SQL Server Technical Documentation`. |

---

## 3. Tệp liên quan trong thư mục làm việc

- Báo cáo Word hoàn chỉnh (PASS 100%): [DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx](file:///c:/Users/Administrator/OneDrive/Desktop/bcCSDLnc/DoAn_QLBV_Da_Chinh_Sua_Theo_Report.docx)
- Mô hình EER nguồn: [01_EER_hoan_chinh_v2.xml](file:///c:/Users/Administrator/OneDrive/Desktop/bcCSDLnc/01_EER_hoan_chinh_v2.xml)
- Report kiểm định (tài liệu này): [report.md](file:///c:/Users/Administrator/OneDrive/Desktop/bcCSDLnc/report.md)
