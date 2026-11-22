import { api } from "@/lib/api";
import {
  AuthLoginResponse,
  BacSi,
  BenhNhan,
  BillingPreviewResponse,
  CompleteLabRequestDto,
  CreateAdmissionDto,
  CreateBedAllocationDto,
  CreateDepartmentDto,
  CreateExaminationDto,
  CreateInsuranceCardDto,
  CreateInvoiceDto,
  CreateLabRequestDto,
  CreatePatientDto,
  CreatePrescriptionDto,
  CreateRoomDto,
  CreateStaffDto,
  DashboardReportResponse,
  DieuDuong,
  DischargeAdmissionDto,
  DonThuoc,
  DotNoiTru,
  GiuongBenh,
  Khoa,
  KyThuatVien,
  LoaiXetNghiem,
  LuotKham,
  NhanVien,
  PayInvoiceDto,
  PhanGiuong,
  PhieuXetNghiem,
  Phong,
  StartLabRequestDto,
  TheBHYT,
  Thuoc,
  TransferBedDto,
  UpdateBedStatusDto,
  UpdateDepartmentDto,
  UpdateExaminationDto,
  UpdatePrescriptionDto,
  UpdateRoomDto,
  VienPhi,
} from "@/types";

export const hospitalApi = {
  auth: {
    login: async (payload: { username: string; password: string }): Promise<AuthLoginResponse> => {
      const { data } = await api.post("/auth/login", payload);
      return data;
    },
    getProfile: async (): Promise<NhanVien> => {
      const { data } = await api.get("/auth/profile");
      return data;
    },
  },

  department: {
    getAll: async (): Promise<Khoa[]> => {
      const { data } = await api.get("/departments");
      return data;
    },
    getOne: async (maKhoa: string): Promise<Khoa> => {
      const { data } = await api.get(`/departments/${encodeURIComponent(maKhoa)}`);
      return data;
    },
    create: async (dto: CreateDepartmentDto): Promise<Khoa> => {
      const { data } = await api.post("/departments", dto);
      return data;
    },
    update: async (maKhoa: string, dto: UpdateDepartmentDto): Promise<Khoa> => {
      const { data } = await api.patch(`/departments/${encodeURIComponent(maKhoa)}`, dto);
      return data;
    },
    getRooms: async (maKhoa?: string): Promise<Phong[]> => {
      const { data } = await api.get("/rooms", { params: maKhoa ? { maKhoa } : undefined });
      return data;
    },
    createRoom: async (dto: CreateRoomDto): Promise<Phong> => {
      const { data } = await api.post("/rooms", dto);
      return data;
    },
    updateRoom: async (maPhong: string, dto: UpdateRoomDto): Promise<Phong> => {
      const { data } = await api.patch(`/rooms/${encodeURIComponent(maPhong)}`, dto);
      return data;
    },
    getBedMap: async (date?: string, maKhoa?: string): Promise<GiuongBenh[]> => {
      const { data } = await api.get("/beds/map", {
        params: {
          ...(date ? { date } : {}),
          ...(maKhoa ? { maKhoa } : {}),
        },
      });
      return data;
    },
    updateBedStatus: async (maGiuong: string, dto: UpdateBedStatusDto): Promise<GiuongBenh> => {
      const { data } = await api.patch(`/beds/${encodeURIComponent(maGiuong)}/status`, dto);
      return data;
    },
  },

  staff: {
    getAll: async (params?: { loaiChuyenMon?: string; maKhoa?: string }): Promise<NhanVien[]> => {
      const { data } = await api.get("/staff", { params });
      return data;
    },
    getDoctors: async (): Promise<BacSi[]> => {
      const { data } = await api.get("/staff/doctors");
      return data;
    },
    getNurses: async (): Promise<DieuDuong[]> => {
      const { data } = await api.get("/staff/nurses");
      return data;
    },
    getTechnicians: async (): Promise<KyThuatVien[]> => {
      const { data } = await api.get("/staff/technicians");
      return data;
    },
    getOne: async (maNV: string): Promise<NhanVien> => {
      const { data } = await api.get(`/staff/${encodeURIComponent(maNV)}`);
      return data;
    },
    create: async (dto: CreateStaffDto): Promise<NhanVien> => {
      const { data } = await api.post("/staff", dto);
      return data;
    },
  },

  patient: {
    create: async (dto: CreatePatientDto): Promise<BenhNhan> => {
      const { data } = await api.post("/patients", dto);
      return data;
    },
    lookup: async (q: string): Promise<BenhNhan[]> => {
      const { data } = await api.get("/patients/lookup", { params: { q } });
      return data;
    },
    getAll: async (
      page = 1,
      limit = 50,
    ): Promise<{
      data: BenhNhan[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }> => {
      const { data } = await api.get("/patients", { params: { page, limit } });
      return data;
    },
    createInsuranceCard: async (maBN: string, dto: CreateInsuranceCardDto): Promise<TheBHYT> => {
      const { data } = await api.post(
        `/patients/${encodeURIComponent(maBN)}/insurance-cards`,
        dto,
      );
      return data;
    },
    getInsuranceCards: async (maBN: string, validAt?: string): Promise<TheBHYT[]> => {
      const { data } = await api.get(`/patients/${encodeURIComponent(maBN)}/insurance-cards`, {
        params: validAt ? { validAt } : undefined,
      });
      return data;
    },
  },

  examination: {
    create: async (dto: CreateExaminationDto): Promise<LuotKham> => {
      const { data } = await api.post("/examinations", dto);
      return data;
    },
    update: async (maLuotKham: string, dto: UpdateExaminationDto): Promise<LuotKham> => {
      const { data } = await api.patch(`/examinations/${encodeURIComponent(maLuotKham)}`, dto);
      return data;
    },
    getDetail: async (maLuotKham: string): Promise<LuotKham> => {
      const { data } = await api.get(`/examinations/${encodeURIComponent(maLuotKham)}`);
      return data;
    },
    getAll: async (params?: { status?: string; maBN?: string }): Promise<LuotKham[]> => {
      const { data } = await api.get("/examinations", { params });
      return data;
    },
  },

  prescription: {
    getMedicines: async (): Promise<Thuoc[]> => {
      const { data } = await api.get("/medicines");
      return data;
    },
    create: async (dto: CreatePrescriptionDto): Promise<DonThuoc> => {
      const { data } = await api.post("/prescriptions", dto);
      return data;
    },
    update: async (maDonThuoc: string, dto: UpdatePrescriptionDto): Promise<DonThuoc> => {
      const { data } = await api.patch(`/prescriptions/${encodeURIComponent(maDonThuoc)}`, dto);
      return data;
    },
    remove: async (maDonThuoc: string): Promise<{ deleted: boolean; MaDonThuoc: string }> => {
      const { data } = await api.delete(`/prescriptions/${encodeURIComponent(maDonThuoc)}`);
      return data;
    },
    getDetail: async (maDonThuoc: string): Promise<DonThuoc> => {
      const { data } = await api.get(`/prescriptions/${encodeURIComponent(maDonThuoc)}`);
      return data;
    },
  },

  lab: {
    getTypes: async (): Promise<LoaiXetNghiem[]> => {
      const { data } = await api.get("/lab-types");
      return data;
    },
    getRequests: async (params?: {
      status?: "PENDING" | "WAITING" | "IN_PROGRESS" | "COMPLETED";
      maLuotKham?: string;
    }): Promise<PhieuXetNghiem[]> => {
      const { data } = await api.get("/lab-requests", { params });
      return data;
    },
    createRequest: async (dto: CreateLabRequestDto): Promise<PhieuXetNghiem> => {
      const { data } = await api.post("/lab-requests", dto);
      return data;
    },
    startRequest: async (
      maPhieuXN: string,
      dto: StartLabRequestDto = {},
    ): Promise<PhieuXetNghiem> => {
      const { data } = await api.patch(
        `/lab-requests/${encodeURIComponent(maPhieuXN)}/start`,
        dto,
      );
      return data;
    },
    completeRequest: async (
      maPhieuXN: string,
      dto: CompleteLabRequestDto,
    ): Promise<PhieuXetNghiem> => {
      const { data } = await api.patch(
        `/lab-requests/${encodeURIComponent(maPhieuXN)}/complete`,
        dto,
      );
      return data;
    },
    deleteRequest: async (maPhieuXN: string): Promise<{ deleted: boolean; MaPhieuXN: string }> => {
      const { data } = await api.delete(`/lab-requests/${encodeURIComponent(maPhieuXN)}`);
      return data;
    },
  },

  inpatient: {
    getAdmissions: async (openOnly?: boolean, maBN?: string): Promise<DotNoiTru[]> => {
      const { data } = await api.get("/inpatient/admissions", {
        params: {
          ...(openOnly !== undefined ? { openOnly: String(openOnly) } : {}),
          ...(maBN ? { maBN } : {}),
        },
      });
      return data;
    },
    admit: async (dto: CreateAdmissionDto): Promise<DotNoiTru> => {
      const { data } = await api.post("/inpatient/admissions", dto);
      return data;
    },
    allocateBed: async (dto: CreateBedAllocationDto): Promise<PhanGiuong> => {
      const { data } = await api.post("/inpatient/bed-allocations", dto);
      return data;
    },
    transferBed: async (dto: TransferBedDto): Promise<{ closed: PhanGiuong; opened: PhanGiuong }> => {
      const { data } = await api.post("/inpatient/transfer-bed", dto);
      return data;
    },
    discharge: async (maDotNT: string, dto: DischargeAdmissionDto): Promise<DotNoiTru> => {
      const { data } = await api.patch(
        `/inpatient/admissions/${encodeURIComponent(maDotNT)}/discharge`,
        dto,
      );
      return data;
    },
  },

  billing: {
    preview: async (maLuotKham: string): Promise<BillingPreviewResponse> => {
      const { data } = await api.get(`/billing/preview/${encodeURIComponent(maLuotKham)}`);
      return data;
    },
    createInvoice: async (dto: CreateInvoiceDto): Promise<VienPhi> => {
      const { data } = await api.post("/billing/invoices", dto);
      return data;
    },
    payInvoice: async (maHoaDon: string, dto: PayInvoiceDto = {}): Promise<VienPhi> => {
      const { data } = await api.patch(
        `/billing/invoices/${encodeURIComponent(maHoaDon)}/pay`,
        dto,
      );
      return data;
    },
    getInvoice: async (maHoaDon: string): Promise<VienPhi> => {
      const { data } = await api.get(`/billing/invoices/${encodeURIComponent(maHoaDon)}`);
      return data;
    },
  },

  report: {
    getDashboard: async (date?: string): Promise<DashboardReportResponse> => {
      const { data } = await api.get("/reports/dashboard", {
        params: date ? { date } : undefined,
      });
      return data;
    },
  },
};
