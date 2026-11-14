# DANH MỤC CÁC SƠ ĐỒ KỸ THUẬT HỆ THỐNG QUẢN LÝ BỆNH VIỆN (QLBV v2.0)
Học phần: **Cơ sở dữ liệu nâng cao** – Khoa CNTT, Đại học Sài Gòn (SGU)  
Nhóm 5 thực hiện (Trưởng nhóm: Cao Nguyễn Quốc Khánh)

Tất cả các tệp trong thư mục này đều được lưu dưới định dạng chuẩn **XML Draw.io (`.xml`)**, có thể mở, xem và chỉnh sửa trực tiếp trên [app.diagrams.net](https://app.diagrams.net), ứng dụng Draw.io Desktop hoặc tiện ích mở rộng *Draw.io Integration* trên VS Code.

---

## Danh Mục Chi Tiết 6 Sơ Đồ Tiêu Chuẩn

| Tên File | Loại Sơ Đồ | Nội Dung Chi Tiết & Chuẩn Kỹ Thuật |
| :--- | :--- | :--- |
| [01_EER_ChuanHoa_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/01_EER_ChuanHoa_19Bang.xml) | **Mô hình EER Chuẩn hóa v2.0** | Mô hình Thực thể Kết hợp Mở rộng (EER) chuẩn hóa 19 thực thể, khắc phục 100% 5 lỗi sai lệch của bản thảo Tuần 2: gộp thẻ BHYT vào bệnh nhân, cập nhật thực thể `LICH_TRUC`, chuẩn hóa `NV_HANH_CHINH`, `SU_DUNG_DV`, `DICH_VU` và 2 cây kế thừa IS-A `(d, p)` và `(o, t)`. |
| [02_Relational_Schema_19Bang.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/02_Relational_Schema_19Bang.xml) | **Lược đồ CSDL Quan hệ Vật lý (ERD)** | Biểu diễn 19 bảng thực thể chuẩn BCNF, định nghĩa chi tiết tất cả các cột, kiểu dữ liệu SQL (PostgreSQL), khóa chính (PK), khóa duy nhất (UQ) và 25 liên kết khóa ngoại (FK) với quy tắc toàn vẹn tham chiếu `ON DELETE CASCADE / NO ACTION`. |
| [03_UseCase_TongQuan_QLBV.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/03_UseCase_TongQuan_QLBV.xml) | **Sơ đồ Use Case Tổng quan** | Biểu diễn ranh giới hệ thống, 5 tác nhân chính (`BENH_NHAN`, `BAC_SI`, `DIEU_DUONG`, `NV_HANH_CHINH`, `ADMIN`) và 16 Use Case thuộc 6 phân hệ: Tiếp đón, Khám bệnh, Nội trú, Dược, Viện phí BHYT và Quản trị. |
| [04_Sequence_KhamBenh_VienPhi_BHYT.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/04_Sequence_KhamBenh_VienPhi_BHYT.xml) | **Sơ đồ Trình tự Khám & Viện phí BHYT** | Chu trình tuần tự 5 giai đoạn: Tiếp đón -> Khám lâm sàng & đo sinh hiệu (BR01) -> Kê đơn thuốc snapshot giá -> Quyết toán BHYT (BR03) & VietQR (BR06) -> Cấp phát thuốc trừ tồn kho nguyên tử (BR04). |
| [05_Sequence_NoiTru_KhoaGiuong_BR02.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/05_Sequence_NoiTru_KhoaGiuong_BR02.xml) | **Sơ đồ Trình tự Phân giường & Khóa dòng** | Mô phỏng chi tiết kịch bản tranh chấp giường đồng thời: Khởi tạo giao dịch cô lập, khóa dòng `SELECT FOR UPDATE`, bảo vệ tính toàn vẹn nghiệp vụ BR02 và xử lý chuyển giường sang trạng thái `BAO_TRI`. |
| [06_KienTruc_BCE_ModularMonolith.xml](file:///d:/Documents/AdvancedDatabase/AdvancedDatabase/diagrams/06_KienTruc_BCE_ModularMonolith.xml) | **Sơ đồ Kiến trúc Hệ thống & Ánh xạ BCE** | Mô hình 3 tầng hướng đối tượng BCE: `<<boundary>>` (Next.js 14 App Router) ➔ `<<control>>` (NestJS 10 Modular Monolith + Guards/Filters/Services) ➔ `<<entity>>` (PostgreSQL 16 + Prisma ORM + ACID). |

---

## Hướng Dẫn Mở & Xuất Ảnh Sơ Đồ

1. Truy cập [app.diagrams.net](https://app.diagrams.net) (hoặc mở VS Code).
2. Chọn **File** ➔ **Open From** ➔ **Device...** và chọn tệp `.xml` tương ứng trong thư mục này.
3. Để xuất ảnh chất lượng cao phục vụ chèn vào báo cáo Word:
   - Chọn **File** ➔ **Export as** ➔ **PNG...** (Đặt DPI: 300, tích chọn *Transparent Background* nếu cần).
