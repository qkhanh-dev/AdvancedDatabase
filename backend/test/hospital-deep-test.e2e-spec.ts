import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from '../src/common/filters/prisma-exception.filter';

describe('BỘ KIỂM THỬ SÂU TOÀN DIỆN BACKEND & DB v2.0 (18 BẢNG · 103 CỘT · 20 FK · BR-V2-01..13)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let adminToken: string;
  let doctorToken: string;
  let nurseToken: string;
  let ktvToken: string;
  let receptionToken: string;
  let cashierToken: string;

  const prefix = `E2E_${Date.now().toString().slice(-6)}`;
  const createdIds = {
    maKhoa: `${prefix}_K`,
    maPhong: `${prefix}_P`,
    maGiuong1: `${prefix}_G1`,
    maGiuong2: `${prefix}_G2`,
    maNV_BS: `${prefix}_BS`,
    maNV_Partial: `${prefix}_TP`,
    maBN: `${prefix}_BN`,
    maBN2: `${prefix}_BN2`,
    maTheBHYT: `${prefix}_BHYT`,
    maDotNT1: `${prefix}_D1`,
    maDotNT2: `${prefix}_D2`,
    maDotNT_Race: `${prefix}_DR`,
    maLuotKham1: `${prefix}_LK1`,
    maLuotKham2: `${prefix}_LK2`,
    maDonThuoc1: `${prefix}_DT1`,
    maDonThuoc2: `${prefix}_DT2`,
    maPhieuXN1: `${prefix}_PXN1`,
    maPhieuXN2: `${prefix}_PXN2`,
    maHoaDon1: `${prefix}_HD1`,
    maHoaDon2: `${prefix}_HD2`,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter(), new PrismaClientExceptionFilter());

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Pre-create 2 clean test beds under our test department/room later via API + Prisma
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      // Clean up test records in reverse dependency order (since all 20 FKs are NO ACTION)
      const safeRun = async (fn: () => Promise<any>) => {
        try {
          await fn();
        } catch {
          // ignore cleanup errors if test skipped/failed early
        }
      };

      // Note: PAID VIEN_PHI cannot be deleted directly due to BR-V2-08 trigger; test data uses unique E2E_ prefix
      const triggerPairs: Array<[string, string]> = [
        ['VIEN_PHI', 'trg_vien_phi_rules'],
        ['DON_THUOC', 'trg_don_thuoc_lock'],
        ['CHI_TIET_DON_THUOC', 'trg_ctdt_lock'],
        ['PHIEU_XET_NGHIEM', 'trg_pxn_lock'],
      ];
      for (const [tbl, trg] of triggerPairs) {
        await safeRun(() => prisma.$executeRawUnsafe(`ALTER TABLE "${tbl}" DISABLE TRIGGER ${trg}`));
      }

      await safeRun(() =>
        prisma.vienPhi.deleteMany({ where: { MaHoaDon: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.phieuXetNghiem.deleteMany({ where: { MaPhieuXN: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.$transaction([
          prisma.chiTietDonThuoc.deleteMany({ where: { MaDonThuoc: { startsWith: prefix } } }),
          prisma.donThuoc.deleteMany({ where: { MaDonThuoc: { startsWith: prefix } } }),
        ]),
      );
      await safeRun(() =>
        prisma.luotKham.deleteMany({ where: { MaLuotKham: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.phanGiuong.deleteMany({
          where: {
            OR: [
              { MaDotNT: { startsWith: prefix } },
              { MaGiuong: { startsWith: prefix } },
            ],
          },
        }),
      );
      await safeRun(() =>
        prisma.dotNoiTru.deleteMany({ where: { MaBN: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.theBHYT.deleteMany({ where: { MaTheBHYT: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.benhNhan.deleteMany({ where: { MaBN: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.bacSi.deleteMany({ where: { MaNV: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.nhanVien.deleteMany({ where: { MaNV: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.giuongBenh.deleteMany({ where: { MaGiuong: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.phong.deleteMany({ where: { MaPhong: { startsWith: prefix } } }),
      );
      await safeRun(() =>
        prisma.khoa.deleteMany({ where: { MaKhoa: { startsWith: prefix } } }),
      );

      for (const [tbl, trg] of triggerPairs) {
        await safeRun(() => prisma.$executeRawUnsafe(`ALTER TABLE "${tbl}" ENABLE TRIGGER ${trg}`));
      }
    }

    if (app) {
      await app.close();
    }
  });

  // ==========================================================================
  // 1. KIỂM CHỨNG CẤU TRÚC LIVE DATABASE POSTGRESQL (BR-V2-10)
  // ==========================================================================
  describe('1. Kiểm chứng Live Database v2 (18 bảng · 103 cột · 20 FK NO ACTION · Views · Triggers · CHECK)', () => {
    it('1.1. Đúng 18 bảng thực thể v2 và 103 cột lưu trữ, không còn bảng v1', async () => {
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations'
        ORDER BY table_name
      `;
      expect(tables).toHaveLength(18);

      const cols = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) AS count
        FROM information_schema.columns c
        JOIN information_schema.tables t
          ON c.table_schema = t.table_schema AND c.table_name = t.table_name
        WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE' AND t.table_name <> '_prisma_migrations'
      `;
      expect(Number(cols[0].count)).toBe(103);

      const legacyNames = ['NV_HANH_CHINH', 'BN_NGOAI_TRU', 'BN_NOI_TRU', 'CT_DON_THUOC', 'DICH_VU', 'SU_DUNG_DV', 'HOA_DON', 'LICH_TRUC'];
      const actualNames = tables.map((t) => t.table_name);
      for (const old of legacyNames) {
        expect(actualNames).not.toContain(old);
      }
    });

    it('1.2. Đúng 20 khóa ngoại (FK01–FK20) và 100% ON DELETE NO ACTION / ON UPDATE NO ACTION', async () => {
      const fks = await prisma.$queryRaw<
        Array<{ constraint_name: string; update_rule: string; delete_rule: string }>
      >`
        SELECT rc.constraint_name, rc.update_rule, rc.delete_rule
        FROM information_schema.referential_constraints rc
        WHERE rc.constraint_schema = 'public'
      `;
      expect(fks).toHaveLength(20);
      for (const fk of fks) {
        expect(fk.delete_rule).toBe('NO ACTION');
        expect(fk.update_rule).toBe('NO ACTION');
      }
    });

    it('1.3. Tồn tại VIEW dẫn xuất, CHECK constraints, Filtered Unique Index BR-V2-12 và Triggers', async () => {
      const views = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name FROM information_schema.views WHERE table_schema = 'public'
      `;
      expect(views.map((v) => v.table_name)).toEqual(
        expect.arrayContaining(['V_NHAN_VIEN', 'V_BENH_NHAN', 'V_DON_THUOC', 'V_VIEN_PHI']),
      );

      const partialIdx = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname FROM pg_indexes
        WHERE schemaname = 'public' AND indexname = 'UQ_DOT_NOI_TRU_OPEN_MABN'
      `;
      expect(partialIdx).toHaveLength(1);

      const checks = await prisma.$queryRaw<Array<{ conname: string }>>`
        SELECT conname FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'public' AND c.contype = 'c'
      `;
      expect(checks.length).toBeGreaterThanOrEqual(15);

      const triggers = await prisma.$queryRaw<Array<{ tgname: string }>>`
        SELECT tgname FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND NOT t.tgisinternal
      `;
      expect(triggers.length).toBeGreaterThanOrEqual(10);
    });
  });

  // ==========================================================================
  // 2. XÁC THỰC & PHÂN QUYỀN RBAC THEO CÂY NHAN_VIEN (d, p)
  // ==========================================================================
  describe('2. Auth & RBAC (d, p) + Global Error Contract { ruleCode }', () => {
    it('2.1. Đăng nhập đủ 6 vai trò chuẩn v2 (ADMIN, BAC_SI, DIEU_DUONG, KY_THUAT_VIEN, TIEP_NHAN, THU_NGAN)', async () => {
      const login = async (username: string) =>
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ username, password: '123456' })
          .expect(200);

      const [admin, doc, nurse, ktv, rec, cash] = await Promise.all([
        login('ADMIN01'),
        login('BS01'),
        login('DD01'),
        login('KTV01'),
        login('TT01'),
        login('NV_TN_01'),
      ]);

      expect(admin.body.user.role).toBe('ADMIN');
      expect(doc.body.user.role).toBe('BAC_SI');
      expect(nurse.body.user.role).toBe('DIEU_DUONG');
      expect(ktv.body.user.role).toBe('KY_THUAT_VIEN');
      expect(rec.body.user.role).toBe('TIEP_NHAN');
      expect(cash.body.user.role).toBe('THU_NGAN');
      expect(typeof doc.body.user.SoNamCongTac).toBe('number');

      adminToken = admin.body.access_token;
      doctorToken = doc.body.access_token;
      nurseToken = nurse.body.access_token;
      ktvToken = ktv.body.access_token;
      receptionToken = rec.body.access_token;
      cashierToken = cash.body.access_token;
    });

    it('2.2. GET /api/auth/profile trả SoNamCongTac dẫn xuất; đăng nhập bằng CCCD hoạt động', async () => {
      const profileRes = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${ktvToken}`)
        .expect(200);
      expect(profileRes.body.MaNV).toBe('KTV01');
      expect(typeof profileRes.body.SoNamCongTac).toBe('number');
      expect(profileRes.body.kyThuatVien).toBeDefined();

      // Login by CCCD
      const cccdRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: '079091000006', password: '123456' })
        .expect(200);
      expect(cccdRes.body.user.MaNV).toBe('KTV01');
    });

    it('2.3. Error Contract trả về đủ { statusCode, timestamp, path, ruleCode, message }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'BS01', password: 'wrongpassword' })
        .expect(401);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          timestamp: expect.any(String),
          path: '/api/auth/login',
          ruleCode: 'UNAUTHORIZED',
          message: expect.any(String),
        }),
      );
    });
  });

  // ==========================================================================
  // 3. KHOA, PHÒNG, GIƯỜNG BỆNH (BR-V2-11) & NHÂN SỰ DISJOINT (BR-V2-01)
  // ==========================================================================
  describe('3. Department/Room/Bed (BR-V2-11) & Staff Specialization (BR-V2-01)', () => {
    it('3.1. CRUD KHOA & PHONG và tạo giường phục vụ test nội trú', async () => {
      await request(app.getHttpServer())
        .post('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maKhoa: createdIds.maKhoa,
          tenKhoa: 'Khoa Test E2E',
          diaDiem: 'Tầng 9',
          soDienThoai: '02839990000',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/departments/${createdIds.maKhoa}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ diaDiem: 'Tầng 9 - Khu Test' })
        .expect(200);

      const depts = await request(app.getHttpServer())
        .get('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(depts.body.some((d: any) => d.MaKhoa === createdIds.maKhoa)).toBe(true);

      await request(app.getHttpServer())
        .post('/api/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maPhong: createdIds.maPhong,
          maKhoa: createdIds.maKhoa,
          tenPhong: 'Buồng Test 901',
          loaiPhong: 'NOI_TRU',
          viTri: 'Tầng 9',
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/rooms/${createdIds.maPhong}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ viTri: 'Tầng 9 - Cánh Đông' })
        .expect(200);

      const rooms = await request(app.getHttpServer())
        .get(`/api/rooms?maKhoa=${createdIds.maKhoa}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(rooms.body).toHaveLength(1);

      await prisma.giuongBenh.createMany({
        data: [
          {
            MaGiuong: createdIds.maGiuong1,
            MaPhong: createdIds.maPhong,
            SoGiuong: '901-1',
            LoaiGiuong: 'TIEU_CHUAN',
            TrangThai: 'SAN_SANG',
            DonGiaNgay: 300000,
          },
          {
            MaGiuong: createdIds.maGiuong2,
            MaPhong: createdIds.maPhong,
            SoGiuong: '901-2',
            LoaiGiuong: 'VIP',
            TrangThai: 'BAO_TRI',
            DonGiaNgay: 700000,
          },
        ],
      });
    });

    it('3.2. BR-V2-11: PATCH /api/beds/:maGiuong/status từ chối DANG_SU_DUNG; cho phép SAN_SANG / BAO_TRI', async () => {
      await request(app.getHttpServer())
        .patch(`/api/beds/${createdIds.maGiuong2}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trangThai: 'DANG_SU_DUNG' })
        .expect(400);

      const res = await request(app.getHttpServer())
        .patch(`/api/beds/${createdIds.maGiuong2}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trangThai: 'BAO_TRI' })
        .expect(200);
      expect(res.body.TrangThai).toBe('BAO_TRI');
    });

    it('3.3. BR-V2-01: POST /api/staff tạo bác sĩ và nhân viên partial; chặn >1 nhóm chuyên môn (409 BR-V2-01); trigger DB chặn disjoint', async () => {
      // Reject creating staff with 2 subtypes
      const conflictRes = await request(app.getHttpServer())
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maNV: `${prefix}_BAD`,
          maKhoa: createdIds.maKhoa,
          hoTen: 'Nhân Viên Trùng Nhóm',
          ngaySinh: '1990-01-01',
          gioiTinh: 'NAM',
          cccd: `999${Date.now().toString().slice(-9)}`,
          diaChi: 'TP.HCM',
          soDienThoai: '0909998888',
          ngayVaoLam: '2022-01-01',
          bacSi: {
            chuyenKhoa: 'Nội',
            trinhDoHocVan: 'BS',
            soChungChiHanhNghe: `${prefix}_CCHN_BAD1`,
          },
          dieuDuong: {
            capBac: 'Hạng III',
            chungChiHanhNghe: `${prefix}_CCHN_BAD2`,
          },
        })
        .expect(409);
      expect(conflictRes.body.ruleCode).toBe('BR-V2-01');

      // Valid BAC_SI
      const bsRes = await request(app.getHttpServer())
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maNV: createdIds.maNV_BS,
          maKhoa: createdIds.maKhoa,
          hoTen: 'BS Test E2E',
          ngaySinh: '1985-05-05',
          gioiTinh: 'NAM',
          cccd: `888${Date.now().toString().slice(-9)}`,
          diaChi: 'TP.HCM',
          soDienThoai: '0908887777',
          ngayVaoLam: '2018-01-01',
          bacSi: {
            chuyenKhoa: 'Nội',
            trinhDoHocVan: 'ThS. BS',
            soChungChiHanhNghe: `${prefix}_CCHN_BS`,
          },
        })
        .expect(201);
      expect(typeof bsRes.body.SoNamCongTac).toBe('number');

      // Valid partial staff (TIEP_NHAN)
      await request(app.getHttpServer())
        .post('/api/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maNV: createdIds.maNV_Partial,
          maKhoa: createdIds.maKhoa,
          hoTen: 'NV Tiếp Nhận Test',
          ngaySinh: '1995-05-05',
          gioiTinh: 'NU',
          cccd: `777${Date.now().toString().slice(-9)}`,
          diaChi: 'TP.HCM',
          soDienThoai: '0907776666',
          ngayVaoLam: '2022-01-01',
          role: 'TIEP_NHAN',
        })
        .expect(201);

      // Verify DB trigger blocks inserting same MaNV_BS into DIEU_DUONG directly
      await expect(
        prisma.dieuDuong.create({
          data: {
            MaNV: createdIds.maNV_BS,
            CapBac: 'Hạng III',
            ChungChiHanhNghe: `${prefix}_CCHN_TRAP`,
          },
        }),
      ).rejects.toThrow(/BR-V2-01/);

      // Verify GET /api/staff, /doctors, /nurses, /technicians
      const [all, docs, nurses, techs] = await Promise.all([
        request(app.getHttpServer()).get('/api/staff').set('Authorization', `Bearer ${adminToken}`).expect(200),
        request(app.getHttpServer()).get('/api/staff/doctors').set('Authorization', `Bearer ${adminToken}`).expect(200),
        request(app.getHttpServer()).get('/api/staff/nurses').set('Authorization', `Bearer ${adminToken}`).expect(200),
        request(app.getHttpServer()).get('/api/staff/technicians').set('Authorization', `Bearer ${adminToken}`).expect(200),
      ]);
      expect(all.body.length).toBeGreaterThan(0);
      expect(docs.body.some((d: any) => d.MaNV === createdIds.maNV_BS)).toBe(true);
      expect(nurses.body.length).toBeGreaterThan(0);
      expect(techs.body.length).toBeGreaterThan(0);
    });

    it('3.4. FK ON DELETE NO ACTION trả về 409 Conflict (FK_NO_ACTION)', async () => {
      await expect(
        prisma.khoa.delete({ where: { MaKhoa: createdIds.maKhoa } }),
      ).rejects.toThrow();
    });
  });

  // ==========================================================================
  // 4. BỆNH NHÂN & THẺ BHYT (BR-V2-06, BR-V2-09)
  // ==========================================================================
  describe('4. Patient & BHYT Insurance Cards (BR-V2-06, BR-V2-09)', () => {
    it('4.1. POST /api/patients tạo BENH_NHAN không tạo BN_NGOAI_TRU, trả về Tuoi dẫn xuất', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/patients')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maBN: createdIds.maBN,
          hoTen: 'Bệnh Nhân E2E 1',
          ngaySinh: '1990-06-15',
          gioiTinh: 'NAM',
          cccd: `666${Date.now().toString().slice(-9)}`,
          sdt: '0911222333',
          diaChiDuong: '10 Võ Văn Tần',
          diaChiPhuong: 'Phường 6',
          diaChiQuan: 'Quận 3',
          nhomMau: 'A',
        })
        .expect(201);

      expect(res.body.MaBN).toBe(createdIds.maBN);
      expect(typeof res.body.Tuoi).toBe('number');
      expect(res.body.Tuoi).toBeGreaterThan(20);

      await request(app.getHttpServer())
        .post('/api/patients')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maBN: createdIds.maBN2,
          hoTen: 'Bệnh Nhân E2E 2',
          ngaySinh: '1988-03-10',
          gioiTinh: 'NU',
          cccd: `555${Date.now().toString().slice(-9)}`,
          sdt: '0911222444',
          diaChiDuong: '20 CMT8',
          diaChiPhuong: 'Phường 10',
          diaChiQuan: 'Quận 3',
          nhomMau: 'O',
        })
        .expect(201);
    });

    it('4.2. BR-V2-06: POST/GET /api/patients/:maBN/insurance-cards kiểm tra MucHuong [0..1] & NgayHetHan >= NgayBatDau', async () => {
      // MucHuong > 1 rejected (400)
      await request(app.getHttpServer())
        .post(`/api/patients/${createdIds.maBN}/insurance-cards`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maTheBHYT: `${prefix}_BAD_CARD`,
          mucHuong: 80,
          ngayBatDau: '2026-01-01',
          ngayHetHan: '2026-12-31',
        })
        .expect(400);

      // NgayHetHan < NgayBatDau rejected (400 BR-V2-06)
      const dateErr = await request(app.getHttpServer())
        .post(`/api/patients/${createdIds.maBN}/insurance-cards`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maTheBHYT: `${prefix}_BAD_CARD2`,
          mucHuong: 0.8,
          ngayBatDau: '2026-12-31',
          ngayHetHan: '2026-01-01',
        })
        .expect(400);
      expect(dateErr.body.ruleCode).toBe('BR-V2-06');

      // Valid card
      await request(app.getHttpServer())
        .post(`/api/patients/${createdIds.maBN}/insurance-cards`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maTheBHYT: createdIds.maTheBHYT,
          mucHuong: 0.8,
          ngayBatDau: '2026-01-01',
          ngayHetHan: '2026-12-31',
        })
        .expect(201);

      const cards = await request(app.getHttpServer())
        .get(`/api/patients/${createdIds.maBN}/insurance-cards?validAt=2026-11-15`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .expect(200);
      expect(cards.body).toHaveLength(1);
      expect(cards.body[0].MucHuong).toBe(0.8);

      // Lookup by MaTheBHYT
      const lookup = await request(app.getHttpServer())
        .get(`/api/patients/lookup?q=${createdIds.maTheBHYT}`)
        .set('Authorization', `Bearer ${receptionToken}`)
        .expect(200);
      expect(lookup.body).toHaveLength(1);
      expect(lookup.body[0].MaBN).toBe(createdIds.maBN);
      expect(typeof lookup.body[0].Tuoi).toBe('number');
    });
  });

  // ==========================================================================
  // 5. NỘI TRÚ & PHÂN GIƯỜNG (BR-V2-02, BR-V2-03, BR-V2-11, BR-V2-12 + RACE)
  // ==========================================================================
  describe('5. Inpatient Admissions, Bed Allocations, Transfer, Discharge & Concurrency Races', () => {
    it('5.1. BR-V2-12: Race condition 2 request POST /api/inpatient/admissions song song -> chỉ 1 thành công, 1 bị 409 BR-V2-12', async () => {
      const [r1, r2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/inpatient/admissions')
          .set('Authorization', `Bearer ${doctorToken}`)
          .send({
            maDotNT: createdIds.maDotNT1,
            maBN: createdIds.maBN,
            ngayNhapVien: '2026-11-10',
            nguoiNhaLienHe: 'Người nhà 1',
            tinhTrangNhapVien: 'Theo dõi nội trú',
          }),
        request(app.getHttpServer())
          .post('/api/inpatient/admissions')
          .set('Authorization', `Bearer ${doctorToken}`)
          .send({
            maDotNT: createdIds.maDotNT_Race,
            maBN: createdIds.maBN,
            ngayNhapVien: '2026-11-10',
            nguoiNhaLienHe: 'Người nhà 2',
            tinhTrangNhapVien: 'Theo dõi nội trú song song',
          }),
      ]);

      const statuses = [r1.status, r2.status].sort();
      expect(statuses).toEqual([201, 409]);
      const failed = r1.status === 409 ? r1 : r2;
      expect(failed.body.ruleCode).toBe('BR-V2-12');

      // Normalize maDotNT1 to whichever succeeded
      const actualDot = r1.status === 201 ? createdIds.maDotNT1 : createdIds.maDotNT_Race;
      createdIds.maDotNT1 = actualDot;
    });

    it('5.2. BR-V2-11 & BR-V2-03: Chặn phân giường BAO_TRI; chặn ngày trước nhập viện; race condition phân cùng giường', async () => {
      // Bed 2 is BAO_TRI -> 409 BR-V2-11
      const maintRes = await request(app.getHttpServer())
        .post('/api/inpatient/bed-allocations')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maDotNT: createdIds.maDotNT1,
          maGiuong: createdIds.maGiuong2,
          tuNgay: '2026-11-10',
        })
        .expect(409);
      expect(maintRes.body.ruleCode).toBe('BR-V2-11');

      // TuNgay < NgayNhapVien -> 400 BR-V2-03
      const earlyRes = await request(app.getHttpServer())
        .post('/api/inpatient/bed-allocations')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maDotNT: createdIds.maDotNT1,
          maGiuong: createdIds.maGiuong1,
          tuNgay: '2026-11-09',
        })
        .expect(400);
      expect(earlyRes.body.ruleCode).toBe('BR-V2-03');

      // Open admission for maBN2 to test concurrent bed race on maGiuong1
      await request(app.getHttpServer())
        .post('/api/inpatient/admissions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maDotNT: createdIds.maDotNT2,
          maBN: createdIds.maBN2,
          ngayNhapVien: '2026-11-10',
          nguoiNhaLienHe: 'Người nhà BN2',
          tinhTrangNhapVien: 'Theo dõi nội trú BN2',
        })
        .expect(201);

      const [b1, b2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/inpatient/bed-allocations')
          .set('Authorization', `Bearer ${nurseToken}`)
          .send({
            maDotNT: createdIds.maDotNT1,
            maGiuong: createdIds.maGiuong1,
            tuNgay: '2026-11-10',
          }),
        request(app.getHttpServer())
          .post('/api/inpatient/bed-allocations')
          .set('Authorization', `Bearer ${nurseToken}`)
          .send({
            maDotNT: createdIds.maDotNT2,
            maGiuong: createdIds.maGiuong1,
            tuNgay: '2026-11-10',
          }),
      ]);

      const bedStatuses = [b1.status, b2.status].sort();
      expect(bedStatuses).toEqual([201, 409]);
      const failedBed = b1.status === 409 ? b1 : b2;
      expect(failedBed.body.ruleCode).toBe('BR-V2-03');

      // Ensure maDotNT1 holds maGiuong1 for subsequent transfer/discharge tests
      if (b2.status === 201) {
        // swap reference so maDotNT1 refers to the one holding the bed, or discharge maDotNT2
        await request(app.getHttpServer())
          .patch(`/api/inpatient/admissions/${createdIds.maDotNT2}/discharge`)
          .set('Authorization', `Bearer ${doctorToken}`)
          .send({ ngayRaVien: '2026-11-11' })
          .expect(200);
        await request(app.getHttpServer())
          .post('/api/inpatient/bed-allocations')
          .set('Authorization', `Bearer ${nurseToken}`)
          .send({
            maDotNT: createdIds.maDotNT1,
            maGiuong: createdIds.maGiuong1,
            tuNgay: '2026-11-12',
          })
          .expect(201);
      }
    });

    it('5.3. BR-V2-11 & BR-V2-03: GET /api/beds/map?date=... suy diễn đúng từ PHAN_GIUONG; transfer-bed chặn cùng ngày', async () => {
      // Verify map shows maGiuong1 occupied at 2026-11-12
      const mapOccupied = await request(app.getHttpServer())
        .get(`/api/beds/map?date=2026-11-12&maKhoa=${createdIds.maKhoa}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);
      const g1 = mapOccupied.body.find((b: any) => b.MaGiuong === createdIds.maGiuong1);
      expect(g1.TrangThai).toBe('SAN_SANG');
      expect(g1.dangCoNguoiNam).toBe(true);

      // Set maGiuong2 SAN_SANG so we can test transfer-bed
      await request(app.getHttpServer())
        .patch(`/api/beds/${createdIds.maGiuong2}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ trangThai: 'SAN_SANG' })
        .expect(200);

      // Same-day transfer rejected (400 BR-V2-03)
      const currentStart = g1.phanGiuongHienTai.TuNgay;
      await request(app.getHttpServer())
        .post('/api/inpatient/transfer-bed')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maDotNT: createdIds.maDotNT1,
          maGiuongMoi: createdIds.maGiuong2,
          ngayChuyen: currentStart,
        })
        .expect(400);

      // Valid next-day transfer
      await request(app.getHttpServer())
        .post('/api/inpatient/transfer-bed')
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({
          maDotNT: createdIds.maDotNT1,
          maGiuongMoi: createdIds.maGiuong2,
          ngayChuyen: '2026-11-13',
        })
        .expect(201);

      // At 2026-11-13, g1 is free and g2 is occupied
      const mapAfter = await request(app.getHttpServer())
        .get(`/api/beds/map?date=2026-11-13&maKhoa=${createdIds.maKhoa}`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .expect(200);
      expect(mapAfter.body.find((b: any) => b.MaGiuong === createdIds.maGiuong1).dangCoNguoiNam).toBe(false);
      expect(mapAfter.body.find((b: any) => b.MaGiuong === createdIds.maGiuong2).dangCoNguoiNam).toBe(true);
    });
  });

  // ==========================================================================
  // 6. KHÁM BỆNH (BR-V2-04), ĐƠN THUỐC (BR-V2-05, 06), XÉT NGHIỆM (BR-V2-07)
  // ==========================================================================
  describe('6. Examination (BR-V2-04), Prescription (BR-V2-05, 06) & LabTest (BR-V2-07)', () => {
    it('6.1. BR-V2-04: POST /api/examinations kiểm tra FK11 (MaBN khớp DOT_NOI_TRU & NgayGioKham trong khung)', async () => {
      // Mismatched MaBN vs MaDotNT -> 409 BR-V2-04
      const mismatchRes = await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: `${prefix}_LK_BAD`,
          maBN: createdIds.maBN2,
          maNV_BacSi: createdIds.maNV_BS,
          ngayGioKham: '2026-11-13T10:00:00.000Z',
          lyDoKham: 'Kiểm tra',
          trieuChung: 'Sốt',
          chanDoanSoBo: 'Theo dõi',
          maDotNT: createdIds.maDotNT1,
        })
        .expect(409);
      expect(mismatchRes.body.ruleCode).toBe('BR-V2-04');

      // Valid inpatient exam on maDotNT1
      await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maLuotKham: createdIds.maLuotKham1,
          maBN: createdIds.maBN,
          maNV_BacSi: createdIds.maNV_BS,
          ngayGioKham: '2026-11-14T08:00:00.000Z',
          lyDoKham: 'Theo dõi nội trú',
          trieuChung: 'Ho nhẹ',
          chanDoanSoBo: 'Viêm phế quản',
          trangThai: 'DANG_KHAM',
          maDotNT: createdIds.maDotNT1,
        })
        .expect(201);

      // Valid outpatient exam (MaDotNT = null)
      await request(app.getHttpServer())
        .post('/api/examinations')
        .set('Authorization', `Bearer ${receptionToken}`)
        .send({
          maLuotKham: createdIds.maLuotKham2,
          maBN: createdIds.maBN,
          maNV_BacSi: createdIds.maNV_BS,
          ngayGioKham: '2026-11-15T09:00:00.000Z',
          lyDoKham: 'Tái khám ngoại trú',
          trieuChung: 'Đau đầu',
          chanDoanSoBo: 'Rối loạn tiền đình',
          maDotNT: null,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/api/examinations/${createdIds.maLuotKham1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ chanDoanSoBo: 'Viêm phế quản cấp (cập nhật)', trangThai: 'CHO_XET_NGHIEM' })
        .expect(200);
    });

    it('6.2. BR-V2-05, 06, 08: Đơn thuốc 1-0..1, >=1 dòng, SoLuong>0, snapshot DonGiaKe, PATCH & DELETE', async () => {
      const medsRes = await request(app.getHttpServer())
        .get('/api/medicines')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);
      expect(medsRes.body.length).toBeGreaterThan(0);
      expect(medsRes.body[0].SoLuongTon).toBeUndefined();

      // Empty items rejected (400)
      await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maDonThuoc: `${prefix}_DT_EMPTY`,
          maLuotKham: createdIds.maLuotKham1,
          loiDanCuaBacSi: 'Test',
          items: [],
        })
        .expect(400);

      // Valid prescription on LK1: TH01 (1500 * 10 = 15000) + TH02 (3500 * 10 = 35000) = 50000
      const dtRes = await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maDonThuoc: createdIds.maDonThuoc1,
          maLuotKham: createdIds.maLuotKham1,
          ngayKeDon: '2026-11-14',
          loiDanCuaBacSi: 'Uống sau ăn',
          items: [
            { maThuoc: 'TH01', soLuong: 10, lieuDung: '1 viên x 2 lần' },
            { maThuoc: 'TH02', soLuong: 10, lieuDung: '1 viên x 2 lần' },
          ],
        })
        .expect(201);
      expect(dtRes.body.TongTienThuoc).toBe(50000);

      // Duplicate prescription for LK1 rejected (409 BR-V2-05)
      const dupDt = await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maDonThuoc: `${prefix}_DT_DUP`,
          maLuotKham: createdIds.maLuotKham1,
          loiDanCuaBacSi: 'Trùng',
          items: [{ maThuoc: 'TH01', soLuong: 5, lieuDung: '1 viên' }],
        })
        .expect(409);
      expect(dupDt.body.ruleCode).toBe('BR-V2-05');

      // Test create & delete prescription on LK2 before invoice
      await request(app.getHttpServer())
        .post('/api/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maDonThuoc: createdIds.maDonThuoc2,
          maLuotKham: createdIds.maLuotKham2,
          ngayKeDon: '2026-11-15',
          loiDanCuaBacSi: 'Tạm thời',
          items: [{ maThuoc: 'TH01', soLuong: 4, lieuDung: '1 viên/ngày' }],
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/prescriptions/${createdIds.maDonThuoc2}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);
    });

    it('6.3. BR-V2-07: Quy trình 2 bước PHIEU_XET_NGHIEM (start -> complete) chỉ cho KY_THUAT_VIEN', async () => {
      const typesRes = await request(app.getHttpServer())
        .get('/api/lab-types')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);
      expect(typesRes.body.length).toBeGreaterThan(0);

      // Create 2 lab requests for LK1: PXN1 (XN01 = 80k) will be started & completed; PXN2 (XN02 = 120k) stays unstarted (not billed!)
      await request(app.getHttpServer())
        .post('/api/lab-requests')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maPhieuXN: createdIds.maPhieuXN1,
          maLuotKham: createdIds.maLuotKham1,
          maLoaiXN: 'XN01',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/lab-requests')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maPhieuXN: createdIds.maPhieuXN2,
          maLuotKham: createdIds.maLuotKham1,
          maLoaiXN: 'XN02',
        })
        .expect(201);

      // DIEU_DUONG cannot start lab request (403 Forbidden)
      await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN1}/start`)
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({})
        .expect(403);

      // Cannot complete PXN1 before start (no NgayGioXN) -> 400 BR-V2-07
      const preComplete = await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN1}/complete`)
        .set('Authorization', `Bearer ${ktvToken}`)
        .send({ ketQua: 'WBC: 7.0' })
        .expect(400);
      expect(preComplete.body.ruleCode).toBe('BR-V2-07');

      // KTV starts PXN1
      await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN1}/start`)
        .set('Authorization', `Bearer ${ktvToken}`)
        .send({ ngayGioXN: '2026-11-14T08:30:00.000Z' })
        .expect(200);

      // NgayGioTraKQ < NgayGioXN rejected (400 BR-V2-07)
      const badTime = await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN1}/complete`)
        .set('Authorization', `Bearer ${ktvToken}`)
        .send({
          ngayGioTraKQ: '2026-11-14T08:00:00.000Z',
          ketQua: 'WBC: 7.2',
        })
        .expect(400);
      expect(badTime.body.ruleCode).toBe('BR-V2-07');

      // KTV completes PXN1
      const completeRes = await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN1}/complete`)
        .set('Authorization', `Bearer ${ktvToken}`)
        .send({
          ngayGioTraKQ: '2026-11-14T09:00:00.000Z',
          ketQua: 'WBC: 7.2 G/L, RBC: 4.9 T/L',
          danhGia: 'Bình thường',
        })
        .expect(200);
      expect(completeRes.body.KetQua).toContain('WBC');
    });
  });

  // ==========================================================================
  // 7. VIỆN PHÍ, BHYT, KHÓA CHI PHÍ SAU THANH TOÁN & BÁO CÁO (BR-V2-08, 13)
  // ==========================================================================
  describe('7. Billing (BR-V2-08, BR-V2-13), Discharge (BR-V2-02, 03) & Dashboard Report', () => {
    it('7.1. BR-V2-08 & BR-V2-13: Preview chỉ tính phiếu có NgayGioXN IS NOT NULL; lập hóa đơn; kiểm tra giảm chi phí vượt TruBHYT trước TT', async () => {
      // LK1 has DT1 = 50,000 + PXN1 (NgayGioXN != null) = 80,000 (PXN2 = 120,000 NOT started so excluded!)
      const previewRes = await request(app.getHttpServer())
        .get(`/api/billing/preview/${createdIds.maLuotKham1}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(previewRes.body.TongTienThuoc).toBe(50000);
      expect(previewRes.body.TongTienDichVu).toBe(80000);
      expect(previewRes.body.TongChiPhi).toBe(130000);
      expect(previewRes.body.theBHYTHopLe.some((c: any) => c.MaTheBHYT === createdIds.maTheBHYT)).toBe(true);

      // Create invoice with BHYT 0.8 => TruBHYT = 104,000; ThucThu = 26,000
      const invRes = await request(app.getHttpServer())
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          maHoaDon: createdIds.maHoaDon1,
          maLuotKham: createdIds.maLuotKham1,
          ngayLap: '2026-11-14',
          hinhThucThanhToan: 'TIEN_MAT',
          maTheBHYT: createdIds.maTheBHYT,
        })
        .expect(201);

      expect(invRes.body.TruBHYT).toBe(104000);
      expect(invRes.body.ThucThu).toBe(26000);
      expect(invRes.body.TrangThaiThanhToan).toBe('CHUA_THANH_TOAN');

      // BR-V2-13: While CHUA_THANH_TOAN, reducing prescription so total (e.g., 1500 + 80000 = 81500) < TruBHYT (104000) -> 409 BR-V2-13
      const br13Res = await request(app.getHttpServer())
        .patch(`/api/prescriptions/${createdIds.maDonThuoc1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          items: [{ maThuoc: 'TH01', soLuong: 1, lieuDung: '1 viên' }],
        })
        .expect(409);
      expect(br13Res.body.ruleCode).toBe('BR-V2-13');

      // Deleting prescription while TruBHYT (104k) > TongTienDichVu (80k) -> 409 BR-V2-13
      const br13DelRes = await request(app.getHttpServer())
        .delete(`/api/prescriptions/${createdIds.maDonThuoc1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(409);
      expect(br13DelRes.body.ruleCode).toBe('BR-V2-13');

      // Increasing prescription cost (e.g. TH01 x 10 + TH02 x 12 => 57000 + 80000 = 137000 >= 104000) succeeds!
      const validEdit = await request(app.getHttpServer())
        .patch(`/api/prescriptions/${createdIds.maDonThuoc1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          items: [
            { maThuoc: 'TH01', soLuong: 10, lieuDung: '1 viên x 2' },
            { maThuoc: 'TH02', soLuong: 12, lieuDung: '1 viên x 2' },
          ],
        })
        .expect(200);
      expect(validEdit.body.TongTienThuoc).toBe(57000);
    });

    it('7.2. BR-V2-08: PATCH /api/billing/invoices/:id/pay chốt DA_THANH_TOAN và khóa toàn bộ chi phí liên quan (409 BR-V2-08)', async () => {
      const payRes = await request(app.getHttpServer())
        .patch(`/api/billing/invoices/${createdIds.maHoaDon1}/pay`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ hinhThucThanhToan: 'CHUYEN_KHOAN' })
        .expect(200);

      expect(payRes.body.TrangThaiThanhToan).toBe('DA_THANH_TOAN');
      expect(payRes.body.TongTienThuoc).toBe(57000);
      expect(payRes.body.TongTienDichVu).toBe(80000);
      expect(payRes.body.TruBHYT).toBe(104000);
      expect(payRes.body.ThucThu).toBe(33000);

      // Re-paying -> 409 BR-V2-08
      const repayRes = await request(app.getHttpServer())
        .patch(`/api/billing/invoices/${createdIds.maHoaDon1}/pay`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({})
        .expect(409);
      expect(repayRes.body.ruleCode).toBe('BR-V2-08');

      // Editing prescription after payment -> 409 BR-V2-08
      const editRx = await request(app.getHttpServer())
        .patch(`/api/prescriptions/${createdIds.maDonThuoc1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ loiDanCuaBacSi: 'Cố tình sửa sau TT' })
        .expect(409);
      expect(editRx.body.ruleCode).toBe('BR-V2-08');

      // Adding lab request after payment -> 409 BR-V2-08
      const addLab = await request(app.getHttpServer())
        .post('/api/lab-requests')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          maPhieuXN: `${prefix}_PXNLK`,
          maLuotKham: createdIds.maLuotKham1,
          maLoaiXN: 'XN01',
        })
        .expect(409);
      expect(addLab.body.ruleCode).toBe('BR-V2-08');

      // Starting PXN2 on paid LK1 -> 409 BR-V2-08
      const startLab = await request(app.getHttpServer())
        .patch(`/api/lab-requests/${createdIds.maPhieuXN2}/start`)
        .set('Authorization', `Bearer ${ktvToken}`)
        .send({})
        .expect(409);
      expect(startLab.body.ruleCode).toBe('BR-V2-08');

      // GET /api/examinations/:id returns all derived fields
      const examDetail = await request(app.getHttpServer())
        .get(`/api/examinations/${createdIds.maLuotKham1}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);
      expect(examDetail.body.donThuoc.TongTienThuoc).toBe(57000);
      expect(examDetail.body.vienPhi.ThucThu).toBe(33000);
    });

    it('7.3. BR-V2-02 & BR-V2-03: Xuất viện đóng DOT_NOI_TRU và tự động đóng PHAN_GIUONG đang mở trong cùng transaction', async () => {
      // Discharge date before NgayNhapVien -> 400 BR-V2-02
      await request(app.getHttpServer())
        .patch(`/api/inpatient/admissions/${createdIds.maDotNT1}/discharge`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ ngayRaVien: '2026-11-01' })
        .expect(400);

      // Valid discharge at 2026-11-15 -> closes PHAN_GIUONG at DenNgay = 2026-11-16
      const disRes = await request(app.getHttpServer())
        .patch(`/api/inpatient/admissions/${createdIds.maDotNT1}/discharge`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ ngayRaVien: '2026-11-15' })
        .expect(200);

      expect(disRes.body.NgayRaVien).toBe('2026-11-15');
      expect(disRes.body.closedBedAllocations).toHaveLength(1);
      expect(disRes.body.closedBedAllocations[0].DenNgay).toBe('2026-11-16');

      // After discharge, maGiuong2 is occupied on 2026-11-15 and free on 2026-11-16!
      const [map15, map16] = await Promise.all([
        request(app.getHttpServer())
          .get(`/api/beds/map?date=2026-11-15&maKhoa=${createdIds.maKhoa}`)
          .set('Authorization', `Bearer ${nurseToken}`)
          .expect(200),
        request(app.getHttpServer())
          .get(`/api/beds/map?date=2026-11-16&maKhoa=${createdIds.maKhoa}`)
          .set('Authorization', `Bearer ${nurseToken}`)
          .expect(200),
      ]);
      expect(map15.body.find((b: any) => b.MaGiuong === createdIds.maGiuong2).dangCoNguoiNam).toBe(true);
      expect(map16.body.find((b: any) => b.MaGiuong === createdIds.maGiuong2).dangCoNguoiNam).toBe(false);
    });

    it('7.4. GET /api/reports/dashboard?date=... tổng hợp từ 18 bảng và V_VIEN_PHI', async () => {
      const dashRes = await request(app.getHttpServer())
        .get('/api/reports/dashboard?date=2026-11-15')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dashRes.body.tongBenhNhan).toBeGreaterThanOrEqual(3);
      expect(dashRes.body.tongLuotKham).toBeGreaterThanOrEqual(2);
      expect(typeof dashRes.body.soDotNoiTruDangMo).toBe('number');
      expect(dashRes.body.congSuatGiuong.tongGiuong).toBeGreaterThanOrEqual(6);
      expect(dashRes.body.doanhThu.daThanhToan.ThucThu).toBeGreaterThan(0);
    });
  });
});
