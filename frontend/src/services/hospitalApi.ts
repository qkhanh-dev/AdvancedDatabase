import { api } from "@/lib/api";
import {
  Khoa,
  Phong,
  GiuongBenh,
  NhanVien,
  BacSi,
  DieuDuong,
  BenhNhan,
  LuotKham,
  Thuoc,
  DonThuoc,
  DichVu,
  SuDungDv,
  PhanGiuong,
  HoaDon,
  LichTruc,
  LoginRequestDto,
  LoginResponseDto,
  ReceptionRequestDto,
  CreateExaminationDto,
  UpdateDiagnosisDto,
  CreatePrescriptionDto,
  AssignServiceDto,
  UpdateServiceResultDto,
  AdmitPatientDto,
  AssignBedDto,
  TransferBedDto,
  FeeCalculationResponse,
  CreateInvoiceDto,
  VietQrWebhookDto,
  CreateDutyScheduleDto,
  DashboardSummaryResponse,
  LoaiNVEnum,
  CaTrucEnum,
  TrangThaiDiemDanhEnum,
  GioiTinhEnum,
  HuongXuTriEnum,
  PhuongThucTTEnum,
} from "@/types";

export const hospitalApi = {
  // 1. Phân hệ Xác thực (Auth)
  auth: {
    login: async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
      const payload = {
        username: dto.username,
        password: dto.password,
      };
      const res = await api.post<LoginResponseDto>("/auth/login", payload);
      return res.data;
    },
    getProfile: async (): Promise<NhanVien> => {
      const res = await api.get<NhanVien>("/auth/profile");
      return res.data;
    },
  },

  // 2. Phân hệ Cơ sở vật chất & Khoa phòng (Department & Room)
  department: {
    getAll: async (): Promise<Khoa[]> => {
      const res = await api.get<Khoa[]>("/departments");
      return res.data;
    },
    getById: async (maKhoa: string): Promise<Khoa> => {
      const res = await api.get<Khoa>(`/departments/${maKhoa}`);
      return res.data;
    },
    getAvailableRooms: async (maKhoa?: string): Promise<Phong[]> => {
      const res = await api.get<Phong[]>("/rooms/available", {
        params: maKhoa ? { maKhoa } : undefined,
      });
      return res.data;
    },
    getBedMap: async (): Promise<GiuongBenh[]> => {
      const res = await api.get<any[]>("/beds/map");
      return res.data.map((b) => ({
        ...b,
        TrangThai: b.TrangThaiGiuong || b.TrangThai,
      }));
    },
  },

  // 3. Phân hệ Nhân sự y tế (Staff)
  staff: {
    getAll: async (loaiNV?: LoaiNVEnum, maKhoa?: string): Promise<NhanVien[]> => {
      const res = await api.get<NhanVien[]>("/staff", {
        params: { loaiNV, maKhoa },
      });
      return res.data;
    },
    getDoctors: async (): Promise<BacSi[]> => {
      const res = await api.get<BacSi[]>("/staff/doctors");
      return res.data;
    },
    getNurses: async (): Promise<DieuDuong[]> => {
      const res = await api.get<DieuDuong[]>("/staff/nurses");
      return res.data;
    },
    getById: async (maNV: string): Promise<NhanVien> => {
      const res = await api.get<NhanVien>(`/staff/${maNV}`);
      return res.data;
    },
  },

  // 4. Phân hệ Tiếp đón & Hồ sơ Bệnh nhân (Patient)
  patient: {
    reception: async (dto: ReceptionRequestDto): Promise<BenhNhan> => {
      const payload = {
        maBN: dto.maBN || dto.MaBN,
        hoTen: dto.hoTen || dto.HoTen || "",
        ngaySinh: dto.ngaySinh || dto.NgaySinh || "1990-01-01",
        gioiTinh: dto.gioiTinh || dto.GioiTinh || GioiTinhEnum.NAM,
        cccd: dto.cccd || dto.CCCD || undefined,
        soDienThoai: dto.soDienThoai || dto.SoDienThoai || undefined,
        soBHYT: dto.soBHYT || dto.BHYT || undefined,
        mucHuongBHYT: dto.mucHuongBHYT || 80,
        diaChi: dto.diaChi || dto.DiaChi || "TP. Hồ Chí Minh",
        nhomMau: dto.nhomMau,
        isNgoaiTru: dto.isNgoaiTru ?? true,
      };
      const res = await api.post<BenhNhan>("/patients/reception", payload);
      return res.data;
    },
    lookup: async (query: string): Promise<BenhNhan> => {
      const res = await api.get<BenhNhan>("/patients/lookup", {
        params: { q: query },
      });
      return res.data;
    },
    getAll: async (page = 1, limit = 20): Promise<{ data: BenhNhan[]; total: number; page: number; totalPages: number }> => {
      const res = await api.get<{ data: BenhNhan[]; total: number; page: number; totalPages: number }>("/patients", {
        params: { page, limit },
      });
      return res.data;
    },
  },

  // 5. Phân hệ Khám bệnh & Chẩn đoán (Examination)
  examination: {
    create: async (dto: CreateExaminationDto): Promise<LuotKham> => {
      const payload = {
        maLuotKham: dto.maLuotKham || dto.MaLK,
        maBN: dto.maBN || dto.MaBN || "",
        maBS: dto.maBS || dto.MaBS || "BS01",
        maPhongKham: dto.maPhongKham || dto.MaPhong || "P01",
        trieuChung: dto.trieuChung || dto.TrieuChung || "Khám thường quy",
        huyetAp: dto.huyetAp || dto.HuyetAp || "120/80",
        nhietDo: dto.nhietDo ?? (dto.NhietDo ? Number(dto.NhietDo) : 37),
        mach: dto.mach ?? (dto.Mach ? Number(dto.Mach) : 80),
        chanDoanSoBo: dto.chanDoanSoBo || "Viêm đường hô hấp trên",
        huongXuTri: dto.huongXuTri || HuongXuTriEnum.KE_DON_VE,
        ngayTaiKham: dto.ngayTaiKham,
      };
      const res = await api.post<any>("/examinations", payload);
      return {
        ...res.data,
        MaLK: res.data.MaLuotKham,
        ChanDoan: res.data.ChanDoanXacDinh || res.data.ChanDoanSoBo,
        TrangThai: res.data.HuongXuTri,
      };
    },
    updateDiagnosis: async (id: string, dto: UpdateDiagnosisDto): Promise<LuotKham> => {
      const payload = {
        chanDoanXacDinh: dto.chanDoanXacDinh || dto.ChanDoan || "Viêm họng cấp",
        huongXuTri: dto.huongXuTri || HuongXuTriEnum.KE_DON_VE,
        ngayTaiKham: dto.ngayTaiKham,
      };
      const res = await api.patch<any>(`/examinations/${id}/diagnose`, payload);
      return {
        ...res.data,
        MaLK: res.data.MaLuotKham,
        ChanDoan: res.data.ChanDoanXacDinh || res.data.ChanDoanSoBo,
        TrangThai: res.data.HuongXuTri,
      };
    },
    getById: async (id: string): Promise<LuotKham> => {
      const res = await api.get<any>(`/examinations/${id}`);
      return {
        ...res.data,
        MaLK: res.data.MaLuotKham,
        ChanDoan: res.data.ChanDoanXacDinh || res.data.ChanDoanSoBo,
        TrangThai: res.data.HuongXuTri,
      };
    },
    getAll: async (maBS?: string, maBN?: string): Promise<LuotKham[]> => {
      const res = await api.get<any[]>("/examinations", {
        params: { maBS, maBN },
      });
      return res.data.map((exam) => ({
        ...exam,
        MaLK: exam.MaLuotKham,
        ChanDoan: exam.ChanDoanXacDinh || exam.ChanDoanSoBo,
        TrangThai: exam.HuongXuTri,
      }));
    },
  },

  // 6. Phân hệ Toa thuốc & Dược phẩm (Prescription)
  prescription: {
    getAllMedicines: async (): Promise<Thuoc[]> => {
      const res = await api.get<any[]>("/prescriptions/medicines");
      return res.data.map((m) => ({
        ...m,
        DonGia: m.DonGiaHienHanh,
      }));
    },
    create: async (dto: CreatePrescriptionDto): Promise<DonThuoc> => {
      const items = (dto.items || dto.ChiTiet || []).map((it) => ({
        maThuoc: it.maThuoc || it.MaThuoc || "",
        soLuong: Number(it.soLuong ?? it.SoLuong ?? 1),
        lieuDung: it.lieuDung || "1 viên x 2 lần/ngày",
        cachDung: it.cachDung || it.CachDung || "Uống sau ăn",
        soNgayUong: it.soNgayUong || 5,
      }));

      const payload = {
        maDon: dto.maDon,
        maLuotKham: dto.maLuotKham || dto.MaLK || "",
        loiDanBacSi: dto.loiDanBacSi || dto.GhiChu || "Dùng thuốc đúng chỉ dẫn",
        items,
      };
      const res = await api.post<any>("/prescriptions", payload);
      return {
        ...res.data,
        MaDT: res.data.MaDon,
        MaLK: res.data.MaLuotKham,
        TrangThai: res.data.TrangThaiPhatThuoc,
        NgayKe: res.data.NgayGioKe,
        GhiChu: res.data.LoiDanBacSi,
        ChiTiet: res.data.ctDonThuocs || [],
      };
    },
    dispense: async (id: string): Promise<DonThuoc> => {
      const res = await api.patch<any>(`/prescriptions/${id}/dispense`);
      return {
        ...res.data,
        MaDT: res.data.MaDon,
        MaLK: res.data.MaLuotKham,
        TrangThai: res.data.TrangThaiPhatThuoc,
        NgayKe: res.data.NgayGioKe,
        GhiChu: res.data.LoiDanBacSi,
        ChiTiet: res.data.ctDonThuocs || [],
      };
    },
    getById: async (id: string): Promise<DonThuoc> => {
      const res = await api.get<any>(`/prescriptions/${id}`);
      return {
        ...res.data,
        MaDT: res.data.MaDon,
        MaLK: res.data.MaLuotKham,
        TrangThai: res.data.TrangThaiPhatThuoc,
        NgayKe: res.data.NgayGioKe,
        GhiChu: res.data.LoiDanBacSi,
        ChiTiet: res.data.ctDonThuocs || [],
      };
    },
  },

  // 7. Phân hệ Cận lâm sàng & Dịch vụ Kỹ thuật (Clinical Service)
  clinicalService: {
    getAllServices: async (): Promise<DichVu[]> => {
      const res = await api.get<any[]>("/services");
      return res.data.map((s) => ({
        ...s,
        DonGia: s.DonGiaHienHanh,
      }));
    },
    assign: async (dto: AssignServiceDto): Promise<SuDungDv> => {
      const payload = {
        maLuotKham: dto.maLuotKham || dto.MaLK || "",
        maDV: dto.maDV || dto.MaDV || "",
        soLuong: dto.soLuong || 1,
      };
      const res = await api.post<any>("/services/assign", payload);
      return {
        ...res.data,
        MaSD: `${res.data.MaLuotKham}_${res.data.MaDV}`,
        MaLK: res.data.MaLuotKham,
        ThoiGian: res.data.ThoiGianChiDinh,
        TrangThai: res.data.KetQuaCLS ? "DA_CO_KET_QUA" : "CHO_THUC_HIEN",
      };
    },
    getPending: async (): Promise<SuDungDv[]> => {
      const res = await api.get<any[]>("/services/pending");
      return res.data.map((item) => ({
        ...item,
        MaSD: `${item.MaLuotKham}_${item.MaDV}`,
        MaLK: item.MaLuotKham,
        ThoiGian: item.ThoiGianChiDinh,
        TrangThai: item.KetQuaCLS ? "DA_CO_KET_QUA" : "CHO_THUC_HIEN",
      }));
    },
    updateResult: async (dto: UpdateServiceResultDto): Promise<SuDungDv> => {
      // If dto.id is passed as MaLuotKham_MaDV, split it
      let maLuotKham = dto.maLuotKham;
      let maDV = dto.maDV;
      if (dto.id && dto.id.includes("_")) {
        const parts = dto.id.split("_");
        maLuotKham = parts[0];
        maDV = parts[1];
      }

      const payload = {
        maLuotKham: maLuotKham || "",
        maDV: maDV || "",
        thoiGianChiDinh: dto.thoiGianChiDinh || new Date().toISOString(),
        ketQuaCLS: dto.ketQuaCLS || dto.KetQua || "",
        maKTVThucHien: dto.maKTVThucHien || dto.NhanVienThucHien || "DD01",
      };

      const res = await api.patch<any>("/services/result", payload);
      return {
        ...res.data,
        MaSD: `${res.data.MaLuotKham}_${res.data.MaDV}`,
        MaLK: res.data.MaLuotKham,
        ThoiGian: res.data.ThoiGianChiDinh,
        TrangThai: "DA_CO_KET_QUA",
      };
    },
  },

  // 8. Phân hệ Điều trị Nội trú & Phân giường (Inpatient Stay)
  inpatient: {
    admit: async (dto: AdmitPatientDto): Promise<any> => {
      const payload = {
        maBN: dto.maBN || dto.MaBN || "",
        soHoSoBenhAn: dto.soHoSoBenhAn,
        ngayXuatVienDuKien: dto.ngayXuatVienDuKien,
        chanDoanNhapVien: dto.chanDoanNhapVien || dto.ChanDoanVaoVien || "Theo dõi điều trị nội trú",
        tinhTrangNhapVien: dto.tinhTrangNhapVien || "Vua",
        maBSTheoDoi: dto.maBSTheoDoi || dto.BacSiDieuTri || "BS01",
      };
      const res = await api.post("/inpatient/admit", payload);
      return res.data;
    },
    assignBed: async (dto: AssignBedDto): Promise<PhanGiuong> => {
      const payload = {
        maBN: dto.maBN || dto.MaBN || "",
        maGiuong: dto.maGiuong || dto.MaGiuong || "",
        ghiChu: dto.ghiChu,
      };
      const res = await api.post<PhanGiuong>("/inpatient/assign-bed", payload);
      return res.data;
    },
    transferBed: async (dto: TransferBedDto): Promise<PhanGiuong> => {
      const payload = {
        maBN: dto.maBN || dto.MaBN || "",
        maGiuongMoi: dto.maGiuongMoi || dto.GiuongMoi || "",
        lyDoChuyen: dto.lyDoChuyen || dto.LyDoChuyen || "Chuyển buồng điều trị",
      };
      const res = await api.post<PhanGiuong>("/inpatient/transfer-bed", payload);
      return res.data;
    },
    getPatients: async (): Promise<any[]> => {
      const res = await api.get<any[]>("/inpatient/patients");
      return res.data;
    },
  },

  // 9. Phân hệ Quyết toán Viện phí & Hóa đơn (Billing)
  billing: {
    calculateFee: async (examId: string): Promise<FeeCalculationResponse> => {
      const res = await api.post<any>(`/billing/calculate/${examId}`);
      const data = res.data;
      return {
        maLuotKham: data.maLuotKham,
        examId: data.maLuotKham,
        patientName: data.benhNhan?.hoTen,
        bhytNumber: data.benhNhan?.soBHYT,
        coverageRate: data.benhNhan?.mucHuongBHYT ? data.benhNhan.mucHuongBHYT / 100 : 0,
        examFee: data.chiTiet?.tienKham || 0,
        medicineFee: data.chiTiet?.tienThuoc || 0,
        serviceFee: data.chiTiet?.tienDichVu || 0,
        totalCost: data.tongTienGoc || 0,
        bhytPaid: data.tienBHYTChiTra || 0,
        patientPaid: data.tienBenhNhanTra || 0,
        benhNhan: data.benhNhan,
        chiTiet: data.chiTiet,
        tongTienGoc: data.tongTienGoc,
        tienBHYTChiTra: data.tienBHYTChiTra,
        tienBenhNhanTra: data.tienBenhNhanTra,
      };
    },
    createInvoice: async (dto: CreateInvoiceDto): Promise<HoaDon> => {
      const payload = {
        maHD: dto.maHD,
        maLuotKham: dto.maLuotKham || dto.MaLK || "",
        maNVThuNgan: dto.maNVThuNgan || dto.NhanVienThu || "NV_TN_01",
        phuongThucTT: (dto.phuongThucTT || dto.HinhThucTT || PhuongThucTTEnum.TIEN_MAT) as PhuongThucTTEnum,
      };
      const res = await api.post<any>("/billing/invoices", payload);
      return {
        ...res.data,
        MaLK: res.data.MaLuotKham,
        SoTien: res.data.TienBenhNhanTra,
        TrangThai: res.data.TrangThaiTT,
        HinhThucTT: res.data.PhuongThucTT,
      };
    },
    webhookVietQr: async (dto: VietQrWebhookDto): Promise<any> => {
      const payload = {
        maHD: dto.maHD || dto.invoiceId || "",
        amount: Number(dto.amount),
        transactionId: dto.transactionId,
        signature: dto.signature,
      };
      const res = await api.post("/billing/webhook/vietqr", payload);
      return res.data;
    },
    getInvoiceById: async (id: string): Promise<HoaDon> => {
      const res = await api.get<any>(`/billing/invoices/${id}`);
      return {
        ...res.data,
        MaLK: res.data.MaLuotKham,
        SoTien: res.data.TienBenhNhanTra,
        TrangThai: res.data.TrangThaiTT,
        HinhThucTT: res.data.PhuongThucTT,
      };
    },
    downloadPdf: async (id: string): Promise<Blob> => {
      const res = await api.get(`/billing/invoices/${id}/pdf`, {
        responseType: "blob",
      });
      return res.data;
    },
  },

  // 10. Phân hệ Lịch trực & Chấm công (Duty Schedule)
  dutySchedule: {
    create: async (dto: CreateDutyScheduleDto): Promise<LichTruc> => {
      const payload = {
        maNV: dto.maNV || dto.MaNV || "BS01",
        ngayTruc: dto.ngayTruc || dto.NgayTruc || new Date().toISOString().split("T")[0],
        caTruc: dto.caTruc || dto.CaTruc || CaTrucEnum.SANG,
        maPhong: dto.maPhong || "P01",
        vaiTroTruc: dto.vaiTroTruc || dto.GhiChu || "Trực thường quy",
        trangThaiDiemDanh: dto.trangThaiDiemDanh || TrangThaiDiemDanhEnum.CHUA_DIEM_DANH,
      };
      const res = await api.post<any>("/duty-schedules", payload);
      return {
        ...res.data,
        GhiChu: res.data.VaiTroTruc,
      };
    },
    getSchedules: async (startDate?: string, endDate?: string, maNV?: string): Promise<LichTruc[]> => {
      const res = await api.get<any[]>("/duty-schedules", {
        params: { startDate, endDate, maNV },
      });
      return res.data.map((sc) => ({
        ...sc,
        GhiChu: sc.VaiTroTruc,
      }));
    },
    updateAttendance: async (
      maNV: string,
      ngayTruc: string,
      caTruc: CaTrucEnum,
      status: TrangThaiDiemDanhEnum,
    ): Promise<LichTruc> => {
      const res = await api.patch<any>("/duty-schedules/attendance", null, {
        params: { maNV, ngayTruc, caTruc, status },
      });
      return {
        ...res.data,
        GhiChu: res.data.VaiTroTruc,
      };
    },
  },

  // 11. Phân hệ Báo cáo & Dashboard Thống kê (Reports)
  report: {
    getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
      const res = await api.get<any>("/reports/dashboard");
      const d = res.data;
      return {
        totalRevenue: d.revenue?.tongDoanhThu || 0,
        todayRevenue: d.revenue?.tongBenhNhanThanhToan || 0,
        totalExaminations: d.overview?.totalExaminations || 0,
        activeInpatients: d.overview?.totalInpatients || 0,
        bedOccupancy: d.overview?.bedOccupancyRate || 0,
        roomStats: [],
        overview: d.overview,
        revenue: d.revenue,
      };
    },
  },
};
