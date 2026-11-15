import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { HinhThucThanhToan, TrangThaiThanhToan } from '../../common/enums/role.enum';

describe('BillingService v2 (Unit Tests)', () => {
  let service: BillingService;
  let mockTx: any;
  let prismaMock: any;

  beforeEach(async () => {
    mockTx = {
      $queryRaw: jest.fn(),
      luotKham: { findUnique: jest.fn() },
      theBHYT: { findUnique: jest.fn() },
      vienPhi: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    prismaMock = {
      $queryRaw: jest.fn(),
      $transaction: jest.fn(async (cb: (tx: any) => Promise<any>) => cb(mockTx)),
      luotKham: { findUnique: jest.fn() },
      vienPhi: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('previewBilling computes TongTienThuoc + TongTienDichVu (only NgayGioXN IS NOT NULL) and filters valid THE_BHYT', async () => {
    prismaMock.luotKham.findUnique.mockResolvedValue({
      MaLuotKham: 'LK_V2_01',
      MaBN: 'BN01',
      NgayGioKham: new Date('2026-11-15T09:00:00.000Z'),
      benhNhan: {
        MaBN: 'BN01',
        theBHYTs: [
          {
            MaTheBHYT: 'CARD_VALID',
            MaBN: 'BN01',
            MucHuong: 0.8,
            NgayBatDau: new Date('2026-01-01'),
            NgayHetHan: new Date('2026-12-31'),
          },
          {
            MaTheBHYT: 'CARD_EXPIRED',
            MaBN: 'BN01',
            MucHuong: 0.95,
            NgayBatDau: new Date('2025-01-01'),
            NgayHetHan: new Date('2025-12-31'),
          },
        ],
      },
      donThuoc: null,
      phieuXetNghiems: [],
      vienPhi: null,
    });

    // V_LUOT_KHAM_CHI_PHI returns 100k medicine + 80k performed lab (excludes unperformed labs, no exam/bed fee)
    prismaMock.$queryRaw.mockResolvedValue([
      { TongTienThuoc: '100000.00', TongTienDichVu: '80000.00' },
    ]);

    const result = await service.previewBilling('LK_V2_01');

    expect(result.TongTienThuoc).toBe(100000);
    expect(result.TongTienDichVu).toBe(80000);
    expect(result.TongChiPhi).toBe(180000);
    expect(result.theBHYTHopLe).toHaveLength(1);
    expect(result.theBHYTHopLe[0].MaTheBHYT).toBe('CARD_VALID');
  });

  it('createInvoice calculates TruBHYT = ROUND((TongTienThuoc + TongTienDichVu) * MucHuong, 2) and ThucThu (BR-V2-08)', async () => {
    // 1. lockLuotKhamAndAssertUnlocked -> lock row, check unpaid
    mockTx.$queryRaw
      .mockResolvedValueOnce([{ MaLuotKham: 'LK_V2_01' }]) // FOR UPDATE
      .mockResolvedValueOnce([{ TongTienThuoc: '67500.00', TongTienDichVu: '80000.00' }]) // V_LUOT_KHAM_CHI_PHI
      .mockResolvedValueOnce([
        {
          MaHoaDon: 'HD_V2_01',
          MaLuotKham: 'LK_V2_01',
          NgayLap: new Date('2026-11-15'),
          HinhThucThanhToan: HinhThucThanhToan.TIEN_MAT,
          TruBHYT: '118000.00',
          TrangThaiThanhToan: TrangThaiThanhToan.CHUA_THANH_TOAN,
          TongTienDichVu: '80000.00',
          TongTienThuoc: '67500.00',
          ThucThu: '29500.00',
        },
      ]);

    mockTx.vienPhi.findUnique.mockResolvedValue(null);
    mockTx.luotKham.findUnique.mockResolvedValue({
      MaLuotKham: 'LK_V2_01',
      MaBN: 'BN01',
      NgayGioKham: new Date('2026-11-15T08:30:00.000Z'),
      vienPhi: null,
    });
    mockTx.theBHYT.findUnique.mockResolvedValue({
      MaTheBHYT: 'DN4790000001',
      MaBN: 'BN01',
      MucHuong: 0.8,
      NgayBatDau: new Date('2026-01-01'),
      NgayHetHan: new Date('2026-12-31'),
    });
    mockTx.vienPhi.create.mockResolvedValue({ MaHoaDon: 'HD_V2_01' });

    const invoice = await service.createInvoice({
      maHoaDon: 'HD_V2_01',
      maLuotKham: 'LK_V2_01',
      ngayLap: '2026-11-15',
      hinhThucThanhToan: HinhThucThanhToan.TIEN_MAT,
      maTheBHYT: 'DN4790000001',
    });

    expect(mockTx.vienPhi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          MaHoaDon: 'HD_V2_01',
          TruBHYT: 118000,
          TrangThaiThanhToan: TrangThaiThanhToan.CHUA_THANH_TOAN,
        }),
      }),
    );
    expect(invoice.TongTienThuoc).toBe(67500);
    expect(invoice.TongTienDichVu).toBe(80000);
    expect(invoice.TruBHYT).toBe(118000);
    expect(invoice.ThucThu).toBe(29500);
  });

  it('createInvoice rejects duplicate invoice for same MaLuotKham with 409 BR-V2-05', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([{ MaLuotKham: 'LK_V2_01' }]);
    mockTx.vienPhi.findUnique.mockResolvedValue({
      MaHoaDon: 'HD_EXISTING',
      TrangThaiThanhToan: TrangThaiThanhToan.CHUA_THANH_TOAN,
    });
    mockTx.luotKham.findUnique.mockResolvedValue({
      MaLuotKham: 'LK_V2_01',
      MaBN: 'BN01',
      vienPhi: { MaHoaDon: 'HD_EXISTING' },
    });

    await expect(
      service.createInvoice({
        maLuotKham: 'LK_V2_01',
        hinhThucThanhToan: HinhThucThanhToan.TIEN_MAT,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('createInvoice rejects expired or mismatched THE_BHYT with 400 BR-V2-08', async () => {
    mockTx.$queryRaw
      .mockResolvedValueOnce([{ MaLuotKham: 'LK_V2_01' }])
      .mockResolvedValueOnce([{ TongTienThuoc: '50000.00', TongTienDichVu: '0.00' }]);
    mockTx.vienPhi.findUnique.mockResolvedValue(null);
    mockTx.luotKham.findUnique.mockResolvedValue({
      MaLuotKham: 'LK_V2_01',
      MaBN: 'BN01',
      NgayGioKham: new Date('2026-11-15T08:30:00.000Z'),
      vienPhi: null,
    });
    mockTx.theBHYT.findUnique.mockResolvedValue({
      MaTheBHYT: 'CARD_OLD',
      MaBN: 'BN01',
      MucHuong: 0.8,
      NgayBatDau: new Date('2025-01-01'),
      NgayHetHan: new Date('2025-12-31'),
    });

    await expect(
      service.createInvoice({
        maLuotKham: 'LK_V2_01',
        hinhThucThanhToan: HinhThucThanhToan.TIEN_MAT,
        maTheBHYT: 'CARD_OLD',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('payInvoice blocks re-paying already DA_THANH_TOAN invoice with 409 BR-V2-08', async () => {
    mockTx.vienPhi.findUnique.mockResolvedValue({
      MaHoaDon: 'HD01',
      MaLuotKham: 'LK01',
      TrangThaiThanhToan: TrangThaiThanhToan.DA_THANH_TOAN,
    });
    mockTx.$queryRaw.mockResolvedValueOnce([{ MaLuotKham: 'LK01' }]);

    await expect(service.payInvoice('HD01', {})).rejects.toThrow(ConflictException);
  });

  it('payInvoice throws NotFoundException when invoice does not exist', async () => {
    mockTx.vienPhi.findUnique.mockResolvedValue(null);
    await expect(service.payInvoice('HD_MISSING', {})).rejects.toThrow(NotFoundException);
  });
});
