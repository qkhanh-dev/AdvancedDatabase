import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { TrangThaiGiuongEnum, TrangThaiPhatThuocEnum, TrangThaiTTEnum, CaTrucEnum, TrangThaiDiemDanhEnum, PhuongThucTTEnum } from '@prisma/client';

describe('BỘ KIỂM THỬ SÂU TOÀN DIỆN HỆ THỐNG BACKEND QLBV (DEEP E2E TEST SUITE)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Authentication Tokens
  let doctorToken: string;
  let nurseToken: string;
  let cashierToken: string;

  // Shared state variables across test pipeline
  let createdPatientMaBN: string;
  let createdExamId: string;
  let createdPrescriptionId: string;
  let testMedicineId: string;
  let initialStock: number;
  let assignedServiceTimestamp: string;
  let createdInvoiceId: string;
  const testDutyDate = '2026-11-20';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Replicate main.ts configuration
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter(), new PrismaClientExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ==========================================================================
  // PHÂN HỆ 1: XÁC THỰC VÀ PHÂN QUYỀN RBAC (AUTH & ROLES GUARD)
  // ==========================================================================
  describe('1. Phân hệ Xác thực & Phân quyền RBAC', () => {
    it('1.1. Bác sĩ (BS01) đăng nhập thành công, nhận JWT Token và vai trò BAC_SI', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'BS01', password: '123456' })
        .expect(200);

      doctorToken = res.body.access_token;
      expect(doctorToken).toBeDefined();
      expect(res.body.user.role).toBe('BAC_SI');
    });

    it('1.2. Điều dưỡng (DD01) đăng nhập thành công, nhận vai trò DIEU_DUONG', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'DD01', password: '123456' })
        .expect(200);

      nurseToken = res.body.access_token;
      expect(nurseToken).toBeDefined();
      expect(res.body.user.role).toBe('DIEU_DUONG');
    });

    it('1.3. Thu ngân (NV_TN_01) đăng nhập thành công, nhận vai trò THU_NGAN', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'NV_TN_01', password: '123456' })
        .expect(200);

      cashierToken = res.body.access_token;
      expect(cashierToken).toBeDefined();
      expect(res.body.user.role).toBe('THU_NGAN');
    });

    it('1.4. Đăng nhập với mật khẩu sai -> Trả về lỗi 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'BS01', password: 'wrongpassword123' })
        .expect(401);

      expect(res.body.message).toContain('Thông tin đăng nhập không chính xác');
    });

    it('1.5. Đăng nhập với tài khoản không tồn tại -> Trả về 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'USER_NON_EXIST', password: 'password123' })
        .expect(401);
    });

    it('1.6. Truy cập API bảo vệ /api/auth/profile không có token -> Bị từ chối 401', async () => {
      await request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('1.7. Truy cập /api/auth/profile với Bearer Token hợp lệ -> 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.MaNV).toBe('BS01');
      expect(res.body.LoaiNV).toBe('BAC_SI');
    });

    it('1.8. RBAC Chéo: Điều dưỡng (DD01) gọi API Bác sĩ POST /api/examinations -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maBN: 'BN001',
          maBS: 'BS01',
          maPhongKham: 'P01',
          trieuChung: 'Test',
          chanDoanSoBo: 'Test',
          huongXuTri: 'KE_DON_VE',
        })
        .expect(403);
    });

    it('1.9. RBAC Chéo: Bác sĩ (BS01) gọi API Thu ngân POST /api/billing/invoices -> 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: 'LK001',
          maNVThuNgan: 'NV_TN_01',
          phuongThucTT: 'CHUYEN_KHOAN',
        })
        .expect(403);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 2: CƠ SỞ VẬT CHẤT & KHOA PHÒNG (DEPARTMENT & ROOM)
  // ==========================================================================
  describe('2. Phân hệ Cơ sở vật chất & Khoa phòng', () => {
    it('2.1. GET /api/departments: Lấy danh sách khoa và thông tin Trưởng khoa', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/departments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      const k01 = res.body.find((k: any) => k.MaKhoa === 'K01');
      expect(k01).toBeDefined();
      expect(k01.truongKhoa).toBeDefined();
    });

    it('2.2. GET /api/departments/:maKhoa: Lấy chi tiết khoa hợp lệ', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/departments/K01')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.MaKhoa).toBe('K01');
      expect(res.body.phongs).toBeDefined();
    });

    it('2.3. GET /api/departments/INVALID_KHOA: Bắt lỗi 404 Not Found', async () => {
      await request(app.getHttpServer())
        .get('/api/departments/K99_INVALID')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });

    it('2.4. GET /api/rooms/available: Tra cứu buồng bệnh còn chỗ trống & số giường khả dụng', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/rooms/available?maKhoa=K01')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const room = res.body.find((r: any) => r.MaPhong === 'P02');
      if (room) {
        expect(typeof room.soGiuongConTrong).toBe('number');
      }
    });

    it('2.5. GET /api/beds/map: Sơ đồ trạng thái giường bệnh toàn viện', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/beds/map')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0].MaGiuong).toBeDefined();
      expect(res.body[0].TrangThaiGiuong).toBeDefined();
    });
  });

  // ==========================================================================
  // PHÂN HỆ 3: NHÂN SỰ Y TẾ (STAFF)
  // ==========================================================================
  describe('3. Phân hệ Nhân sự Y tế', () => {
    it('3.1. GET /api/staff: Lấy danh sách toàn bộ cán bộ y tế', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/staff')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(4);
    });

    it('3.2. GET /api/staff/doctors: Lấy danh mục bác sĩ và kiểm tra số CCHN', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/staff/doctors')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const bs01 = res.body.find((b: any) => b.MaNV === 'BS01');
      expect(bs01).toBeDefined();
      expect(bs01.SoCCHN).toBeDefined();
    });

    it('3.3. GET /api/staff/nurses: Lấy danh mục điều dưỡng', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/staff/nurses')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const dd01 = res.body.find((d: any) => d.MaNV === 'DD01');
      expect(dd01).toBeDefined();
      expect(dd01.SoCCHN_DD).toBeDefined();
    });

    it('3.4. GET /api/staff/NV_KHONG_TON_TAI: Trả về 404 Not Found', async () => {
      await request(app.getHttpServer())
        .get('/api/staff/NV_999999')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 4: TIẾP ĐÓN BỆNH NHÂN (PATIENT RECEPTION)
  // ==========================================================================
  describe('4. Phân hệ Tiếp đón Bệnh nhân', () => {
    const testCccd = `079${Date.now().toString().slice(-9)}`;
    const testBhyt = `DN479${Date.now().toString().slice(-10)}`;

    it('4.1. POST /api/patients/reception: Tiếp đón bệnh nhân ngoại trú mới thành công', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/patients/reception')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          hoTen: 'Le Van Test E2E',
          ngaySinh: '1995-06-15',
          gioiTinh: 'NAM',
          cccd: testCccd,
          soDienThoai: '0988776655',
          soBHYT: testBhyt,
          mucHuongBHYT: 80,
          diaChi: 'Quan 5, TP.HCM',
          nhomMau: 'O',
          isNgoaiTru: true,
        })
        .expect(201);

      createdPatientMaBN = res.body.MaBN;
      expect(createdPatientMaBN).toBeDefined();
      expect(res.body.HoTen).toBe('Le Van Test E2E');
      expect(res.body.bnNgoaiTru).toBeDefined();
      expect(res.body.bnNgoaiTru.SoSoKhamBenh).toBeDefined();
    });

    it('4.2. Ràng buộc duy nhất CCCD (MUT04): Đăng ký lại cùng CCCD -> 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/patients/reception')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          hoTen: 'Người Trùng CCCD',
          ngaySinh: '1990-01-01',
          gioiTinh: 'NAM',
          cccd: testCccd,
          diaChi: 'TP.HCM',
        })
        .expect(400);

      expect(res.body.message).toContain('đã tồn tại trong hệ thống');
    });

    it('4.3. Ràng buộc duy nhất SoBHYT: Đăng ký lại cùng số thẻ BHYT -> 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/patients/reception')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          hoTen: 'Người Trùng BHYT',
          ngaySinh: '1990-01-01',
          gioiTinh: 'NAM',
          cccd: `079${Date.now().toString().slice(-9)}`,
          soBHYT: testBhyt,
          diaChi: 'TP.HCM',
        })
        .expect(400);

      expect(res.body.message).toContain('đã tồn tại trong hệ thống');
    });

    it('4.4. GET /api/patients/lookup: Tra cứu bệnh nhân theo mã MaBN', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/patients/lookup?q=${createdPatientMaBN}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.MaBN).toBe(createdPatientMaBN);
      expect(res.body.HoTen).toBe('Le Van Test E2E');
    });

    it('4.5. GET /api/patients/lookup: Tra cứu bệnh nhân theo CCCD', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/patients/lookup?q=${testCccd}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.MaBN).toBe(createdPatientMaBN);
    });

    it('4.6. GET /api/patients: Danh sách phân trang bệnh nhân', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/patients?page=1&limit=5')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 5: KHÁM BỆNH & CHẨN ĐOÁN LÂM SÀNG (EXAMINATION WORKFLOW)
  // ==========================================================================
  describe('5. Phân hệ Khám bệnh & Chẩn đoán Lâm sàng', () => {
    it('5.1. Bác sĩ (BS01) khởi tạo lượt khám lâm sàng tại phòng KHAM (P01)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          maBS: 'BS01',
          maPhongKham: 'P01',
          trieuChung: 'Sot cao, dau dau, ho khan 3 ngay',
          huyetAp: '120/80',
          nhietDo: 38.5,
          mach: 85,
          chanDoanSoBo: 'Theo doi Viem hong cap / Sot sieu vi',
          huongXuTri: 'KE_DON_VE',
        })
        .expect(201);

      createdExamId = res.body.MaLuotKham;
      expect(createdExamId).toBeDefined();
      expect(res.body.MaBN).toBe(createdPatientMaBN);
      expect(res.body.MaBS).toBe('BS01');
    });

    it('5.2. Ràng buộc C02 (MUT09): Tạo lượt khám tại phòng NOI_TRU (P02) -> Bị từ chối 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          maBS: 'BS01',
          maPhongKham: 'P02', // P02 is NOI_TRU
          trieuChung: 'Test',
          chanDoanSoBo: 'Test',
          huongXuTri: 'KE_DON_VE',
        })
        .expect(400);

      expect(res.body.message).toContain('Phải là phòng có loại KHAM');
    });

    it('5.3. Ràng buộc C03 (MUT10): Gán điều dưỡng (DD01) làm bác sĩ khám -> Bị từ chối 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN || 'BN001',
          maBS: 'DD01', // DD01 is DIEU_DUONG
          maPhongKham: 'P01',
          trieuChung: 'Test',
          chanDoanSoBo: 'Test',
          huongXuTri: 'KE_DON_VE',
        })
        .expect(400);

      expect(res.body.message).toContain('không tồn tại trong danh mục Bác sĩ điều trị');
    });

    it('5.4. PATCH /api/examinations/:id/diagnose: Cập nhật chẩn đoán xác định và hẹn tái khám', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/examinations/${createdExamId}/diagnose`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          chanDoanXacDinh: 'Viem phe quan cap J20',
          huongXuTri: 'KE_DON_VE',
          ngayTaiKham: '2026-11-21',
        })
        .expect(200);

      expect(res.body.ChanDoanXacDinh).toBe('Viem phe quan cap J20');
      expect(res.body.HuongXuTri).toBe('KE_DON_VE');
    });

    it('5.5. GET /api/examinations/:id: Lấy chi tiết lượt khám đầy đủ quan hệ', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/examinations/${createdExamId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.MaLuotKham).toBe(createdExamId);
      expect(res.body.benhNhan).toBeDefined();
      expect(res.body.bacSi).toBeDefined();
    });
  });

  // ==========================================================================
  // PHÂN HỆ 6: CẬN LÂM SÀNG & DỊCH VỤ KỸ THUẬT (CLINICAL SERVICES)
  // ==========================================================================
  describe('6. Phân hệ Cận lâm sàng & Dịch vụ Kỹ thuật', () => {
    it('6.1. GET /api/services: Danh mục dịch vụ kỹ thuật y tế', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/services')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('6.2. POST /api/services/assign: Bác sĩ chỉ định dịch vụ CBC (DV01) cho lượt khám', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/services/assign')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: createdExamId,
          maDV: 'DV01',
          soLuong: 1,
        })
        .expect(201);

      expect(res.body.MaLuotKham).toBe(createdExamId);
      expect(res.body.MaDV).toBe('DV01');
      expect(Number(res.body.DonGiaDV)).toBe(80000);
      assignedServiceTimestamp = res.body.ThoiGianChiDinh;
      expect(assignedServiceTimestamp).toBeDefined();
    });

    it('6.3. GET /api/services/pending: Điều dưỡng tra cứu dịch vụ chờ thực hiện (KetQuaCLS null)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/services/pending')
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const pendingItem = res.body.find(
        (s: any) => s.MaLuotKham === createdExamId && s.MaDV === 'DV01',
      );
      expect(pendingItem).toBeDefined();
    });

    it('6.4. Ràng buộc KTV (P02 / C03): Nhân viên thu ngân (NV_TN_01) cập nhật kết quả -> Bị từ chối 400', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/services/result')
        .set('Authorization', `Bearer ${nurseToken}`) // Nurse executes, but passes cashier ID
        .send({
          maLuotKham: createdExamId,
          maDV: 'DV01',
          thoiGianChiDinh: assignedServiceTimestamp,
          ketQuaCLS: 'Bạch cầu tăng nhẹ',
          maKTVThucHien: 'NV_TN_01', // Cashier, not nurse!
        })
        .expect(400);

      expect(res.body.message).toContain('không hợp lệ');
    });

    it('6.5. PATCH /api/services/result: Điều dưỡng (DD01) cập nhật kết quả xét nghiệm thành công', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/services/result')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maLuotKham: createdExamId,
          maDV: 'DV01',
          thoiGianChiDinh: assignedServiceTimestamp,
          ketQuaCLS: 'WBC: 11.5 G/L (tang nhe), RBC: 4.8 T/L, HGB: 140 g/L',
          maKTVThucHien: 'DD01',
        })
        .expect(200);

      expect(res.body.KetQuaCLS).toContain('WBC: 11.5');
      expect(res.body.MaKTVThucHien).toBe('DD01');
    });
  });

  // ==========================================================================
  // PHÂN HỆ 7: TOA THUỐC & TRỪ TỒN KHO NGUYÊN TỬ (PRESCRIPTION & ATOMIC INVENTORY)
  // ==========================================================================
  describe('7. Phân hệ Toa thuốc & Trừ Tồn Kho Nguyên Tử (BR04)', () => {
    beforeAll(async () => {
      const med = await prisma.thuoc.findUnique({ where: { MaThuoc: 'TH01' } });
      testMedicineId = 'TH01';
      initialStock = med!.SoLuongTon;
    });

    it('7.1. GET /api/prescriptions/medicines: Tra cứu danh mục thuốc và số lượng tồn kho', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/prescriptions/medicines')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const th01 = res.body.find((t: any) => t.MaThuoc === 'TH01');
      expect(th01).toBeDefined();
      expect(th01.SoLuongTon).toBeGreaterThan(0);
    });

    it('7.2. Kiểm tra tồn kho tức thời (BR04): Kê đơn với số lượng vượt quá tồn kho -> 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: createdExamId,
          items: [
            {
              maThuoc: 'TH01',
              soLuong: 999999, // Impossible stock
              lieuDung: '1 vien/lan',
              cachDung: 'Uong sau an',
              soNgayUong: 7,
            },
          ],
        })
        .expect(400);

      expect(res.body.message).toContain('không đủ tồn kho');
    });

    it('7.3. POST /api/prescriptions: Bác sĩ kê toa thuốc hợp lệ (10 viên TH01 + 14 viên TH02)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: createdExamId,
          loiDanBacSi: 'Uong nhieu nuoc am, nghi ngoi',
          items: [
            {
              maThuoc: 'TH01',
              soLuong: 10,
              lieuDung: '1 vien/lan x 2 lan/ngay',
              cachDung: 'Uong khi sot tren 38.5C',
              soNgayUong: 5,
            },
            {
              maThuoc: 'TH02',
              soLuong: 14,
              lieuDung: '1 vien/lan x 2 lan/ngay',
              cachDung: 'Uong sau an',
              soNgayUong: 7,
            },
          ],
        })
        .expect(201);

      createdPrescriptionId = res.body.MaDon;
      expect(createdPrescriptionId).toBeDefined();
      expect(res.body.TrangThaiPhatThuoc).toBe(TrangThaiPhatThuocEnum.CHUA_PHAT);
      expect(res.body.ctDonThuocs.length).toBe(2);
      expect(Number(res.body.ctDonThuocs[0].DonGiaBan)).toBe(1500); // Snapshot price
    });

    it('7.4. Kê đơn lần 2 cho cùng một lượt khám -> Bị từ chối 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: createdExamId,
          items: [
            {
              maThuoc: 'TH01',
              soLuong: 5,
              soNgayUong: 3,
              lieuDung: '1 vien/lan',
              cachDung: 'Uong sau an',
            },
          ],
        })
        .expect(400);

      expect(res.body.message).toContain('đã được kê toa thuốc trước đó');
    });

    it('7.5. PATCH /api/prescriptions/:id/dispense: Phát thuốc & Trừ tồn kho nguyên tử (BR04)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/prescriptions/${createdPrescriptionId}/dispense`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);

      expect(res.body.TrangThaiPhatThuoc).toBe(TrangThaiPhatThuocEnum.DA_PHAT);

      // Verify stock was deducted in database
      const updatedMed = await prisma.thuoc.findUnique({ where: { MaThuoc: 'TH01' } });
      expect(updatedMed!.SoLuongTon).toBe(initialStock - 10);
    });

    it('7.6. Thử phát lại toa thuốc đã phát -> Bị từ chối 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/prescriptions/${createdPrescriptionId}/dispense`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(400);

      expect(res.body.message).toContain('đã được cấp phát trước đó');
    });
  });

  // ==========================================================================
  // PHÂN HỆ 8: ĐIỀU TRỊ NỘI TRÚ & PHÂN GIƯỜNG (INPATIENT & ANTI-DOUBLE-BED BR02)
  // ==========================================================================
  describe('8. Phân hệ Quản lý Nội trú & Phân giường (BR02)', () => {
    let secondInpatientMaBN: string;

    beforeAll(async () => {
      // Clean up previous test bed allocations so tests are fully isolated
      await prisma.phanGiuong.deleteMany({
        where: {
          MaGiuong: { in: ['G01', 'G02'] },
        },
      });
      await prisma.giuongBenh.updateMany({
        where: { MaGiuong: { in: ['G01', 'G02'] } },
        data: { TrangThaiGiuong: TrangThaiGiuongEnum.TRONG },
      });

      // Create second patient for anti-double bed contention test
      const res = await request(app.getHttpServer())
        .post('/api/patients/reception')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          hoTen: 'Benh Nhan Thu 2 E2E',
          ngaySinh: '1992-04-10',
          gioiTinh: 'NU',
          cccd: `079${Date.now().toString().slice(-9)}_2`,
          diaChi: 'Quan 1, TP.HCM',
        });
      secondInpatientMaBN = res.body.MaBN;
    });

    it('8.1. POST /api/inpatient/admit: Nhập viện nội trú cho bệnh nhân', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inpatient/admit')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          chanDoanNhapVien: 'Viem phoi thuy can theo doi noi tru',
          tinhTrangNhapVien: 'Vua',
          maBSTheoDoi: 'BS01',
          ngayXuatVienDuKien: '2026-11-25',
        })
        .expect(201);

      expect(res.body.MaBN).toBe(createdPatientMaBN);
      expect(res.body.SoHoSoBenhAn).toBeDefined();

      // Verify flag CoNoiTru set to true
      const patient = await prisma.benhNhan.findUnique({ where: { MaBN: createdPatientMaBN } });
      expect(patient!.CoNoiTru).toBe(true);
    });

    it('8.2. Nhập viện lần 2 cho bệnh nhân đã có hồ sơ nội trú -> Bị từ chối 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inpatient/admit')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          chanDoanNhapVien: 'Test',
          tinhTrangNhapVien: 'Nhe',
          maBSTheoDoi: 'BS01',
        })
        .expect(400);

      expect(res.body.message).toContain('đã có hồ sơ bệnh án nội trú');
    });

    it('8.3. Ràng buộc C10: Bệnh nhân chưa làm thủ tục nội trú cố tình phân giường -> 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inpatient/assign-bed')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: secondInpatientMaBN, // Has not been admitted yet!
          maGiuong: 'G01',
        })
        .expect(400);

      expect(res.body.message).toContain('chưa làm thủ tục nhập viện nội trú');
    });

    it('8.4. POST /api/inpatient/assign-bed: Phân bổ giường G01 thành công (Trạng thái -> DANG_SU_DUNG)', async () => {
      // Ensure G01 is TRONG
      await prisma.giuongBenh.update({
        where: { MaGiuong: 'G01' },
        data: { TrangThaiGiuong: TrangThaiGiuongEnum.TRONG },
      });

      const res = await request(app.getHttpServer())
        .post('/api/inpatient/assign-bed')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          maGiuong: 'G01',
          ghiChu: 'Phan buong benh khoa Noi',
        })
        .expect(201);

      expect(res.body.MaBN).toBe(createdPatientMaBN);
      expect(res.body.MaGiuong).toBe('G01');

      // Verify bed status updated in DB
      const bed = await prisma.giuongBenh.findUnique({ where: { MaGiuong: 'G01' } });
      expect(bed!.TrangThaiGiuong).toBe(TrangThaiGiuongEnum.DANG_SU_DUNG);
    });

    it('8.5. Thuật toán chống trùng giường BR02 (MUT11): Phân giường G01 đang có người nằm cho BN khác -> 400', async () => {
      // Admit second patient first
      await request(app.getHttpServer())
        .post('/api/inpatient/admit')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: secondInpatientMaBN,
          chanDoanNhapVien: 'Theo doi ruot thua',
          tinhTrangNhapVien: 'Vua',
          maBSTheoDoi: 'BS02',
        });

      // Try assigning occupied bed G01
      const res = await request(app.getHttpServer())
        .post('/api/inpatient/assign-bed')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: secondInpatientMaBN,
          maGiuong: 'G01',
        })
        .expect(400);

      expect(res.body.message).toContain('đang có bệnh nhân khác nằm');
    });

    it('8.6. POST /api/inpatient/transfer-bed: Chuyển bệnh nhân từ G01 sang G02 (G01 -> BAO_TRI, G02 -> DANG_SU_DUNG)', async () => {
      // Ensure G02 is TRONG
      await prisma.giuongBenh.update({
        where: { MaGiuong: 'G02' },
        data: { TrangThaiGiuong: TrangThaiGiuongEnum.TRONG },
      });

      const res = await request(app.getHttpServer())
        .post('/api/inpatient/transfer-bed')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maBN: createdPatientMaBN,
          maGiuongMoi: 'G02',
          lyDoChuyen: 'Chuyen sang phong VIP theo yeu cau',
        })
        .expect(201);

      expect(res.body.MaGiuong).toBe('G02');

      // Check DB states
      const oldBed = await prisma.giuongBenh.findUnique({ where: { MaGiuong: 'G01' } });
      const newBed = await prisma.giuongBenh.findUnique({ where: { MaGiuong: 'G02' } });

      expect(oldBed!.TrangThaiGiuong).toBe(TrangThaiGiuongEnum.BAO_TRI);
      expect(newBed!.TrangThaiGiuong).toBe(TrangThaiGiuongEnum.DANG_SU_DUNG);
    });

    it('8.7. GET /api/inpatient/patients: Lấy danh sách bệnh nhân đang nằm viện', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inpatient/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 9: THU NGÂN, TÍNH TOÁN VIỆN PHÍ & CỔNG VIETQR (BR03, BR06)
  // ==========================================================================
  describe('9. Phân hệ Quyết toán Viện phí, BHYT & Cổng VietQR (BR03, BR06)', () => {
    it('9.1. POST /api/billing/calculate/:examId: Tính chi phí tự động và khấu trừ BHYT (BR03)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/billing/calculate/${createdExamId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(res.body.maLuotKham).toBe(createdExamId);
      expect(res.body.chiTiet.tienKham).toBe(50000);
      expect(res.body.chiTiet.tienDichVu).toBe(80000); // DV01 (CBC)
      expect(res.body.chiTiet.tienThuoc).toBe(10 * 1500 + 14 * 3500); // 15000 + 49000 = 64000
      expect(res.body.tongTienGoc).toBeGreaterThan(0);

      // BHYT 80% on TienKham + TienDichVuBHYT = (50000 + 80000) * 0.8 = 104000
      expect(res.body.tienBHYTChiTra).toBe(104000);
      expect(res.body.tienBenhNhanTra).toBe(res.body.tongTienGoc - res.body.tienBHYTChiTra);
    });

    it('9.2. POST /api/billing/invoices: Thu ngân (NV_TN_01) lập hóa đơn viện phí (Trạng thái CHUA_THANH_TOAN)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          maLuotKham: createdExamId,
          maNVThuNgan: 'NV_TN_01',
          phuongThucTT: PhuongThucTTEnum.CHUYEN_KHOAN,
        })
        .expect(201);

      createdInvoiceId = res.body.MaHD;
      expect(createdInvoiceId).toBeDefined();
      expect(res.body.TrangThaiTT).toBe(TrangThaiTTEnum.CHUA_THANH_TOAN);
      expect(Number(res.body.TienBHYTChiTra)).toBe(104000);
    });

    it('9.3. Lập hóa đơn lần 2 cho cùng một lượt khám -> Bị từ chối 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          maLuotKham: createdExamId,
          maNVThuNgan: 'NV_TN_01',
          phuongThucTT: PhuongThucTTEnum.TIEN_MAT,
        })
        .expect(400);

      expect(res.body.message).toContain('đã được lập hóa đơn');
    });

    it('9.4. POST /api/billing/webhook/vietqr: Gạch nợ tự động qua Webhook VietQR (CHUA_THANH_TOAN -> DA_THANH_TOAN)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/billing/webhook/vietqr')
        .send({
          maHD: createdInvoiceId,
          amount: 100000,
          transactionId: `TXN_${Date.now()}`,
          signature: 'HMAC_TEST_SIG',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.trangThai).toBe(TrangThaiTTEnum.DA_THANH_TOAN);

      // Verify in DB
      const invoice = await prisma.hoaDon.findUnique({ where: { MaHD: createdInvoiceId } });
      expect(invoice!.TrangThaiTT).toBe(TrangThaiTTEnum.DA_THANH_TOAN);
    });

    it('9.5. Tính Idempotency trong thanh toán (BR06): Gửi lại Webhook lần 2 -> Trả về 200/201 OK mà không cộng trùng', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/billing/webhook/vietqr')
        .send({
          maHD: createdInvoiceId,
          amount: 100000,
          transactionId: 'TXN_DUPLICATE',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Idempotent response');
    });

    it('9.6. GET /api/billing/invoices/:id/pdf: Xuất hóa đơn viện phí định dạng PDF stream', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/billing/invoices/${createdInvoiceId}/pdf`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(res.header['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
      // PDF magic number check
      expect(res.body.toString('utf-8', 0, 4)).toBe('%PDF');
    });

    it('9.7. GET /api/billing/invoices/:id: Tra cứu thông tin chi tiết hóa đơn', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/billing/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(res.body.MaHD).toBe(createdInvoiceId);
      expect(res.body.TrangThaiTT).toBe(TrangThaiTTEnum.DA_THANH_TOAN);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 10: LỊCH TRỰC & CHỐNG TRÙNG CA TRỰC (DUTY SCHEDULE BR05)
  // ==========================================================================
  describe('10. Phân hệ Lịch trực & Chống trùng ca trực (BR05)', () => {
    beforeAll(async () => {
      await prisma.lichTruc.deleteMany({
        where: {
          MaNV: 'BS01',
          NgayTruc: new Date(testDutyDate),
        },
      });
    });

    it('10.1. POST /api/duty-schedules: Phân công ca trực SÁNG cho Bác sĩ BS01', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/duty-schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maNV: 'BS01',
          ngayTruc: testDutyDate,
          caTruc: CaTrucEnum.SANG,
          maPhong: 'P01',
          vaiTroTruc: 'Bac si truc kham chinh',
        })
        .expect(201);

      expect(res.body.MaNV).toBe('BS01');
      expect(res.body.CaTruc).toBe(CaTrucEnum.SANG);
      expect(res.body.TrangThaiDiemDanh).toBe(TrangThaiDiemDanhEnum.CHUA_DIEM_DANH);
    });

    it('10.2. Chống trùng ca trực BR05 (Khóa chính composite MaNV + NgayTruc + CaTruc) -> Bị từ chối 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/duty-schedules')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maNV: 'BS01',
          ngayTruc: testDutyDate,
          caTruc: CaTrucEnum.SANG, // Duplicate shift
          maPhong: 'P02',
          vaiTroTruc: 'Truc noi tru',
        })
        .expect(400);

      expect(res.body.message).toContain('Chống trùng ca trực BR05');
    });

    it('10.3. GET /api/duty-schedules: Tra cứu lịch trực y bác sĩ theo ngày', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/duty-schedules?startDate=${testDutyDate}&endDate=${testDutyDate}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const schedule = res.body.find((s: any) => s.MaNV === 'BS01');
      expect(schedule).toBeDefined();
    });

    it('10.4. PATCH /api/duty-schedules/attendance: Điểm danh ca trực thành công (CO_MAT)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/duty-schedules/attendance?maNV=BS01&ngayTruc=${testDutyDate}&caTruc=${CaTrucEnum.SANG}&status=${TrangThaiDiemDanhEnum.CO_MAT}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.TrangThaiDiemDanh).toBe(TrangThaiDiemDanhEnum.CO_MAT);
    });
  });

  // ==========================================================================
  // PHÂN HỆ 11: BÁO CÁO & DASHBOARD THỐNG KÊ (REPORTS & ANALYTICS)
  // ==========================================================================
  describe('11. Phân hệ Báo cáo & Dashboard Thống kê', () => {
    it('11.1. GET /api/reports/dashboard: Lấy số liệu thống kê tổng hợp toàn viện', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.overview).toBeDefined();
      expect(res.body.overview.totalPatients).toBeGreaterThanOrEqual(1);
      expect(res.body.overview.totalDoctors).toBeGreaterThanOrEqual(2);
      expect(res.body.overview.totalBeds).toBeGreaterThanOrEqual(2);
      expect(res.body.overview.bedOccupancyRate).toBeDefined();

      expect(res.body.revenue).toBeDefined();
      expect(typeof res.body.revenue.tongDoanhThu).toBe('number');
      expect(typeof res.body.revenue.tongBHYTChiTra).toBe('number');
      expect(typeof res.body.revenue.tongBenhNhanThanhToan).toBe('number');
      expect(res.body.revenue.soHoaDonDaThu).toBeGreaterThanOrEqual(1);
    });
  });
});
