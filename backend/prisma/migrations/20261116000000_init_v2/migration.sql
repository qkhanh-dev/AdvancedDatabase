-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "KHOA" (
    "MaKhoa" VARCHAR(20) NOT NULL,
    "TenKhoa" VARCHAR(100) NOT NULL,
    "DiaDiem" VARCHAR(200) NOT NULL,
    "SoDienThoai" VARCHAR(15) NOT NULL,

    CONSTRAINT "KHOA_pkey" PRIMARY KEY ("MaKhoa")
);

-- CreateTable
CREATE TABLE "PHONG" (
    "MaPhong" VARCHAR(20) NOT NULL,
    "MaKhoa" VARCHAR(20) NOT NULL,
    "TenPhong" VARCHAR(100) NOT NULL,
    "LoaiPhong" VARCHAR(100) NOT NULL,
    "ViTri" VARCHAR(200) NOT NULL,

    CONSTRAINT "PHONG_pkey" PRIMARY KEY ("MaPhong")
);

-- CreateTable
CREATE TABLE "GIUONG_BENH" (
    "MaGiuong" VARCHAR(20) NOT NULL,
    "MaPhong" VARCHAR(20) NOT NULL,
    "SoGiuong" VARCHAR(20) NOT NULL,
    "LoaiGiuong" VARCHAR(100) NOT NULL,
    "TrangThai" VARCHAR(100) NOT NULL DEFAULT 'SAN_SANG',
    "DonGiaNgay" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "GIUONG_BENH_pkey" PRIMARY KEY ("MaGiuong")
);

-- CreateTable
CREATE TABLE "NHAN_VIEN" (
    "MaNV" VARCHAR(20) NOT NULL,
    "MaKhoa" VARCHAR(20) NOT NULL,
    "HoTen" VARCHAR(100) NOT NULL,
    "NgaySinh" DATE NOT NULL,
    "GioiTinh" VARCHAR(10) NOT NULL,
    "CCCD" VARCHAR(20) NOT NULL,
    "DiaChi" VARCHAR(200) NOT NULL,
    "SoDienThoai" VARCHAR(15) NOT NULL,
    "NgayVaoLam" DATE NOT NULL,

    CONSTRAINT "NHAN_VIEN_pkey" PRIMARY KEY ("MaNV")
);

-- CreateTable
CREATE TABLE "BAC_SI" (
    "MaNV" VARCHAR(20) NOT NULL,
    "ChuyenKhoa" VARCHAR(100) NOT NULL,
    "TrinhDoHocVan" VARCHAR(100) NOT NULL,
    "SoChungChiHanhNghe" VARCHAR(50) NOT NULL,

    CONSTRAINT "BAC_SI_pkey" PRIMARY KEY ("MaNV")
);

-- CreateTable
CREATE TABLE "DIEU_DUONG" (
    "MaNV" VARCHAR(20) NOT NULL,
    "CapBac" VARCHAR(100) NOT NULL,
    "ChungChiHanhNghe" VARCHAR(50) NOT NULL,

    CONSTRAINT "DIEU_DUONG_pkey" PRIMARY KEY ("MaNV")
);

-- CreateTable
CREATE TABLE "KY_THUAT_VIEN" (
    "MaNV" VARCHAR(20) NOT NULL,
    "ChuyenMonXetNghiem" VARCHAR(100) NOT NULL,
    "BTD_ThietBiPhuTrach" VARCHAR(255) NOT NULL,

    CONSTRAINT "KY_THUAT_VIEN_pkey" PRIMARY KEY ("MaNV")
);

-- CreateTable
CREATE TABLE "BENH_NHAN" (
    "MaBN" VARCHAR(20) NOT NULL,
    "HoTen" VARCHAR(100) NOT NULL,
    "NgaySinh" DATE NOT NULL,
    "GioiTinh" VARCHAR(10) NOT NULL,
    "CCCD" VARCHAR(20) NOT NULL,
    "SDT" VARCHAR(15) NOT NULL,
    "DiaChi_Duong" VARCHAR(200) NOT NULL,
    "DiaChi_Phuong" VARCHAR(100) NOT NULL,
    "DiaChi_Quan" VARCHAR(100) NOT NULL,
    "NhomMau" VARCHAR(10) NOT NULL,

    CONSTRAINT "BENH_NHAN_pkey" PRIMARY KEY ("MaBN")
);

-- CreateTable
CREATE TABLE "THE_BHYT" (
    "MaTheBHYT" VARCHAR(20) NOT NULL,
    "MaBN" VARCHAR(20) NOT NULL,
    "MucHuong" DECIMAL(5,4) NOT NULL,
    "NgayBatDau" DATE NOT NULL,
    "NgayHetHan" DATE NOT NULL,

    CONSTRAINT "THE_BHYT_pkey" PRIMARY KEY ("MaTheBHYT")
);

-- CreateTable
CREATE TABLE "DOT_NOI_TRU" (
    "MaDotNT" VARCHAR(20) NOT NULL,
    "MaBN" VARCHAR(20) NOT NULL,
    "NgayNhapVien" DATE NOT NULL,
    "NguoiNhaLienHe" VARCHAR(100) NOT NULL,
    "TinhTrangNhapVien" VARCHAR(100) NOT NULL,
    "NgayRaVien" DATE,

    CONSTRAINT "DOT_NOI_TRU_pkey" PRIMARY KEY ("MaDotNT")
);

-- CreateTable
CREATE TABLE "PHAN_GIUONG" (
    "MaDotNT" VARCHAR(20) NOT NULL,
    "MaGiuong" VARCHAR(20) NOT NULL,
    "TuNgay" DATE NOT NULL,
    "DenNgay" DATE,

    CONSTRAINT "PHAN_GIUONG_pkey" PRIMARY KEY ("MaDotNT","MaGiuong","TuNgay")
);

-- CreateTable
CREATE TABLE "LUOT_KHAM" (
    "MaLuotKham" VARCHAR(20) NOT NULL,
    "MaBN" VARCHAR(20) NOT NULL,
    "MaNV_BacSi" VARCHAR(20) NOT NULL,
    "NgayGioKham" TIMESTAMP(3) NOT NULL,
    "LyDoKham" VARCHAR(255) NOT NULL,
    "TrieuChung" VARCHAR(255) NOT NULL,
    "ChanDoanSoBo" VARCHAR(255) NOT NULL,
    "TrangThai" VARCHAR(100) NOT NULL,
    "MaDotNT" VARCHAR(20),

    CONSTRAINT "LUOT_KHAM_pkey" PRIMARY KEY ("MaLuotKham")
);

-- CreateTable
CREATE TABLE "DON_THUOC" (
    "MaDonThuoc" VARCHAR(20) NOT NULL,
    "MaLuotKham" VARCHAR(20) NOT NULL,
    "NgayKeDon" DATE NOT NULL,
    "LoiDanCuaBacSi" VARCHAR(500) NOT NULL,

    CONSTRAINT "DON_THUOC_pkey" PRIMARY KEY ("MaDonThuoc")
);

-- CreateTable
CREATE TABLE "THUOC" (
    "MaThuoc" VARCHAR(20) NOT NULL,
    "TenThuoc" VARCHAR(100) NOT NULL,
    "HoatChat" VARCHAR(100) NOT NULL,
    "HamLuong" VARCHAR(50) NOT NULL,
    "DonViTinh" VARCHAR(30) NOT NULL,
    "DonGia" DECIMAL(18,2) NOT NULL,
    "HuongDanSD" VARCHAR(500) NOT NULL,

    CONSTRAINT "THUOC_pkey" PRIMARY KEY ("MaThuoc")
);

-- CreateTable
CREATE TABLE "CHI_TIET_DON_THUOC" (
    "MaDonThuoc" VARCHAR(20) NOT NULL,
    "MaThuoc" VARCHAR(20) NOT NULL,
    "SoLuong" INTEGER NOT NULL,
    "LieuDung" VARCHAR(200) NOT NULL,
    "DonGiaKe" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "CHI_TIET_DON_THUOC_pkey" PRIMARY KEY ("MaDonThuoc","MaThuoc")
);

-- CreateTable
CREATE TABLE "LOAI_XET_NGHIEM" (
    "MaLoaiXN" VARCHAR(20) NOT NULL,
    "TenXN" VARCHAR(100) NOT NULL,
    "ChiTieuBinhThuong" VARCHAR(255) NOT NULL,
    "DonGia" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "LOAI_XET_NGHIEM_pkey" PRIMARY KEY ("MaLoaiXN")
);

-- CreateTable
CREATE TABLE "PHIEU_XET_NGHIEM" (
    "MaPhieuXN" VARCHAR(20) NOT NULL,
    "MaLuotKham" VARCHAR(20) NOT NULL,
    "MaLoaiXN" VARCHAR(20) NOT NULL,
    "MaNV_KTV" VARCHAR(20),
    "NgayGioXN" TIMESTAMP(3),
    "NgayGioTraKQ" TIMESTAMP(3),
    "KetQua" VARCHAR(500),
    "DanhGia" VARCHAR(255),
    "DonGiaXN" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "PHIEU_XET_NGHIEM_pkey" PRIMARY KEY ("MaPhieuXN")
);

-- CreateTable
CREATE TABLE "VIEN_PHI" (
    "MaHoaDon" VARCHAR(20) NOT NULL,
    "MaLuotKham" VARCHAR(20) NOT NULL,
    "NgayLap" DATE NOT NULL,
    "HinhThucThanhToan" VARCHAR(100) NOT NULL,
    "TruBHYT" DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    "TrangThaiThanhToan" VARCHAR(100) NOT NULL DEFAULT 'CHUA_THANH_TOAN',

    CONSTRAINT "VIEN_PHI_pkey" PRIMARY KEY ("MaHoaDon")
);

-- CreateIndex
CREATE UNIQUE INDEX "NHAN_VIEN_CCCD_key" ON "NHAN_VIEN"("CCCD");

-- CreateIndex
CREATE UNIQUE INDEX "BAC_SI_SoChungChiHanhNghe_key" ON "BAC_SI"("SoChungChiHanhNghe");

-- CreateIndex
CREATE UNIQUE INDEX "DIEU_DUONG_ChungChiHanhNghe_key" ON "DIEU_DUONG"("ChungChiHanhNghe");

-- CreateIndex
CREATE UNIQUE INDEX "BENH_NHAN_CCCD_key" ON "BENH_NHAN"("CCCD");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_DOT_NOI_TRU_MADOT_MABN" ON "DOT_NOI_TRU"("MaDotNT", "MaBN");

-- CreateIndex
CREATE UNIQUE INDEX "DON_THUOC_MaLuotKham_key" ON "DON_THUOC"("MaLuotKham");

-- CreateIndex
CREATE UNIQUE INDEX "VIEN_PHI_MaLuotKham_key" ON "VIEN_PHI"("MaLuotKham");

-- AddForeignKey
ALTER TABLE "PHONG" ADD CONSTRAINT "FK01_PHONG_KHOA" FOREIGN KEY ("MaKhoa") REFERENCES "KHOA"("MaKhoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "GIUONG_BENH" ADD CONSTRAINT "FK02_GIUONG_PHONG" FOREIGN KEY ("MaPhong") REFERENCES "PHONG"("MaPhong") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NHAN_VIEN" ADD CONSTRAINT "FK03_NHAN_VIEN_KHOA" FOREIGN KEY ("MaKhoa") REFERENCES "KHOA"("MaKhoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BAC_SI" ADD CONSTRAINT "FK04_BAC_SI_NHAN_VIEN" FOREIGN KEY ("MaNV") REFERENCES "NHAN_VIEN"("MaNV") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DIEU_DUONG" ADD CONSTRAINT "FK05_DIEU_DUONG_NHAN_VIEN" FOREIGN KEY ("MaNV") REFERENCES "NHAN_VIEN"("MaNV") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "KY_THUAT_VIEN" ADD CONSTRAINT "FK06_KTV_NHAN_VIEN" FOREIGN KEY ("MaNV") REFERENCES "NHAN_VIEN"("MaNV") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "THE_BHYT" ADD CONSTRAINT "FK08_THE_BHYT_BENH_NHAN" FOREIGN KEY ("MaBN") REFERENCES "BENH_NHAN"("MaBN") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DOT_NOI_TRU" ADD CONSTRAINT "FK07_DOT_NOI_TRU_BENH_NHAN" FOREIGN KEY ("MaBN") REFERENCES "BENH_NHAN"("MaBN") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PHAN_GIUONG" ADD CONSTRAINT "FK18_PHAN_GIUONG_DOT_NOI_TRU" FOREIGN KEY ("MaDotNT") REFERENCES "DOT_NOI_TRU"("MaDotNT") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PHAN_GIUONG" ADD CONSTRAINT "FK19_PHAN_GIUONG_GIUONG_BENH" FOREIGN KEY ("MaGiuong") REFERENCES "GIUONG_BENH"("MaGiuong") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LUOT_KHAM" ADD CONSTRAINT "FK09_LUOT_KHAM_BENH_NHAN" FOREIGN KEY ("MaBN") REFERENCES "BENH_NHAN"("MaBN") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LUOT_KHAM" ADD CONSTRAINT "FK10_LUOT_KHAM_BAC_SI" FOREIGN KEY ("MaNV_BacSi") REFERENCES "BAC_SI"("MaNV") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LUOT_KHAM" ADD CONSTRAINT "FK11_LUOT_KHAM_DOT_NOI_TRU" FOREIGN KEY ("MaDotNT", "MaBN") REFERENCES "DOT_NOI_TRU"("MaDotNT", "MaBN") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DON_THUOC" ADD CONSTRAINT "FK12_DON_THUOC_LUOT_KHAM" FOREIGN KEY ("MaLuotKham") REFERENCES "LUOT_KHAM"("MaLuotKham") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CHI_TIET_DON_THUOC" ADD CONSTRAINT "FK13_CTDT_DON_THUOC" FOREIGN KEY ("MaDonThuoc") REFERENCES "DON_THUOC"("MaDonThuoc") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CHI_TIET_DON_THUOC" ADD CONSTRAINT "FK14_CTDT_THUOC" FOREIGN KEY ("MaThuoc") REFERENCES "THUOC"("MaThuoc") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PHIEU_XET_NGHIEM" ADD CONSTRAINT "FK15_PXN_LUOT_KHAM" FOREIGN KEY ("MaLuotKham") REFERENCES "LUOT_KHAM"("MaLuotKham") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PHIEU_XET_NGHIEM" ADD CONSTRAINT "FK16_PXN_LOAI_XN" FOREIGN KEY ("MaLoaiXN") REFERENCES "LOAI_XET_NGHIEM"("MaLoaiXN") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PHIEU_XET_NGHIEM" ADD CONSTRAINT "FK17_PXN_KTV" FOREIGN KEY ("MaNV_KTV") REFERENCES "KY_THUAT_VIEN"("MaNV") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VIEN_PHI" ADD CONSTRAINT "FK20_VIEN_PHI_LUOT_KHAM" FOREIGN KEY ("MaLuotKham") REFERENCES "LUOT_KHAM"("MaLuotKham") ON DELETE NO ACTION ON UPDATE NO ACTION;


-- ============================================================================
-- PHẦN MỞ RỘNG BẮT BUỘC v2.0: INDEX CÓ ĐIỀU KIỆN, CHECK, VIEWS & TRIGGERS
-- ============================================================================

-- 1. Filtered Unique Index cho BR-V2-12 (Mỗi bệnh nhân tối đa 1 đợt nội trú đang mở)
CREATE UNIQUE INDEX "UQ_DOT_NOI_TRU_OPEN_MABN"
ON "DOT_NOI_TRU" ("MaBN")
WHERE "NgayRaVien" IS NULL;

-- 2. CHECK Constraints cho toàn vẹn miền giá trị & quy tắc nội bảng
ALTER TABLE "GIUONG_BENH"
  ADD CONSTRAINT "CHK_GIUONG_BENH_TRANG_THAI" CHECK ("TrangThai" IN ('SAN_SANG', 'BAO_TRI', 'NGUNG_SU_DUNG')),
  ADD CONSTRAINT "CHK_GIUONG_BENH_DON_GIA" CHECK ("DonGiaNgay" >= 0);

ALTER TABLE "NHAN_VIEN"
  ADD CONSTRAINT "CHK_NHAN_VIEN_GIOI_TINH" CHECK ("GioiTinh" IN ('NAM', 'NU', 'KHAC'));

ALTER TABLE "BENH_NHAN"
  ADD CONSTRAINT "CHK_BENH_NHAN_GIOI_TINH" CHECK ("GioiTinh" IN ('NAM', 'NU', 'KHAC'));

ALTER TABLE "THE_BHYT"
  ADD CONSTRAINT "CHK_THE_BHYT_MUC_HUONG" CHECK ("MucHuong" >= 0 AND "MucHuong" <= 1),
  ADD CONSTRAINT "CHK_THE_BHYT_NGAY" CHECK ("NgayHetHan" >= "NgayBatDau");

ALTER TABLE "DOT_NOI_TRU"
  ADD CONSTRAINT "CHK_DOT_NOI_TRU_NGAY" CHECK ("NgayRaVien" IS NULL OR "NgayRaVien" >= "NgayNhapVien");

ALTER TABLE "PHAN_GIUONG"
  ADD CONSTRAINT "CHK_PHAN_GIUONG_NGAY" CHECK ("DenNgay" IS NULL OR "DenNgay" > "TuNgay");

ALTER TABLE "LUOT_KHAM"
  ADD CONSTRAINT "CHK_LUOT_KHAM_TRANG_THAI" CHECK ("TrangThai" IN ('CHO_KHAM', 'DANG_KHAM', 'CHO_XET_NGHIEM', 'HOAN_TAT', 'HUY'));

ALTER TABLE "CHI_TIET_DON_THUOC"
  ADD CONSTRAINT "CHK_CTDT_SO_LUONG" CHECK ("SoLuong" > 0),
  ADD CONSTRAINT "CHK_CTDT_DON_GIA" CHECK ("DonGiaKe" >= 0);

ALTER TABLE "THUOC"
  ADD CONSTRAINT "CHK_THUOC_DON_GIA" CHECK ("DonGia" >= 0);

ALTER TABLE "LOAI_XET_NGHIEM"
  ADD CONSTRAINT "CHK_LOAI_XN_DON_GIA" CHECK ("DonGia" >= 0);

ALTER TABLE "PHIEU_XET_NGHIEM"
  ADD CONSTRAINT "CHK_PXN_DON_GIA" CHECK ("DonGiaXN" >= 0),
  ADD CONSTRAINT "CHK_PXN_NGAY_KTV" CHECK ("NgayGioXN" IS NULL OR "MaNV_KTV" IS NOT NULL),
  ADD CONSTRAINT "CHK_PXN_KQ_PREREQ" CHECK (("KetQua" IS NULL AND "NgayGioTraKQ" IS NULL) OR ("MaNV_KTV" IS NOT NULL AND "NgayGioXN" IS NOT NULL)),
  ADD CONSTRAINT "CHK_PXN_KQ_PAIR" CHECK (("KetQua" IS NULL) = ("NgayGioTraKQ" IS NULL)),
  ADD CONSTRAINT "CHK_PXN_DANH_GIA" CHECK ("DanhGia" IS NULL OR ("KetQua" IS NOT NULL AND "NgayGioTraKQ" IS NOT NULL)),
  ADD CONSTRAINT "CHK_PXN_TRA_KQ_TIME" CHECK ("NgayGioTraKQ" IS NULL OR "NgayGioTraKQ" >= "NgayGioXN");

ALTER TABLE "VIEN_PHI"
  ADD CONSTRAINT "CHK_VIEN_PHI_HINH_THUC" CHECK ("HinhThucThanhToan" IN ('TIEN_MAT', 'CHUYEN_KHOAN', 'THE')),
  ADD CONSTRAINT "CHK_VIEN_PHI_TRANG_THAI" CHECK ("TrangThaiThanhToan" IN ('CHUA_THANH_TOAN', 'DA_THANH_TOAN')),
  ADD CONSTRAINT "CHK_VIEN_PHI_TRU_BHYT" CHECK ("TruBHYT" >= 0);

-- 3. 6 Thuộc tính dẫn xuất thông qua PostgreSQL VIEW
CREATE OR REPLACE VIEW "V_NHAN_VIEN" AS
SELECT
  nv.*,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, nv."NgayVaoLam"))::INT AS "SoNamCongTac"
FROM "NHAN_VIEN" nv;

CREATE OR REPLACE VIEW "V_BENH_NHAN" AS
SELECT
  bn.*,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, bn."NgaySinh"))::INT AS "Tuoi"
FROM "BENH_NHAN" bn;

CREATE OR REPLACE VIEW "V_DON_THUOC" AS
SELECT
  dt.*,
  COALESCE(SUM(ct."SoLuong" * ct."DonGiaKe"), 0)::DECIMAL(18,2) AS "TongTienThuoc"
FROM "DON_THUOC" dt
LEFT JOIN "CHI_TIET_DON_THUOC" ct ON ct."MaDonThuoc" = dt."MaDonThuoc"
GROUP BY dt."MaDonThuoc", dt."MaLuotKham", dt."NgayKeDon", dt."LoiDanCuaBacSi";

CREATE OR REPLACE VIEW "V_LUOT_KHAM_CHI_PHI" AS
SELECT
  lk."MaLuotKham",
  COALESCE((
    SELECT SUM(ct."SoLuong" * ct."DonGiaKe")
    FROM "DON_THUOC" dt
    JOIN "CHI_TIET_DON_THUOC" ct ON ct."MaDonThuoc" = dt."MaDonThuoc"
    WHERE dt."MaLuotKham" = lk."MaLuotKham"
  ), 0)::DECIMAL(18,2) AS "TongTienThuoc",
  COALESCE((
    SELECT SUM(pxn."DonGiaXN")
    FROM "PHIEU_XET_NGHIEM" pxn
    WHERE pxn."MaLuotKham" = lk."MaLuotKham"
      AND pxn."NgayGioXN" IS NOT NULL
  ), 0)::DECIMAL(18,2) AS "TongTienDichVu"
FROM "LUOT_KHAM" lk;

CREATE OR REPLACE VIEW "V_VIEN_PHI" AS
SELECT
  vp.*,
  cp."TongTienDichVu",
  cp."TongTienThuoc",
  (cp."TongTienThuoc" + cp."TongTienDichVu" - vp."TruBHYT")::DECIMAL(18,2) AS "ThucThu"
FROM "VIEN_PHI" vp
JOIN "V_LUOT_KHAM_CHI_PHI" cp ON cp."MaLuotKham" = vp."MaLuotKham";

-- 4. Functions & Triggers cho toàn vẹn liên bảng (BR-V2-01..13)

-- BR-V2-01: Disjoint specialization (BAC_SI, DIEU_DUONG, KY_THUAT_VIEN)
CREATE OR REPLACE FUNCTION fn_check_staff_disjoint()
RETURNS TRIGGER AS $$
DECLARE
  v_other_count INT := 0;
BEGIN
  PERFORM 1 FROM "NHAN_VIEN" WHERE "MaNV" = NEW."MaNV" FOR UPDATE;

  IF TG_TABLE_NAME = 'BAC_SI' THEN
    SELECT COUNT(*) INTO v_other_count FROM (
      SELECT 1 FROM "DIEU_DUONG" WHERE "MaNV" = NEW."MaNV"
      UNION ALL
      SELECT 1 FROM "KY_THUAT_VIEN" WHERE "MaNV" = NEW."MaNV"
    ) t;
  ELSIF TG_TABLE_NAME = 'DIEU_DUONG' THEN
    SELECT COUNT(*) INTO v_other_count FROM (
      SELECT 1 FROM "BAC_SI" WHERE "MaNV" = NEW."MaNV"
      UNION ALL
      SELECT 1 FROM "KY_THUAT_VIEN" WHERE "MaNV" = NEW."MaNV"
    ) t;
  ELSIF TG_TABLE_NAME = 'KY_THUAT_VIEN' THEN
    SELECT COUNT(*) INTO v_other_count FROM (
      SELECT 1 FROM "BAC_SI" WHERE "MaNV" = NEW."MaNV"
      UNION ALL
      SELECT 1 FROM "DIEU_DUONG" WHERE "MaNV" = NEW."MaNV"
    ) t;
  END IF;

  IF v_other_count > 0 THEN
    RAISE EXCEPTION '[BR-V2-01] Nhan vien % da thuoc nhom chuyen mon khac (vi pham disjoint)', NEW."MaNV";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bac_si_disjoint
BEFORE INSERT OR UPDATE ON "BAC_SI"
FOR EACH ROW EXECUTE FUNCTION fn_check_staff_disjoint();

CREATE TRIGGER trg_dieu_duong_disjoint
BEFORE INSERT OR UPDATE ON "DIEU_DUONG"
FOR EACH ROW EXECUTE FUNCTION fn_check_staff_disjoint();

CREATE TRIGGER trg_ktv_disjoint
BEFORE INSERT OR UPDATE ON "KY_THUAT_VIEN"
FOR EACH ROW EXECUTE FUNCTION fn_check_staff_disjoint();

-- BR-V2-12: DOT_NOI_TRU không chồng khoảng [NgayNhapVien, NgayRaVien + 1) trên cùng MaBN
CREATE OR REPLACE FUNCTION fn_check_dot_noi_tru_overlap()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM 1 FROM "BENH_NHAN" WHERE "MaBN" = NEW."MaBN" FOR UPDATE;

  IF TG_OP = 'UPDATE' AND OLD."MaBN" IS DISTINCT FROM NEW."MaBN" THEN
    IF EXISTS (SELECT 1 FROM "PHAN_GIUONG" WHERE "MaDotNT" = OLD."MaDotNT")
       OR EXISTS (SELECT 1 FROM "LUOT_KHAM" WHERE "MaDotNT" = OLD."MaDotNT") THEN
      RAISE EXCEPTION '[BR-V2-04] Khong the doi MaBN cua dot noi tru % khi da co du lieu phan giuong/luot kham lien quan', OLD."MaDotNT";
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "DOT_NOI_TRU" d
    WHERE d."MaBN" = NEW."MaBN"
      AND d."MaDotNT" <> NEW."MaDotNT"
      AND daterange(d."NgayNhapVien", COALESCE((d."NgayRaVien" + 1), DATE '9999-12-31'), '[)')
       && daterange(NEW."NgayNhapVien", COALESCE((NEW."NgayRaVien" + 1), DATE '9999-12-31'), '[)')
  ) THEN
    RAISE EXCEPTION '[BR-V2-12] Khoang dieu tri noi tru bi chong lan voi dot khac cua benh nhan %', NEW."MaBN";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dot_noi_tru_overlap
BEFORE INSERT OR UPDATE ON "DOT_NOI_TRU"
FOR EACH ROW EXECUTE FUNCTION fn_check_dot_noi_tru_overlap();

-- BR-V2-03 & BR-V2-04 (Deferred): đồng bộ PHAN_GIUONG & LUOT_KHAM khi cập nhật DOT_NOI_TRU
CREATE OR REPLACE FUNCTION fn_check_dot_noi_tru_children_deferred()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "PHAN_GIUONG" pg
    WHERE pg."MaDotNT" = NEW."MaDotNT"
      AND (
        pg."TuNgay" < NEW."NgayNhapVien"
        OR (NEW."NgayRaVien" IS NOT NULL AND (pg."DenNgay" IS NULL OR pg."DenNgay" > (NEW."NgayRaVien" + 1)))
      )
  ) THEN
    RAISE EXCEPTION '[BR-V2-03] Phan giuong thuoc dot % khong khop khung ngay nhap/ra vien', NEW."MaDotNT";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "LUOT_KHAM" lk
    WHERE lk."MaDotNT" = NEW."MaDotNT"
      AND (
        lk."NgayGioKham" < NEW."NgayNhapVien"::timestamp
        OR (NEW."NgayRaVien" IS NOT NULL AND lk."NgayGioKham" >= (NEW."NgayRaVien" + 1)::timestamp)
      )
  ) THEN
    RAISE EXCEPTION '[BR-V2-04] Luot kham noi tru thuoc dot % nam ngoai khung ngay nhap/ra vien', NEW."MaDotNT";
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_dot_noi_tru_children_deferred
AFTER INSERT OR UPDATE ON "DOT_NOI_TRU"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_dot_noi_tru_children_deferred();

-- BR-V2-03 & BR-V2-11: PHAN_GIUONG [TuNgay, DenNgay) & trạng thái khai thác giường
CREATE OR REPLACE FUNCTION fn_check_phan_giuong()
RETURNS TRIGGER AS $$
DECLARE
  v_dot RECORD;
  v_bed_status VARCHAR(100);
BEGIN
  SELECT * INTO v_dot FROM "DOT_NOI_TRU" WHERE "MaDotNT" = NEW."MaDotNT" FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '[BR-V2-03] Dot noi tru % khong ton tai', NEW."MaDotNT";
  END IF;

  SELECT "TrangThai" INTO v_bed_status FROM "GIUONG_BENH" WHERE "MaGiuong" = NEW."MaGiuong" FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '[BR-V2-03] Giuong % khong ton tai', NEW."MaGiuong";
  END IF;

  IF TG_OP = 'INSERT'
     OR (TG_OP = 'UPDATE' AND (NEW."MaGiuong" IS DISTINCT FROM OLD."MaGiuong" OR (OLD."DenNgay" IS NOT NULL AND NEW."DenNgay" IS NULL))) THEN
    IF v_bed_status <> 'SAN_SANG' THEN
      RAISE EXCEPTION '[BR-V2-11] Giuong % dang o trang thai %, khong the phan giuong', NEW."MaGiuong", v_bed_status;
    END IF;
  END IF;

  IF NEW."TuNgay" < v_dot."NgayNhapVien" THEN
    RAISE EXCEPTION '[BR-V2-03] TuNgay (%) phai >= NgayNhapVien (%)', NEW."TuNgay", v_dot."NgayNhapVien";
  END IF;

  IF v_dot."NgayRaVien" IS NOT NULL AND (NEW."DenNgay" IS NULL OR NEW."DenNgay" > (v_dot."NgayRaVien" + 1)) THEN
    RAISE EXCEPTION '[BR-V2-03] Dot % da ra vien (%), phan giuong phai co DenNgay <= NgayRaVien + 1', NEW."MaDotNT", v_dot."NgayRaVien";
  END IF;

  IF EXISTS (
    SELECT 1 FROM "PHAN_GIUONG" pg
    WHERE pg."MaGiuong" = NEW."MaGiuong"
      AND NOT (TG_OP = 'UPDATE' AND pg."MaDotNT" = OLD."MaDotNT" AND pg."MaGiuong" = OLD."MaGiuong" AND pg."TuNgay" = OLD."TuNgay")
      AND daterange(pg."TuNgay", COALESCE(pg."DenNgay", DATE '9999-12-31'), '[)')
       && daterange(NEW."TuNgay", COALESCE(NEW."DenNgay", DATE '9999-12-31'), '[)')
  ) THEN
    RAISE EXCEPTION '[BR-V2-03] Giuong % bi trung khoang phan giuong', NEW."MaGiuong";
  END IF;

  IF EXISTS (
    SELECT 1 FROM "PHAN_GIUONG" pg
    WHERE pg."MaDotNT" = NEW."MaDotNT"
      AND NOT (TG_OP = 'UPDATE' AND pg."MaDotNT" = OLD."MaDotNT" AND pg."MaGiuong" = OLD."MaGiuong" AND pg."TuNgay" = OLD."TuNgay")
      AND daterange(pg."TuNgay", COALESCE(pg."DenNgay", DATE '9999-12-31'), '[)')
       && daterange(NEW."TuNgay", COALESCE(NEW."DenNgay", DATE '9999-12-31'), '[)')
  ) THEN
    RAISE EXCEPTION '[BR-V2-03] Dot noi tru % bi trung khoang nam nhieu giuong cung luc', NEW."MaDotNT";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_phan_giuong_check
BEFORE INSERT OR UPDATE ON "PHAN_GIUONG"
FOR EACH ROW EXECUTE FUNCTION fn_check_phan_giuong();

-- BR-V2-04: LUOT_KHAM nội trú nằm trong khung đợt nội trú
CREATE OR REPLACE FUNCTION fn_check_luot_kham_dot_nt()
RETURNS TRIGGER AS $$
DECLARE
  v_dot RECORD;
BEGIN
  IF NEW."MaDotNT" IS NOT NULL THEN
    SELECT * INTO v_dot FROM "DOT_NOI_TRU" WHERE "MaDotNT" = NEW."MaDotNT";
    IF FOUND THEN
      IF NEW."NgayGioKham" < v_dot."NgayNhapVien"::timestamp
         OR (v_dot."NgayRaVien" IS NOT NULL AND NEW."NgayGioKham" >= (v_dot."NgayRaVien" + 1)::timestamp) THEN
        RAISE EXCEPTION '[BR-V2-04] NgayGioKham (%) nam ngoai khung thoi gian dot noi tru %', NEW."NgayGioKham", NEW."MaDotNT";
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_luot_kham_dot_nt
BEFORE INSERT OR UPDATE ON "LUOT_KHAM"
FOR EACH ROW EXECUTE FUNCTION fn_check_luot_kham_dot_nt();

-- BR-V2-06 (Deferred): DON_THUOC phải có ít nhất 1 dòng CHI_TIET_DON_THUOC
CREATE OR REPLACE FUNCTION fn_check_don_thuoc_not_empty()
RETURNS TRIGGER AS $$
DECLARE
  v_ma_don VARCHAR(20);
BEGIN
  IF TG_TABLE_NAME = 'DON_THUOC' THEN
    v_ma_don := NEW."MaDonThuoc";
  ELSE
    v_ma_don := OLD."MaDonThuoc";
  END IF;

  IF EXISTS (SELECT 1 FROM "DON_THUOC" WHERE "MaDonThuoc" = v_ma_don) THEN
    IF NOT EXISTS (SELECT 1 FROM "CHI_TIET_DON_THUOC" WHERE "MaDonThuoc" = v_ma_don) THEN
      RAISE EXCEPTION '[BR-V2-06] Don thuoc % phai co it nhat 1 dong chi tiet thuoc', v_ma_don;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_don_thuoc_not_empty_dt
AFTER INSERT OR UPDATE ON "DON_THUOC"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_don_thuoc_not_empty();

CREATE CONSTRAINT TRIGGER trg_don_thuoc_not_empty_ct
AFTER DELETE OR UPDATE ON "CHI_TIET_DON_THUOC"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_don_thuoc_not_empty();

-- BR-V2-08 & BR-V2-13: Khóa chi phí sau thanh toán & kiểm tra TruBHYT <= TongTienThuoc + TongTienDichVu
CREATE OR REPLACE FUNCTION fn_compute_luot_kham_total(p_ma_luot_kham VARCHAR)
RETURNS DECIMAL(18,2) AS $$
DECLARE
  v_thuoc DECIMAL(18,2) := 0;
  v_dv DECIMAL(18,2) := 0;
BEGIN
  SELECT COALESCE(SUM(ct."SoLuong" * ct."DonGiaKe"), 0)
  INTO v_thuoc
  FROM "DON_THUOC" dt
  JOIN "CHI_TIET_DON_THUOC" ct ON ct."MaDonThuoc" = dt."MaDonThuoc"
  WHERE dt."MaLuotKham" = p_ma_luot_kham;

  SELECT COALESCE(SUM(pxn."DonGiaXN"), 0)
  INTO v_dv
  FROM "PHIEU_XET_NGHIEM" pxn
  WHERE pxn."MaLuotKham" = p_ma_luot_kham
    AND pxn."NgayGioXN" IS NOT NULL;

  RETURN (v_thuoc + v_dv)::DECIMAL(18,2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_assert_luot_kham_unlocked(p_ma_luot_kham VARCHAR)
RETURNS VOID AS $$
BEGIN
  IF p_ma_luot_kham IS NULL THEN
    RETURN;
  END IF;

  PERFORM 1 FROM "LUOT_KHAM" WHERE "MaLuotKham" = p_ma_luot_kham FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM "VIEN_PHI"
    WHERE "MaLuotKham" = p_ma_luot_kham
      AND "TrangThaiThanhToan" = 'DA_THANH_TOAN'
  ) THEN
    RAISE EXCEPTION '[BR-V2-08] Vien phi cua luot kham % da thanh toan, khoa moi thay doi chi phi', p_ma_luot_kham;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_assert_trubhyt_bounds(p_ma_luot_kham VARCHAR)
RETURNS VOID AS $$
DECLARE
  v_tru DECIMAL(18,2);
  v_total DECIMAL(18,2);
BEGIN
  IF p_ma_luot_kham IS NULL THEN
    RETURN;
  END IF;

  SELECT "TruBHYT" INTO v_tru FROM "VIEN_PHI" WHERE "MaLuotKham" = p_ma_luot_kham;
  IF FOUND THEN
    v_total := fn_compute_luot_kham_total(p_ma_luot_kham);
    IF v_tru < 0 OR v_tru > v_total THEN
      RAISE EXCEPTION '[BR-V2-13] TruBHYT (%) vuot qua tong chi phi (%) cua luot kham %', v_tru, v_total, p_ma_luot_kham;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_check_vien_phi_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(18,2);
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM 1 FROM "LUOT_KHAM" WHERE "MaLuotKham" = OLD."MaLuotKham" FOR UPDATE;
    IF OLD."TrangThaiThanhToan" = 'DA_THANH_TOAN' THEN
      RAISE EXCEPTION '[BR-V2-08] Hoa don % da thanh toan, khong duoc sua hoac xoa', OLD."MaHoaDon";
    END IF;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM 1 FROM "LUOT_KHAM" WHERE "MaLuotKham" = NEW."MaLuotKham" FOR UPDATE;
    IF TG_OP = 'UPDATE' AND NEW."MaLuotKham" IS DISTINCT FROM OLD."MaLuotKham" THEN
      PERFORM fn_assert_luot_kham_unlocked(NEW."MaLuotKham");
    END IF;

    v_total := fn_compute_luot_kham_total(NEW."MaLuotKham");
    IF NEW."TruBHYT" < 0 OR NEW."TruBHYT" > v_total THEN
      RAISE EXCEPTION '[BR-V2-08] TruBHYT (%) khong hop le voi tong chi phi (%)', NEW."TruBHYT", v_total;
    END IF;
    RETURN NEW;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vien_phi_rules
BEFORE INSERT OR UPDATE OR DELETE ON "VIEN_PHI"
FOR EACH ROW EXECUTE FUNCTION fn_check_vien_phi_rules();

CREATE OR REPLACE FUNCTION fn_check_cost_item_unlocked()
RETURNS TRIGGER AS $$
DECLARE
  v_old_lk VARCHAR(20);
  v_new_lk VARCHAR(20);
BEGIN
  IF TG_TABLE_NAME IN ('DON_THUOC', 'PHIEU_XET_NGHIEM') THEN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN v_old_lk := OLD."MaLuotKham"; END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN v_new_lk := NEW."MaLuotKham"; END IF;
  ELSIF TG_TABLE_NAME = 'CHI_TIET_DON_THUOC' THEN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      SELECT "MaLuotKham" INTO v_old_lk FROM "DON_THUOC" WHERE "MaDonThuoc" = OLD."MaDonThuoc";
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      SELECT "MaLuotKham" INTO v_new_lk FROM "DON_THUOC" WHERE "MaDonThuoc" = NEW."MaDonThuoc";
    END IF;
  END IF;

  IF v_old_lk IS NOT NULL THEN
    PERFORM fn_assert_luot_kham_unlocked(v_old_lk);
  END IF;
  IF v_new_lk IS NOT NULL AND v_new_lk IS DISTINCT FROM v_old_lk THEN
    PERFORM fn_assert_luot_kham_unlocked(v_new_lk);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_don_thuoc_lock
BEFORE INSERT OR UPDATE OR DELETE ON "DON_THUOC"
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_unlocked();

CREATE TRIGGER trg_ctdt_lock
BEFORE INSERT OR UPDATE OR DELETE ON "CHI_TIET_DON_THUOC"
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_unlocked();

CREATE TRIGGER trg_pxn_lock
BEFORE INSERT OR UPDATE OR DELETE ON "PHIEU_XET_NGHIEM"
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_unlocked();

CREATE OR REPLACE FUNCTION fn_check_cost_item_trubhyt_deferred()
RETURNS TRIGGER AS $$
DECLARE
  v_old_lk VARCHAR(20);
  v_new_lk VARCHAR(20);
BEGIN
  IF TG_TABLE_NAME IN ('DON_THUOC', 'PHIEU_XET_NGHIEM') THEN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN v_old_lk := OLD."MaLuotKham"; END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN v_new_lk := NEW."MaLuotKham"; END IF;
  ELSIF TG_TABLE_NAME = 'CHI_TIET_DON_THUOC' THEN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      SELECT "MaLuotKham" INTO v_old_lk FROM "DON_THUOC" WHERE "MaDonThuoc" = OLD."MaDonThuoc";
    END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      SELECT "MaLuotKham" INTO v_new_lk FROM "DON_THUOC" WHERE "MaDonThuoc" = NEW."MaDonThuoc";
    END IF;
  END IF;

  IF v_old_lk IS NOT NULL THEN
    PERFORM fn_assert_trubhyt_bounds(v_old_lk);
  END IF;
  IF v_new_lk IS NOT NULL AND v_new_lk IS DISTINCT FROM v_old_lk THEN
    PERFORM fn_assert_trubhyt_bounds(v_new_lk);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_don_thuoc_trubhyt_deferred
AFTER INSERT OR UPDATE OR DELETE ON "DON_THUOC"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_trubhyt_deferred();

CREATE CONSTRAINT TRIGGER trg_ctdt_trubhyt_deferred
AFTER INSERT OR UPDATE OR DELETE ON "CHI_TIET_DON_THUOC"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_trubhyt_deferred();

CREATE CONSTRAINT TRIGGER trg_pxn_trubhyt_deferred
AFTER INSERT OR UPDATE OR DELETE ON "PHIEU_XET_NGHIEM"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_check_cost_item_trubhyt_deferred();
