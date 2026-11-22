import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Hospital Database v2.0 Seed (18 Tables)...');

  // 1. KHOA
  await prisma.khoa.upsert({
    where: { MaKhoa: 'K01' },
    update: {},
    create: {
      MaKhoa: 'K01',
      TenKhoa: 'Khoa Nội Tổng Hợp',
      DiaDiem: 'Tầng 2 - Tòa nhà A',
      SoDienThoai: '02838381111',
    },
  });

  await prisma.khoa.upsert({
    where: { MaKhoa: 'K02' },
    update: {},
    create: {
      MaKhoa: 'K02',
      TenKhoa: 'Khoa Ngoại Tổng Hợp',
      DiaDiem: 'Tầng 3 - Tòa nhà B',
      SoDienThoai: '02838382222',
    },
  });

  // 2. PHONG
  await prisma.phong.upsert({
    where: { MaPhong: 'P01' },
    update: {},
    create: {
      MaPhong: 'P01',
      MaKhoa: 'K01',
      TenPhong: 'Phòng Khám Nội 101',
      LoaiPhong: 'KHAM',
      ViTri: 'Tầng 1 - Khu A',
    },
  });

  await prisma.phong.upsert({
    where: { MaPhong: 'P02' },
    update: {},
    create: {
      MaPhong: 'P02',
      MaKhoa: 'K01',
      TenPhong: 'Buồng Nội Trú 201',
      LoaiPhong: 'NOI_TRU',
      ViTri: 'Tầng 2 - Khu A',
    },
  });

  await prisma.phong.upsert({
    where: { MaPhong: 'P03' },
    update: {},
    create: {
      MaPhong: 'P03',
      MaKhoa: 'K01',
      TenPhong: 'Phòng Xét Nghiệm Trung Tâm',
      LoaiPhong: 'XET_NGHIEM',
      ViTri: 'Tầng 1 - Khu Cận Lâm Sàng',
    },
  });

  await prisma.phong.upsert({
    where: { MaPhong: 'P04' },
    update: {},
    create: {
      MaPhong: 'P04',
      MaKhoa: 'K02',
      TenPhong: 'Buồng Ngoại Trú 301',
      LoaiPhong: 'NOI_TRU',
      ViTri: 'Tầng 3 - Khu B',
    },
  });

  // 3. GIUONG_BENH (BR-V2-11: TrangThai chỉ là tình trạng khai thác SAN_SANG | BAO_TRI | NGUNG_SU_DUNG)
  const beds = [
    { MaGiuong: 'G01', MaPhong: 'P02', SoGiuong: '201-01', LoaiGiuong: 'TIEU_CHUAN', TrangThai: 'SAN_SANG', DonGiaNgay: 350000 },
    { MaGiuong: 'G02', MaPhong: 'P02', SoGiuong: '201-02', LoaiGiuong: 'TIEU_CHUAN', TrangThai: 'SAN_SANG', DonGiaNgay: 350000 },
    { MaGiuong: 'G03', MaPhong: 'P02', SoGiuong: '201-03', LoaiGiuong: 'VIP', TrangThai: 'SAN_SANG', DonGiaNgay: 800000 },
    { MaGiuong: 'G04', MaPhong: 'P04', SoGiuong: '301-01', LoaiGiuong: 'CAP_CUU', TrangThai: 'SAN_SANG', DonGiaNgay: 600000 },
    { MaGiuong: 'G05', MaPhong: 'P04', SoGiuong: '301-02', LoaiGiuong: 'HOI_SUC', TrangThai: 'SAN_SANG', DonGiaNgay: 900000 },
    { MaGiuong: 'G06', MaPhong: 'P04', SoGiuong: '301-03', LoaiGiuong: 'TIEU_CHUAN', TrangThai: 'BAO_TRI', DonGiaNgay: 350000 },
  ];

  for (const b of beds) {
    await prisma.giuongBenh.upsert({
      where: { MaGiuong: b.MaGiuong },
      update: {},
      create: b,
    });
  }

  // 4. NHAN_VIEN & (d, p) Subclasses: BAC_SI, DIEU_DUONG, KY_THUAT_VIEN, + partial (TT01, NV_TN_01, ADMIN01)
  await prisma.nhanVien.upsert({
    where: { MaNV: 'BS01' },
    update: {},
    create: {
      MaNV: 'BS01',
      MaKhoa: 'K01',
      HoTen: 'BS. CKI Trần Văn Nam',
      NgaySinh: new Date('1980-01-15'),
      GioiTinh: 'NAM',
      CCCD: '079080000001',
      DiaChi: '123 Nguyễn Trãi, Quận 5, TP.HCM',
      SoDienThoai: '0908000001',
      NgayVaoLam: new Date('2010-03-01'),
      bacSi: {
        create: {
          ChuyenKhoa: 'Nội khoa',
          TrinhDoHocVan: 'Bác sĩ CKI',
          SoChungChiHanhNghe: 'CCHN_BS_0001',
        },
      },
    },
  });

  await prisma.nhanVien.upsert({
    where: { MaNV: 'BS02' },
    update: {},
    create: {
      MaNV: 'BS02',
      MaKhoa: 'K02',
      HoTen: 'ThS. BS Nguyễn Thị Mai',
      NgaySinh: new Date('1983-05-20'),
      GioiTinh: 'NU',
      CCCD: '079083000002',
      DiaChi: '456 Trần Hưng Đạo, Quận 5, TP.HCM',
      SoDienThoai: '0908000002',
      NgayVaoLam: new Date('2012-07-01'),
      bacSi: {
        create: {
          ChuyenKhoa: 'Ngoại lồng ngực',
          TrinhDoHocVan: 'Thạc sĩ Y khoa',
          SoChungChiHanhNghe: 'CCHN_BS_0002',
        },
      },
    },
  });

  await prisma.nhanVien.upsert({
    where: { MaNV: 'DD01' },
    update: {},
    create: {
      MaNV: 'DD01',
      MaKhoa: 'K01',
      HoTen: 'CN. Lê Thị Lan',
      NgaySinh: new Date('1992-08-10'),
      GioiTinh: 'NU',
      CCCD: '079092000003',
      DiaChi: '789 Võ Văn Kiệt, Quận 1, TP.HCM',
      SoDienThoai: '0908000003',
      NgayVaoLam: new Date('2016-01-15'),
      dieuDuong: {
        create: {
          CapBac: 'Điều dưỡng hạng III',
          ChungChiHanhNghe: 'CCHN_DD_0001',
        },
      },
    },
  });

  await prisma.nhanVien.upsert({
    where: { MaNV: 'KTV01' },
    update: {},
    create: {
      MaNV: 'KTV01',
      MaKhoa: 'K01',
      HoTen: 'CN. Võ Minh Tuấn',
      NgaySinh: new Date('1991-04-22'),
      GioiTinh: 'NAM',
      CCCD: '079091000006',
      DiaChi: '12 Hùng Vương, Quận 5, TP.HCM',
      SoDienThoai: '0908000006',
      NgayVaoLam: new Date('2018-06-01'),
      kyThuatVien: {
        create: {
          ChuyenMonXetNghiem: 'Huyết học & Sinh hóa',
          BTD_ThietBiPhuTrach: 'Máy phân tích huyết học Sysmex XN-1000',
        },
      },
    },
  });

  // Partial staff (outside BAC_SI, DIEU_DUONG, KY_THUAT_VIEN)
  await prisma.nhanVien.upsert({
    where: { MaNV: 'TT01' },
    update: {},
    create: {
      MaNV: 'TT01',
      MaKhoa: 'K01',
      HoTen: 'Nguyễn Ngọc Ánh',
      NgaySinh: new Date('1996-09-12'),
      GioiTinh: 'NU',
      CCCD: '079096000007',
      DiaChi: '55 Lý Thường Kiệt, Quận 10, TP.HCM',
      SoDienThoai: '0908000007',
      NgayVaoLam: new Date('2021-02-01'),
    },
  });

  await prisma.nhanVien.upsert({
    where: { MaNV: 'NV_TN_01' },
    update: {},
    create: {
      MaNV: 'NV_TN_01',
      MaKhoa: 'K01',
      HoTen: 'Phạm Minh Hoàng',
      NgaySinh: new Date('1995-12-05'),
      GioiTinh: 'NAM',
      CCCD: '079095000004',
      DiaChi: '321 Sư Vạn Hạnh, Quận 10, TP.HCM',
      SoDienThoai: '0908000004',
      NgayVaoLam: new Date('2019-04-01'),
    },
  });

  await prisma.nhanVien.upsert({
    where: { MaNV: 'ADMIN01' },
    update: {},
    create: {
      MaNV: 'ADMIN01',
      MaKhoa: 'K01',
      HoTen: 'Quản Trị Viên Hệ Thống',
      NgaySinh: new Date('1988-06-15'),
      GioiTinh: 'NAM',
      CCCD: '079088000005',
      DiaChi: '273 An Dương Vương, Quận 5, TP.HCM',
      SoDienThoai: '0908000005',
      NgayVaoLam: new Date('2020-01-01'),
    },
  });

  // 5. THUOC (Không có SoLuongTon)
  const medicines = [
    {
      MaThuoc: 'TH01',
      TenThuoc: 'Paracetamol 500mg',
      HoatChat: 'Paracetamol',
      HamLuong: '500mg',
      DonViTinh: 'Viên',
      DonGia: 1500,
      HuongDanSD: 'Uống 1 viên khi sốt hoặc đau, cách nhau tối thiểu 4-6 giờ',
    },
    {
      MaThuoc: 'TH02',
      TenThuoc: 'Amoxicillin 500mg',
      HoatChat: 'Amoxicillin',
      HamLuong: '500mg',
      DonViTinh: 'Viên',
      DonGia: 3500,
      HuongDanSD: 'Uống 1 viên x 3 lần/ngày sau bữa ăn',
    },
    {
      MaThuoc: 'TH03',
      TenThuoc: 'Cefixime 200mg',
      HoatChat: 'Cefixime',
      HamLuong: '200mg',
      DonViTinh: 'Viên',
      DonGia: 8500,
      HuongDanSD: 'Uống 1 viên x 2 lần/ngày theo chỉ định bác sĩ',
    },
  ];

  for (const m of medicines) {
    await prisma.thuoc.upsert({
      where: { MaThuoc: m.MaThuoc },
      update: {},
      create: m,
    });
  }

  // 6. LOAI_XET_NGHIEM
  const labTypes = [
    {
      MaLoaiXN: 'XN01',
      TenXN: 'Tổng phân tích tế bào máu ngoại vi (CBC)',
      ChiTieuBinhThuong: 'WBC 4.0-10.0 G/L; RBC 4.0-5.5 T/L; PLT 150-400 G/L',
      DonGia: 80000,
    },
    {
      MaLoaiXN: 'XN02',
      TenXN: 'Sinh hóa máu cơ bản (AST, ALT, Ure, Creatinin)',
      ChiTieuBinhThuong: 'AST < 40 U/L; ALT < 40 U/L; Creatinin 62-106 umol/L',
      DonGia: 120000,
    },
    {
      MaLoaiXN: 'XN03',
      TenXN: 'Tổng phân tích nước tiểu',
      ChiTieuBinhThuong: 'pH 5.0-7.5; Glucose (-); Protein (-)',
      DonGia: 60000,
    },
  ];

  for (const lt of labTypes) {
    await prisma.loaiXetNghiem.upsert({
      where: { MaLoaiXN: lt.MaLoaiXN },
      update: {},
      create: lt,
    });
  }

  // 7. BENH_NHAN & THE_BHYT
  await prisma.benhNhan.upsert({
    where: { MaBN: 'BN01' },
    update: {},
    create: {
      MaBN: 'BN01',
      HoTen: 'Nguyễn Văn An',
      NgaySinh: new Date('1990-04-12'),
      GioiTinh: 'NAM',
      CCCD: '079090123456',
      SDT: '0912345001',
      DiaChi_Duong: '100 Lê Lợi',
      DiaChi_Phuong: 'Phường Bến Nghé',
      DiaChi_Quan: 'Quận 1',
      NhomMau: 'O',
    },
  });

  await prisma.benhNhan.upsert({
    where: { MaBN: 'BN02' },
    update: {},
    create: {
      MaBN: 'BN02',
      HoTen: 'Trần Thị Bình',
      NgaySinh: new Date('1985-11-20'),
      GioiTinh: 'NU',
      CCCD: '079085123457',
      SDT: '0912345002',
      DiaChi_Duong: '45 Nguyễn Văn Cừ',
      DiaChi_Phuong: 'Phường 4',
      DiaChi_Quan: 'Quận 5',
      NhomMau: 'A',
    },
  });

  await prisma.benhNhan.upsert({
    where: { MaBN: 'BN03' },
    update: {},
    create: {
      MaBN: 'BN03',
      HoTen: 'Lê Hoàng Cường',
      NgaySinh: new Date('1975-02-08'),
      GioiTinh: 'NAM',
      CCCD: '079075123458',
      SDT: '0912345003',
      DiaChi_Duong: '200 Điện Biên Phủ',
      DiaChi_Phuong: 'Phường 7',
      DiaChi_Quan: 'Quận 3',
      NhomMau: 'B',
    },
  });

  await prisma.theBHYT.upsert({
    where: { MaTheBHYT: 'DN4790000001' },
    update: {},
    create: {
      MaTheBHYT: 'DN4790000001',
      MaBN: 'BN01',
      MucHuong: 0.8000,
      NgayBatDau: new Date('2026-01-01'),
      NgayHetHan: new Date('2026-12-31'),
    },
  });

  await prisma.theBHYT.upsert({
    where: { MaTheBHYT: 'HS4790000002' },
    update: {},
    create: {
      MaTheBHYT: 'HS4790000002',
      MaBN: 'BN02',
      MucHuong: 0.9500,
      NgayBatDau: new Date('2026-01-01'),
      NgayHetHan: new Date('2026-12-31'),
    },
  });

  // 8. DOT_NOI_TRU & PHAN_GIUONG
  const dot1Exists = await prisma.dotNoiTru.findUnique({ where: { MaDotNT: 'DOT01' } });
  if (!dot1Exists) {
    await prisma.$transaction(async (tx) => {
      await tx.dotNoiTru.create({
        data: {
          MaDotNT: 'DOT01',
          MaBN: 'BN02',
          NgayNhapVien: new Date('2026-11-10'),
          NguoiNhaLienHe: 'Trần Văn Đức (0909888777)',
          TinhTrangNhapVien: 'Viêm phổi cấp cần theo dõi nội trú',
          NgayRaVien: null,
        },
      });
      await tx.phanGiuong.create({
        data: {
          MaDotNT: 'DOT01',
          MaGiuong: 'G01',
          TuNgay: new Date('2026-11-10'),
          DenNgay: null,
        },
      });
    });
  }

  const dot2Exists = await prisma.dotNoiTru.findUnique({ where: { MaDotNT: 'DOT02' } });
  if (!dot2Exists) {
    await prisma.$transaction(async (tx) => {
      await tx.dotNoiTru.create({
        data: {
          MaDotNT: 'DOT02',
          MaBN: 'BN03',
          NgayNhapVien: new Date('2026-10-01'),
          NguoiNhaLienHe: 'Lê Thị Hoa (0909111222)',
          TinhTrangNhapVien: 'Hậu phẫu ruột thừa ổn định',
          NgayRaVien: new Date('2026-10-05'),
        },
      });
      await tx.phanGiuong.create({
        data: {
          MaDotNT: 'DOT02',
          MaGiuong: 'G02',
          TuNgay: new Date('2026-10-01'),
          DenNgay: new Date('2026-10-06'),
        },
      });
    });
  }

  // 9. LUOT_KHAM, DON_THUOC, PHIEU_XET_NGHIEM, VIEN_PHI
  const lk1Exists = await prisma.luotKham.findUnique({ where: { MaLuotKham: 'LK01' } });
  if (!lk1Exists) {
    await prisma.$transaction(async (tx) => {
      await tx.luotKham.create({
        data: {
          MaLuotKham: 'LK01',
          MaBN: 'BN01',
          MaNV_BacSi: 'BS01',
          NgayGioKham: new Date('2026-11-15T08:30:00.000Z'),
          LyDoKham: 'Sốt cao và ho khan 3 ngày',
          TrieuChung: 'Sốt 38.5 độ, đau họng, ho khan',
          ChanDoanSoBo: 'Viêm đường hô hấp trên cấp',
          TrangThai: 'HOAN_TAT',
          MaDotNT: null,
        },
      });

      await tx.donThuoc.create({
        data: {
          MaDonThuoc: 'DT01',
          MaLuotKham: 'LK01',
          NgayKeDon: new Date('2026-11-15'),
          LoiDanCuaBacSi: 'Uống thuốc đúng giờ, tái khám nếu sốt kéo dài',
          chiTietDonThuocs: {
            create: [
              { MaThuoc: 'TH01', SoLuong: 10, LieuDung: '1 viên/lần khi sốt', DonGiaKe: 1500 },
              { MaThuoc: 'TH02', SoLuong: 15, LieuDung: '1 viên x 3 lần/ngày', DonGiaKe: 3500 },
            ],
          },
        },
      });

      await tx.phieuXetNghiem.create({
        data: {
          MaPhieuXN: 'PXN01',
          MaLuotKham: 'LK01',
          MaLoaiXN: 'XN01',
          MaNV_KTV: 'KTV01',
          NgayGioXN: new Date('2026-11-15T08:45:00.000Z'),
          NgayGioTraKQ: new Date('2026-11-15T09:15:00.000Z'),
          KetQua: 'WBC: 11.2 G/L (tăng nhẹ), RBC: 4.8 T/L, PLT: 240 G/L',
          DanhGia: 'Bạch cầu tăng nhẹ phù hợp nhiễm khuẩn hô hấp',
          DonGiaXN: 80000,
        },
      });

      // TongTienThuoc = 10*1500 + 15*3500 = 15000 + 52500 = 67500
      // TongTienDichVu = 80000
      // Total = 147500; BHYT 0.80 => TruBHYT = 118000; ThucThu = 29500
      await tx.vienPhi.create({
        data: {
          MaHoaDon: 'HD01',
          MaLuotKham: 'LK01',
          NgayLap: new Date('2026-11-15'),
          HinhThucThanhToan: 'CHUYEN_KHOAN',
          TruBHYT: 118000,
          TrangThaiThanhToan: 'DA_THANH_TOAN',
        },
      });
    });
  }

  const lk2Exists = await prisma.luotKham.findUnique({ where: { MaLuotKham: 'LK02' } });
  if (!lk2Exists) {
    await prisma.$transaction(async (tx) => {
      await tx.luotKham.create({
        data: {
          MaLuotKham: 'LK02',
          MaBN: 'BN02',
          MaNV_BacSi: 'BS01',
          NgayGioKham: new Date('2026-11-15T09:30:00.000Z'),
          LyDoKham: 'Khám theo dõi nội trú hàng ngày',
          TrieuChung: 'Khó thở nhẹ về đêm, còn ho đờm',
          ChanDoanSoBo: 'Viêm phổi đáp ứng kháng sinh',
          TrangThai: 'CHO_XET_NGHIEM',
          MaDotNT: 'DOT01',
        },
      });

      await tx.phieuXetNghiem.create({
        data: {
          MaPhieuXN: 'PXN02',
          MaLuotKham: 'LK02',
          MaLoaiXN: 'XN02',
          MaNV_KTV: null,
          NgayGioXN: null,
          NgayGioTraKQ: null,
          KetQua: null,
          DanhGia: null,
          DonGiaXN: 120000,
        },
      });
    });
  }

  console.log('✅ Hospital Database v2.0 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
