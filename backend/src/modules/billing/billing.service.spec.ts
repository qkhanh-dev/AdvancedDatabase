import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BillingService (Unit Tests)', () => {
  let service: BillingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: {
            luotKham: {
              findUnique: jest.fn(),
            },
            hoaDon: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate BHYT deduction correctly according to BR03', async () => {
    const mockExam = {
      MaLuotKham: 'LK_TEST_01',
      benhNhan: {
        MaBN: 'BN_TEST_01',
        HoTen: 'Nguyen Van Test',
        SoBHYT: 'DN479001',
        MucHuongBHYT: 80,
        bnNoiTru: null,
      },
      donThuoc: {
        ctDonThuocs: [
          { DonGiaBan: 10000, SoLuong: 10 }, // 100,000 VND
        ],
      },
      suDungDvs: [
        {
          DonGiaDV: 50000,
          SoLuong: 1,
          dichVu: { ThuocBHYTChiTra: true }, // 50,000 VND covered by BHYT
        },
      ],
    };

    jest.spyOn(prisma.luotKham, 'findUnique').mockResolvedValue(mockExam as any);

    const result = await service.calculateFee('LK_TEST_01');

    // TienKham = 50,000
    // TienThuoc = 100,000
    // TienDichVu = 50,000
    // TongTienGoc = 50,000 + 100,000 + 50,000 = 200,000 VND
    expect(result.tongTienGoc).toBe(200000);

    // Eligible for BHYT = TienKham (50k) + TienDichVuBHYT (50k) = 100k
    // MucHuong = 80% => TienBHYTChiTra = 80,000 VND
    expect(result.tienBHYTChiTra).toBe(80000);

    // TienBenhNhanTra = 200,000 - 80,000 = 120,000 VND
    expect(result.tienBenhNhanTra).toBe(120000);
  });
});
