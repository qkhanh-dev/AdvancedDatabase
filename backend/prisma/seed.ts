import { PrismaClient, LoaiPhongEnum, LoaiGiuongEnum, TrangThaiGiuongEnum, LoaiNVEnum, GioiTinhEnum, NhomMauEnum, HuongXuTriEnum, TrangThaiPhatThuocEnum, LoaiDichVuEnum, PhuongThucTTEnum, TrangThaiTTEnum, CaTrucEnum, TrangThaiDiemDanhEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Hospital Database Seed...');

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Dược phẩm (THUOC)
  console.log('1. Seeding Thuoc...');
  await prisma.thuoc.upsert({
    where: { MaThuoc: 'TH01' },
    update: {},
    create: {
      MaThuoc: 'TH01',
      TenThuoc: 'Paracetamol 500mg',
      HoatChatChinh: 'Paracetamol',
      DonViTinh: 'Vien',
      DonGiaHienHanh: 1500,
      SoLuongTon: 5000,
      NuocSanXuat: 'Viet Nam',
      HanSuDung: new Date('2028-12-31'),
    },
  });

  await prisma.thuoc.upsert({
    where: { MaThuoc: 'TH02' },
    update: {},
    create: {
      MaThuoc: 'TH02',
      TenThuoc: 'Amoxicillin 500mg',
      HoatChatChinh: 'Amoxicillin',
      DonViTinh: 'Vien',
      DonGiaHienHanh: 3500,
      SoLuongTon: 2000,
      NuocSanXuat: 'Phap',
      HanSuDung: new Date('2027-10-15'),
    },
  });

  await prisma.thuoc.upsert({
    where: { MaThuoc: 'TH03' },
    update: {},
    create: {
      MaThuoc: 'TH03',
      TenThuoc: 'Cefixime 200mg',
      HoatChatChinh: 'Cefixime',
      DonViTinh: 'Vien',
      DonGiaHienHanh: 8500,
      SoLuongTon: 1500,
      NuocSanXuat: 'Han Quoc',
      HanSuDung: new Date('2027-06-30'),
    },
  });

  // 2. Dịch vụ kỹ thuật (DICH_VU)
  console.log('2. Seeding DichVu...');
  await prisma.dichVu.upsert({
    where: { MaDV: 'DV01' },
    update: {},
    create: {
      MaDV: 'DV01',
      TenDV: 'Tong phan tich te bao mau ngoai vi (CBC)',
      LoaiDichVu: LoaiDichVuEnum.XET_NGHIEM,
      DonViTinhDV: 'Lan',
      DonGiaHienHanh: 80000,
      ThuocBHYTChiTra: true,
    },
  });

  await prisma.dichVu.upsert({
    where: { MaDV: 'DV02' },
    update: {},
    create: {
      MaDV: 'DV02',
      TenDV: 'Chup X-quang tim phoi thang',
      LoaiDichVu: LoaiDichVuEnum.CDHA,
      DonViTinhDV: 'Phim',
      DonGiaHienHanh: 120000,
      ThuocBHYTChiTra: true,
    },
  });

  await prisma.dichVu.upsert({
    where: { MaDV: 'DV03' },
    update: {},
    create: {
      MaDV: 'DV03',
      TenDV: 'Sieu am o bung tong quat',
      LoaiDichVu: LoaiDichVuEnum.CDHA,
      DonViTinhDV: 'Lan',
      DonGiaHienHanh: 150000,
      ThuocBHYTChiTra: true,
    },
  });

  // 3. Khởi tạo Khoa & Bác sĩ (Xử lý Circular FK: KHOA.MaTruongKhoa <-> BAC_SI.MaNV)
  console.log('3. Seeding Khoa, NhanVien & BacSi...');
  // Check if K01 exists
  const existK01 = await prisma.khoa.findUnique({ where: { MaKhoa: 'K01' } });
  if (!existK01) {
    // Step A: Create NhanVien BS01 temporarily without khoa or use raw SQL / order
    // In PostgreSQL, we can use a transaction or insert with deferred constraints or create Khoa with dummy then update
    // Using prisma: We create Khoa after or create with raw query
    await prisma.$executeRawUnsafe(`
      INSERT INTO "KHOA" ("MaKhoa", "TenKhoa", "ViTri", "SoDienThoaiKhoa", "MaTruongKhoa", "NgayBoNhiem")
      VALUES ('K01', 'Khoa Noi Tong Hop', 'Tang 2 - Toa Nha A', '02838381111', 'BS01', '2025-01-01')
      ON CONFLICT ("MaKhoa") DO NOTHING;
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "KHOA" ("MaKhoa", "TenKhoa", "ViTri", "SoDienThoaiKhoa", "MaTruongKhoa", "NgayBoNhiem")
      VALUES ('K02', 'Khoa Ngoai Tong Hop', 'Tang 3 - Toa Nha B', '02838382222', 'BS02', '2025-02-01')
      ON CONFLICT ("MaKhoa") DO NOTHING;
    `);
  }

  // Create Staff BS01 (Doctor / Chief of Internal Medicine)
  await prisma.nhanVien.upsert({
    where: { MaNV: 'BS01' },
    update: {},
    create: {
      MaNV: 'BS01',
      HoTen: 'BS. CKI Tran Van Nam',
      NgaySinh: new Date('1980-01-15'),
      GioiTinh: GioiTinhEnum.NAM,
      CCCD: '079080000001',
      SoDienThoai: '0908000001',
      Email: 'dr.nam@hospital.sgu.vn',
      DiaChi: '123 Nguyen Trai, Quan 5, TP.HCM',
      NgayVaoLam: new Date('2010-03-01'),
      HeSoLuong: 4.40,
      LoaiNV: LoaiNVEnum.BAC_SI,
      MatKhau: passwordHash,
      MaKhoa: 'K01',
      bacSi: {
        create: {
          HocVi: 'Bac si CKI',
          ChuyenKhoa: 'Noi khoa',
          SoCCHN: 'CCHN_BS_0001',
          PhuCapKham: 50000,
        },
      },
    },
  });

  // Create Staff BS02 (Doctor / Chief of Surgery)
  await prisma.nhanVien.upsert({
    where: { MaNV: 'BS02' },
    update: {},
    create: {
      MaNV: 'BS02',
      HoTen: 'ThS. BS Nguyen Thi Mai',
      NgaySinh: new Date('1983-05-20'),
      GioiTinh: GioiTinhEnum.NU,
      CCCD: '079083000002',
      SoDienThoai: '0908000002',
      Email: 'dr.mai@hospital.sgu.vn',
      DiaChi: '456 Tran Hung Dao, Quan 5, TP.HCM',
      NgayVaoLam: new Date('2012-07-01'),
      HeSoLuong: 4.20,
      LoaiNV: LoaiNVEnum.BAC_SI,
      MatKhau: passwordHash,
      MaKhoa: 'K02',
      bacSi: {
        create: {
          HocVi: 'Thac si Y khoa',
          ChuyenKhoa: 'Ngoai long nguc',
          SoCCHN: 'CCHN_BS_0002',
          PhuCapKham: 50000,
        },
      },
    },
  });

  // Create Nurse DD01
  await prisma.nhanVien.upsert({
    where: { MaNV: 'DD01' },
    update: {},
    create: {
      MaNV: 'DD01',
      HoTen: 'CN. Le Thi Lan',
      NgaySinh: new Date('1992-08-10'),
      GioiTinh: GioiTinhEnum.NU,
      CCCD: '079092000003',
      SoDienThoai: '0908000003',
      Email: 'lan.le@hospital.sgu.vn',
      DiaChi: '789 Vo Van Kiet, Quan 1, TP.HCM',
      NgayVaoLam: new Date('2016-01-15'),
      HeSoLuong: 3.00,
      LoaiNV: LoaiNVEnum.DIEU_DUONG,
      MatKhau: passwordHash,
      MaKhoa: 'K01',
      dieuDuong: {
        create: {
          TrinhDoChuyenMon: 'Cu nhan Dieu duong',
          SoCCHN_DD: 'CCHN_DD_0001',
          PhuCapTruc: 100000,
        },
      },
    },
  });

  // Create Cashier / Reception NV_TN_01
  await prisma.nhanVien.upsert({
    where: { MaNV: 'NV_TN_01' },
    update: {},
    create: {
      MaNV: 'NV_TN_01',
      HoTen: 'Pham Minh Hoang',
      NgaySinh: new Date('1995-12-05'),
      GioiTinh: GioiTinhEnum.NAM,
      CCCD: '079095000004',
      SoDienThoai: '0908000004',
      Email: 'hoang.pham@hospital.sgu.vn',
      DiaChi: '321 Su Van Hanh, Quan 10, TP.HCM',
      NgayVaoLam: new Date('2019-04-01'),
      HeSoLuong: 2.67,
      LoaiNV: LoaiNVEnum.HANH_CHINH,
      MatKhau: passwordHash,
      MaKhoa: 'K01',
      nvHanhChinh: {
        create: {
          BoPhanPhuTrach: 'Thu ngan vien phi & Tiep don',
          ChucVuHC: 'Chuyen vien thu ngan',
          BacKyThuat: 2,
        },
      },
    },
  });

  // 4. Phòng (PHONG)
  console.log('4. Seeding Phong...');
  await prisma.phong.upsert({
    where: { MaPhong: 'P01' },
    update: {},
    create: {
      MaPhong: 'P01',
      SoPhong: 'A101',
      LoaiPhong: LoaiPhongEnum.KHAM,
      Tang: 1,
      SucChuaToiDa: 10,
      MaKhoa: 'K01',
    },
  });

  await prisma.phong.upsert({
    where: { MaPhong: 'P02' },
    update: {},
    create: {
      MaPhong: 'P02',
      SoPhong: 'A201',
      LoaiPhong: LoaiPhongEnum.NOI_TRU,
      Tang: 2,
      SucChuaToiDa: 4,
      MaKhoa: 'K01',
    },
  });

  // 5. Giường bệnh (GIUONG_BENH)
  console.log('5. Seeding GiuongBenh...');
  await prisma.giuongBenh.upsert({
    where: { MaGiuong: 'G01' },
    update: {},
    create: {
      MaGiuong: 'G01',
      SoGiuong: 'Giuong 01',
      LoaiGiuong: LoaiGiuongEnum.TIEU_CHUAN,
      DonGiaNgay: 200000,
      TrangThaiGiuong: TrangThaiGiuongEnum.TRONG,
      MaPhong: 'P02',
    },
  });

  await prisma.giuongBenh.upsert({
    where: { MaGiuong: 'G02' },
    update: {},
    create: {
      MaGiuong: 'G02',
      SoGiuong: 'Giuong 02',
      LoaiGiuong: LoaiGiuongEnum.VIP,
      DonGiaNgay: 500000,
      TrangThaiGiuong: TrangThaiGiuongEnum.TRONG,
      MaPhong: 'P02',
    },
  });

  // 6. Bệnh nhân mẫu (BENH_NHAN)
  console.log('6. Seeding BenhNhan...');
  await prisma.benhNhan.upsert({
    where: { MaBN: 'BN001' },
    update: {},
    create: {
      MaBN: 'BN001',
      HoTen: 'Nguyen Van An',
      NgaySinh: new Date('1988-03-25'),
      GioiTinh: GioiTinhEnum.NAM,
      CCCD: '079088123456',
      SoDienThoai: '0912345678',
      SoBHYT: 'DN4798812345678',
      MucHuongBHYT: 80,
      DiaChi: '100 CMT8, Quan 3, TP.HCM',
      NhomMau: NhomMauEnum.O,
      CoNgoaiTru: true,
      CoNoiTru: false,
      bnNgoaiTru: {
        create: {
          SoSoKhamBenh: 'SO_BN001',
          NgayDangKyDau: new Date('2025-06-01'),
          TinhTrangTheoDoi: 'Kham suc khoe tong quat dinh ky',
        },
      },
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
