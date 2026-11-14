"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bed,
  BedDouble,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Hospital,
  Layers,
  LogIn,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import {
  BacSi,
  BnNoiTru,
  GiuongBenh,
  Khoa,
  LoaiGiuongEnum,
  LoaiPhongEnum,
  RoleEnum,
  TrangThaiGiuongEnum,
} from "@/types";

type InpatientTab = "admit" | "assign" | "transfer";
type TinhTrangNhapVien = "Nhe" | "Vua" | "Nang" | "Nguy_kich";

const TINH_TRANG_LABELS: Record<
  TinhTrangNhapVien,
  { label: string; badgeClass: string; dot?: boolean }
> = {
  Nhe: {
    label: "Nhẹ",
    badgeClass: "bg-emerald-100 text-emerald-800",
  },
  Vua: {
    label: "Vừa",
    badgeClass: "bg-amber-100 text-amber-900",
  },
  Nang: {
    label: "Nặng",
    badgeClass: "bg-orange-100 text-orange-900",
  },
  Nguy_kich: {
    label: "Nguy kịch",
    badgeClass: "bg-[#ffdad6] text-[#93000a]",
    dot: true,
  },
};

const LOAI_GIUONG_LABELS: Record<LoaiGiuongEnum, { label: string; badgeClass: string }> = {
  [LoaiGiuongEnum.TIEU_CHUAN]: {
    label: "TIÊU CHUẨN",
    badgeClass: "bg-slate-100 text-slate-700",
  },
  [LoaiGiuongEnum.VIP]: {
    label: "VIP",
    badgeClass: "bg-purple-100 text-purple-900",
  },
  [LoaiGiuongEnum.CAP_CUU]: {
    label: "CẤP CỨU",
    badgeClass: "bg-rose-100 text-rose-800",
  },
  [LoaiGiuongEnum.HOI_SUC]: {
    label: "HỒI SỨC",
    badgeClass: "bg-indigo-100 text-indigo-900",
  },
};

const LOAI_PHONG_LABELS: Record<string, string> = {
  NOI_TRU: "Buồng Nội Trú",
  CAP_CUU: "Buồng Cấp Cứu",
  KHAM: "Phòng Khám",
  XET_NGHIEM: "Phòng Xét Nghiệm",
};

function calcAge(ngaySinh?: string | null): string {
  if (!ngaySinh) return "—";
  const dob = new Date(ngaySinh);
  if (Number.isNaN(dob.getTime())) return "—";
  const diff = Date.now() - dob.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return age >= 0 ? `${age}T` : "—";
}

function formatGender(g?: string | null): string {
  if (g === "NAM") return "Nam";
  if (g === "NU") return "Nữ";
  return "Khác";
}

function formatVnd(val?: string | number | null): string {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return "0 đ";
  return `${num.toLocaleString("vi-VN")} đ`;
}

function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name?: string | null): string {
  if (!name) return "BN";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function InpatientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, hydrate } = useAuthStore();
  const { showToast } = useToastStore();

  const [hydrated, setHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [selectedKhoa, setSelectedKhoa] = useState<string>("ALL");
  const [selectedPhong, setSelectedPhong] = useState<string>("ALL");
  const [selectedLoaiGiuong, setSelectedLoaiGiuong] = useState<string>("ALL");
  const [selectedTrangThai, setSelectedTrangThai] = useState<string>("ALL");

  // Search & Pagination
  const [globalSearch, setGlobalSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Right Panel Tabs & Selection
  const [activeTab, setActiveTab] = useState<InpatientTab>("assign");
  const [selectedMaBN, setSelectedMaBN] = useState<string>("");

  // Form 1: Admit Patient (AdmitPatientDto)
  const [admitForm, setAdmitForm] = useState<{
    maBN: string;
    soHoSoBenhAn: string;
    ngayXuatVienDuKien: string;
    chanDoanNhapVien: string;
    tinhTrangNhapVien: TinhTrangNhapVien;
    maBSTheoDoi: string;
  }>({
    maBN: "",
    soHoSoBenhAn: "",
    ngayXuatVienDuKien: "",
    chanDoanNhapVien: "",
    tinhTrangNhapVien: "Vua",
    maBSTheoDoi: "",
  });
  const [lookupName, setLookupName] = useState<string | null>(null);

  // Form 2: Assign Bed (AssignBedDto)
  const [assignForm, setAssignForm] = useState({
    maBN: "",
    maGiuong: "",
    ghiChu: "",
  });

  // Form 3: Transfer Bed (TransferBedDto)
  const [transferForm, setTransferForm] = useState({
    maBN: "",
    maGiuongMoi: "",
    lyDoChuyen: "Chuyển buồng điều trị theo chỉ định chuyên môn",
  });

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // Ctrl+K shortcut for quick search & F5 refresh
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Queries (Tuân thủ React Query Keys trong API_Contract_v1.md Mục 6)
  const {
    data: beds = [],
    isLoading: bedsLoading,
    isFetching: bedsFetching,
  } = useQuery<GiuongBenh[]>({
    queryKey: ["beds", "map"],
    queryFn: () => hospitalApi.department.getBedMap(),
    enabled: hydrated && isAuthenticated,
    refetchInterval: 15000, // Tự động đồng bộ 15s
  });

  const { data: inpatientList = [], isLoading: inpatientsLoading } = useQuery<BnNoiTru[]>({
    queryKey: ["inpatients", "list"],
    queryFn: () => hospitalApi.inpatient.getPatients(),
    enabled: hydrated && isAuthenticated,
    refetchInterval: 15000,
  });

  const { data: departments = [] } = useQuery<Khoa[]>({
    queryKey: ["departments", "list"],
    queryFn: () => hospitalApi.department.getAll(),
    enabled: hydrated && isAuthenticated,
  });

  const { data: doctors = [] } = useQuery<BacSi[]>({
    queryKey: ["doctors", "list"],
    queryFn: () => hospitalApi.staff.getDoctors(),
    enabled: hydrated && isAuthenticated,
  });

  // Default doctor for admit form
  useEffect(() => {
    if (doctors.length > 0 && !admitForm.maBSTheoDoi) {
      setAdmitForm((prev) => ({ ...prev, maBSTheoDoi: doctors[0].MaNV }));
    }
  }, [doctors, admitForm.maBSTheoDoi]);

  // Map MaBN -> BnNoiTru for quick lookup
  const inpatientByMaBN = useMemo(() => {
    const map = new Map<string, BnNoiTru>();
    inpatientList.forEach((inp) => {
      map.set(inp.MaBN, inp);
    });
    return map;
  }, [inpatientList]);

  // Auto-select first inpatient if none selected
  useEffect(() => {
    if (inpatientList.length > 0 && !selectedMaBN) {
      const waitingPatient = inpatientList.find(
        (p) => !p.phanGiuongs || p.phanGiuongs.length === 0,
      );
      const target = waitingPatient || inpatientList[0];
      setSelectedMaBN(target.MaBN);
      setAssignForm((prev) => ({ ...prev, maBN: target.MaBN }));
      setTransferForm((prev) => ({ ...prev, maBN: target.MaBN }));
    }
  }, [inpatientList, selectedMaBN]);

  const selectedInpatient = useMemo(
    () => inpatientList.find((p) => p.MaBN === selectedMaBN) || null,
    [inpatientList, selectedMaBN],
  );

  // Available NOI_TRU beds (Ràng buộc C02: chỉ phòng NOI_TRU & trạng thái TRONG)
  const availableInpatientBeds = useMemo(
    () =>
      beds.filter(
        (b) =>
          (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.TRONG &&
          b.phong?.LoaiPhong === LoaiPhongEnum.NOI_TRU,
      ),
    [beds],
  );

  useEffect(() => {
    if (availableInpatientBeds.length > 0) {
      if (!assignForm.maGiuong) {
        setAssignForm((prev) => ({
          ...prev,
          maGiuong: availableInpatientBeds[0].MaGiuong,
        }));
      }
      if (!transferForm.maGiuongMoi) {
        setTransferForm((prev) => ({
          ...prev,
          maGiuongMoi: availableInpatientBeds[0].MaGiuong,
        }));
      }
    }
  }, [availableInpatientBeds, assignForm.maGiuong, transferForm.maGiuongMoi]);

  // KPI Metrics
  const kpiStats = useMemo(() => {
    const total = beds.length;
    const empty = beds.filter(
      (b) => (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.TRONG,
    ).length;
    const occupied = beds.filter(
      (b) => (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.DANG_SU_DUNG,
    ).length;
    const maintenance = beds.filter(
      (b) => (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.BAO_TRI,
    ).length;
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : "0.0";
    return { total, empty, occupied, maintenance, occupancyRate };
  }, [beds]);

  // Unique rooms list for filter dropdown
  const uniqueRooms = useMemo(() => {
    const map = new Map<string, { MaPhong: string; SoPhong: string; Tang: number | null; MaKhoa: string }>();
    beds.forEach((b) => {
      if (b.phong && !map.has(b.MaPhong)) {
        map.set(b.MaPhong, {
          MaPhong: b.MaPhong,
          SoPhong: b.phong.SoPhong,
          Tang: b.phong.Tang ?? null,
          MaKhoa: b.phong.MaKhoa,
        });
      }
    });
    return Array.from(map.values()).filter(
      (r) => selectedKhoa === "ALL" || r.MaKhoa === selectedKhoa,
    );
  }, [beds, selectedKhoa]);

  // Filtered beds grouped by Room
  const groupedRooms = useMemo(() => {
    const filtered = beds.filter((b) => {
      if (selectedKhoa !== "ALL" && b.phong?.MaKhoa !== selectedKhoa) return false;
      if (selectedPhong !== "ALL" && b.MaPhong !== selectedPhong) return false;
      if (selectedLoaiGiuong !== "ALL" && b.LoaiGiuong !== selectedLoaiGiuong) return false;
      const status = b.TrangThaiGiuong || b.TrangThai;
      if (selectedTrangThai !== "ALL" && status !== selectedTrangThai) return false;
      return true;
    });

    const roomMap = new Map<
      string,
      {
        maPhong: string;
        soPhong: string;
        loaiPhong: string;
        tang: number | null;
        tenKhoa: string;
        beds: GiuongBenh[];
      }
    >();

    filtered.forEach((b) => {
      const key = b.MaPhong;
      if (!roomMap.has(key)) {
        roomMap.set(key, {
          maPhong: b.MaPhong,
          soPhong: b.phong?.SoPhong || b.MaPhong,
          loaiPhong: b.phong?.LoaiPhong || "NOI_TRU",
          tang: b.phong?.Tang ?? null,
          tenKhoa: b.phong?.khoa?.TenKhoa || "Khoa Nội Trú",
          beds: [],
        });
      }
      roomMap.get(key)!.beds.push(b);
    });

    return Array.from(roomMap.values());
  }, [beds, selectedKhoa, selectedPhong, selectedLoaiGiuong, selectedTrangThai]);

  // Filtered Inpatient Table
  const filteredInpatients = useMemo(() => {
    const q = (tableSearch || globalSearch).trim().toLowerCase();
    if (!q) return inpatientList;
    return inpatientList.filter((p) => {
      const name = p.benhNhan?.HoTen?.toLowerCase() || "";
      const maBN = p.MaBN.toLowerCase();
      const hsba = p.SoHoSoBenhAn.toLowerCase();
      const diag = p.ChanDoanNhapVien.toLowerCase();
      const cccd = p.benhNhan?.CCCD?.toLowerCase() || "";
      const bhyt = p.benhNhan?.SoBHYT?.toLowerCase() || "";
      return (
        name.includes(q) ||
        maBN.includes(q) ||
        hsba.includes(q) ||
        diag.includes(q) ||
        cccd.includes(q) ||
        bhyt.includes(q)
      );
    });
  }, [inpatientList, tableSearch, globalSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredInpatients.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInpatients = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredInpatients.slice(start, start + pageSize);
  }, [filteredInpatients, safePage]);

  // Invalidate all inpatient-related queries per API_Contract_v1.md Section 6
  const invalidateInpatientQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["beds", "map"] });
    queryClient.invalidateQueries({ queryKey: ["inpatients", "list"] });
    queryClient.invalidateQueries({ queryKey: ["rooms", "available"] });
    queryClient.invalidateQueries({ queryKey: ["reports", "dashboard"] });
  };

  // Mutations
  const admitMutation = useMutation({
    mutationFn: () =>
      hospitalApi.inpatient.admit({
        maBN: admitForm.maBN.trim(),
        soHoSoBenhAn: admitForm.soHoSoBenhAn.trim() || undefined,
        ngayXuatVienDuKien: admitForm.ngayXuatVienDuKien || undefined,
        chanDoanNhapVien: admitForm.chanDoanNhapVien.trim(),
        tinhTrangNhapVien: admitForm.tinhTrangNhapVien,
        maBSTheoDoi: admitForm.maBSTheoDoi,
      }),
    onSuccess: (res) => {
      showToast(
        "success",
        `Đã lập hồ sơ nội trú ${res.SoHoSoBenhAn || ""} cho bệnh nhân ${res.MaBN}. Sẵn sàng phân giường!`,
        "Nhập viện thành công",
      );
      setSelectedMaBN(res.MaBN);
      setAssignForm((prev) => ({ ...prev, maBN: res.MaBN }));
      setTransferForm((prev) => ({ ...prev, maBN: res.MaBN }));
      setAdmitForm((prev) => ({
        ...prev,
        maBN: "",
        soHoSoBenhAn: "",
        chanDoanNhapVien: "",
      }));
      setLookupName(null);
      setActiveTab("assign");
      invalidateInpatientQueries();
    },
    onError: (err: any) => {
      showToast(
        "error",
        err?.response?.data?.message || "Không thể lập hồ sơ nhập viện.",
        "Lỗi nhập viện",
      );
    },
  });

  const assignBedMutation = useMutation({
    mutationFn: () =>
      hospitalApi.inpatient.assignBed({
        maBN: assignForm.maBN.trim(),
        maGiuong: assignForm.maGiuong,
        ghiChu: assignForm.ghiChu.trim() || undefined,
      }),
    onSuccess: (res) => {
      showToast(
        "success",
        `Đã cấp giường ${res.MaGiuong} cho bệnh nhân ${res.MaBN} (Serializable Lock).`,
        "Phân giường thành công",
      );
      setAssignForm((prev) => ({ ...prev, ghiChu: "" }));
      invalidateInpatientQueries();
    },
    onError: (err: any) => {
      showToast(
        "error",
        err?.response?.data?.message ||
          "Không thể phân giường (giường có thể vừa được cấp cho bệnh nhân khác).",
        "Lỗi phân giường (BR02)",
      );
    },
  });

  const transferBedMutation = useMutation({
    mutationFn: () =>
      hospitalApi.inpatient.transferBed({
        maBN: transferForm.maBN.trim(),
        maGiuongMoi: transferForm.maGiuongMoi,
        lyDoChuyen: transferForm.lyDoChuyen.trim(),
      }),
    onSuccess: (res) => {
      showToast(
        "success",
        `Đã chuyển bệnh nhân ${res.MaBN} sang giường ${res.MaGiuong}. Giường cũ chuyển sang BẢO TRÌ (BR01).`,
        "Luân chuyển thành công",
      );
      invalidateInpatientQueries();
    },
    onError: (err: any) => {
      showToast(
        "error",
        err?.response?.data?.message || "Không thể chuyển giường.",
        "Lỗi chuyển giường",
      );
    },
  });

  const handleRefreshAll = () => {
    invalidateInpatientQueries();
    showToast("info", "Đã đồng bộ dữ liệu sơ đồ giường & nội trú mới nhất.");
  };

  const handleSelectInpatient = (p: BnNoiTru) => {
    setSelectedMaBN(p.MaBN);
    setAssignForm((prev) => ({ ...prev, maBN: p.MaBN }));
    setTransferForm((prev) => ({ ...prev, maBN: p.MaBN }));
    const hasBed = p.phanGiuongs && p.phanGiuongs.length > 0;
    setActiveTab(hasBed ? "transfer" : "assign");
  };

  const handleClickEmptyBed = (bed: GiuongBenh) => {
    if (bed.phong?.LoaiPhong !== LoaiPhongEnum.NOI_TRU) {
      showToast(
        "error",
        `Giường ${bed.MaGiuong} thuộc phòng ${bed.phong?.LoaiPhong}, không phải phòng NOI_TRU (Ràng buộc C02).`,
      );
      return;
    }
    if (activeTab === "transfer") {
      setTransferForm((prev) => ({ ...prev, maGiuongMoi: bed.MaGiuong }));
    } else {
      setActiveTab("assign");
      setAssignForm((prev) => ({ ...prev, maGiuong: bed.MaGiuong }));
    }
    showToast("info", `Đã chọn giường ${bed.phong?.SoPhong || bed.MaPhong} - ${bed.SoGiuong} (${bed.MaGiuong}).`);
  };

  const handleClickTransferFromBed = (bed: GiuongBenh) => {
    const activeAlloc = bed.phanGiuongs?.[0];
    if (!activeAlloc) return;
    setSelectedMaBN(activeAlloc.MaBN);
    setTransferForm((prev) => ({ ...prev, maBN: activeAlloc.MaBN }));
    setAssignForm((prev) => ({ ...prev, maBN: activeAlloc.MaBN }));
    setActiveTab("transfer");
  };

  const handleLookupPatientForAdmit = async () => {
    if (!admitForm.maBN.trim()) return;
    try {
      const bn = await hospitalApi.patient.lookup(admitForm.maBN.trim());
      setAdmitForm((prev) => ({ ...prev, maBN: bn.MaBN }));
      setLookupName(`${bn.HoTen} (${formatGender(bn.GioiTinh)}, ${calcAge(bn.NgaySinh)})`);
      showToast("success", `Tìm thấy bệnh nhân: ${bn.HoTen} (${bn.MaBN})`);
    } catch {
      setLookupName(null);
      showToast("error", "Không tìm thấy bệnh nhân theo mã/CCCD/BHYT đã nhập.");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "SoHSBA",
      "MaBN",
      "HoTen",
      "ChanDoanNhapVien",
      "TinhTrang",
      "GiuongHienTai",
      "BacSiTheoDoi",
      "NgayNhapVien",
    ];
    const rows = filteredInpatients.map((p) => {
      const curBed = p.phanGiuongs?.[0]?.giuongBenh;
      const bedLabel = curBed ? `${curBed.phong?.SoPhong || curBed.MaPhong} - ${curBed.SoGiuong}` : "Cho cap";
      const docName = p.bacSiTheoDoi?.nhanVien?.HoTen || p.MaBSTheoDoi;
      return [
        p.SoHoSoBenhAn,
        p.MaBN,
        p.benhNhan?.HoTen || "",
        `"${(p.ChanDoanNhapVien || "").replace(/"/g, '""')}"`,
        p.TinhTrangNhapVien,
        bedLabel,
        docName,
        formatDateShort(p.NgayNhapVien),
      ].join(",");
    });
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh_sach_noi_tru_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canAdmit = user?.role === RoleEnum.ADMIN || user?.role === RoleEnum.BAC_SI;
  const isFetching = bedsFetching || bedsLoading || inpatientsLoading;

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8f9ff] text-[#3d4947] text-sm">
        Đang xác thực phiên làm việc...
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen lg:h-screen lg:overflow-hidden flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="relative z-10 m-3 h-9 w-9 rounded-full bg-white text-[#0b1c30] flex items-center justify-center shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#bcc9c6]/40 z-30 flex items-center justify-between px-4 shrink-0 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-8 w-8 rounded-lg border border-[#bcc9c6]/50 flex items-center justify-center text-[#3d4947]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="hidden xl:flex items-center gap-1.5 text-[12px] text-[#6d7a77] shrink-0">
              <Link href="/" className="hover:text-[#00685f] transition-colors">
                Hệ thống HIS
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0b1c30] font-semibold">
                Điều trị Nội trú & Sơ đồ Giường
              </span>
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6d7a77]" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm nhanh BN (BN-xxxx), CCCD, BHYT..."
                className="w-full h-8 pl-8 pr-12 rounded-lg bg-[#eff4ff] border border-[#bcc9c6]/50 text-[12px] text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[9px] font-mono text-[#3d4947] border border-[#bcc9c6]/40">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefreshAll}
              title="Làm mới dữ liệu"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-[#00685f]" : ""}`} />
            </button>
            <div className="relative">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors"
                title="Thông báo hệ thống"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-[#bcc9c6]/50 mx-0.5" />
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#cce5ff] text-[#00476e] text-[11px] font-semibold">
              <Hospital className="w-3.5 h-3.5" />
              <span>
                {user?.maKhoa || "K01"} - {user?.tenKhoa || "Khoa Nội Tổng Hợp"}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#00685f]/20">
                {getInitials(user?.hoTen || user?.maNV)}
              </div>
              <div className="hidden 2xl:flex flex-col">
                <span className="text-[11.5px] font-semibold text-[#0b1c30] leading-tight">
                  {user?.hoTen || user?.maNV}
                </span>
                <span className="font-mono text-[9.5px] text-[#00685f] font-semibold">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 w-full p-2.5 flex flex-col gap-2 lg:overflow-hidden min-h-0">
          {/* 1. HEADER TOP KPI & BỘ LỌC SƠ ĐỒ GIƯỜNG */}
          <section className="shrink-0 bg-white rounded-xl p-2.5 shadow-xs border border-[#bcc9c6]/30 flex flex-col gap-2">
            {/* Row 1: Title & KPI Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#00685f]/10 flex items-center justify-center text-[#00685f] shrink-0">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[14px] text-[#0b1c30] font-bold leading-tight truncate">
                      Quản Lý Nội Trú & Sơ Đồ Giường Bệnh
                    </h1>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#cce5ff] text-[#004b73] font-mono text-[9.5px] uppercase font-bold whitespace-nowrap">
                      HIS-INPATIENT v4.2
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#3d4947] text-[9.5px] font-semibold whitespace-nowrap flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse" />
                      Serializable Lock (BR02)
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#3d4947] truncate">
                    Theo dõi phòng bệnh, luân chuyển bệnh nhân (BR01) & công suất lưu trú thời gian thực
                  </p>
                </div>
              </div>

              {/* KPI Pills */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[9.5px] text-emerald-700 uppercase font-semibold">TRỐNG:</span>
                  <span className="font-mono text-[11px] font-bold text-emerald-950">
                    {kpiStats.empty}{" "}
                    <span className="font-sans text-[9.5px] font-normal text-emerald-700">giường</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffdad6]/70 text-[#93000a] border border-rose-200/60">
                  <Bed className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  <span className="text-[9.5px] text-[#ba1a1a] uppercase font-semibold">ĐANG DÙNG:</span>
                  <span className="font-mono text-[11px] font-bold">{kpiStats.occupied}</span>
                  <span className="px-1 rounded bg-white/80 font-mono text-[9.5px] text-[#ba1a1a] font-bold">
                    {kpiStats.occupancyRate}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[9.5px] text-amber-800 uppercase font-semibold">BẢO TRÌ:</span>
                  <span className="font-mono text-[11px] font-bold text-amber-950">
                    {String(kpiStats.maintenance).padStart(2, "0")}{" "}
                    <span className="font-sans text-[9.5px] font-normal text-amber-700">giường</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e5eeff] text-[#0b1c30]">
                  <Layers className="w-3.5 h-3.5 text-[#6d7a77]" />
                  <span className="text-[9.5px] text-[#6d7a77] uppercase font-semibold">TỔNG:</span>
                  <span className="font-mono text-[11px] font-bold">
                    {kpiStats.total}{" "}
                    <span className="font-sans text-[9.5px] font-normal text-[#3d4947]">giường</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#eff4ff]/70 p-1.5 rounded-lg">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#bcc9c6]/30">
                  <Building2 className="w-3.5 h-3.5 text-[#00685f]" />
                  <span className="text-[10px] text-[#3d4947] whitespace-nowrap">Khoa:</span>
                  <select
                    value={selectedKhoa}
                    onChange={(e) => {
                      setSelectedKhoa(e.target.value);
                      setSelectedPhong("ALL");
                    }}
                    className="bg-transparent text-[11px] font-semibold text-[#0b1c30] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả các khoa ({departments.length})</option>
                    {departments.map((d) => (
                      <option key={d.MaKhoa} value={d.MaKhoa}>
                        {d.TenKhoa} ({d.MaKhoa})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#bcc9c6]/30">
                  <Hospital className="w-3.5 h-3.5 text-[#6d7a77]" />
                  <span className="text-[10px] text-[#3d4947] whitespace-nowrap">Phòng:</span>
                  <select
                    value={selectedPhong}
                    onChange={(e) => setSelectedPhong(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-[#0b1c30] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả phòng ({uniqueRooms.length})</option>
                    {uniqueRooms.map((r) => (
                      <option key={r.MaPhong} value={r.MaPhong}>
                        {r.SoPhong} ({r.MaPhong}) {r.Tang ? `- Tầng ${r.Tang}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#bcc9c6]/30">
                  <Layers className="w-3.5 h-3.5 text-[#6d7a77]" />
                  <span className="text-[10px] text-[#3d4947] whitespace-nowrap">Loại:</span>
                  <select
                    value={selectedLoaiGiuong}
                    onChange={(e) => setSelectedLoaiGiuong(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-[#0b1c30] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả phân loại</option>
                    <option value={LoaiGiuongEnum.TIEU_CHUAN}>TIÊU CHUẨN</option>
                    <option value={LoaiGiuongEnum.VIP}>VIP</option>
                    <option value={LoaiGiuongEnum.CAP_CUU}>CẤP CỨU</option>
                    <option value={LoaiGiuongEnum.HOI_SUC}>HỒI SỨC</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#bcc9c6]/30">
                  <Filter className="w-3.5 h-3.5 text-[#6d7a77]" />
                  <span className="text-[10px] text-[#3d4947] whitespace-nowrap">Trạng thái:</span>
                  <select
                    value={selectedTrangThai}
                    onChange={(e) => setSelectedTrangThai(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-[#0b1c30] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={TrangThaiGiuongEnum.TRONG}>Chỉ Giường TRỐNG</option>
                    <option value={TrangThaiGiuongEnum.DANG_SU_DUNG}>ĐANG SỬ DỤNG</option>
                    <option value={TrangThaiGiuongEnum.BAO_TRI}>BẢO TRÌ / Khử trùng</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRefreshAll}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11.5px] font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#00685f] ${isFetching ? "animate-spin" : ""}`} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. KHU VỰC TRUNG TÂM — MẶT BẰNG BỐ TRÍ BUỒNG & GIƯỜNG BỆNH TRỰC QUAN */}
          <section className="shrink-0 bg-white rounded-xl p-2.5 shadow-xs border border-[#bcc9c6]/30 flex flex-col gap-2 max-h-[38vh] min-h-[190px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between pb-1.5 border-b border-[#bcc9c6]/30 shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00685f]" />
                <h2 className="text-[12.5px] text-[#0b1c30] font-bold">
                  Mặt Bằng Bố Trí Buồng & Giường Bệnh Trực Quan
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#3d4947] font-mono text-[9.5px] font-semibold">
                  {groupedRooms.length} BUỒNG BỆNH
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10.5px] text-[#6d7a77]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-emerald-500" /> Trống: Có thể cấp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-rose-500" /> Đang có BN
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-500" /> Bảo trì / Khử trùng
                </span>
                <div className="hidden sm:block h-3 w-[1px] bg-[#bcc9c6]/50" />
                <span className="hidden sm:inline font-mono text-[10px] text-[#00685f] font-semibold">
                  Tự động đồng bộ 15s
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {groupedRooms.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6d7a77]">
                  {bedsLoading
                    ? "Đang tải sơ đồ giường bệnh..."
                    : "Không có giường bệnh nào khớp với bộ lọc hiện tại."}
                </div>
              ) : (
                groupedRooms.map((room) => {
                  const occCount = room.beds.filter(
                    (b) => (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.DANG_SU_DUNG,
                  ).length;
                  const empCount = room.beds.filter(
                    (b) => (b.TrangThaiGiuong || b.TrangThai) === TrangThaiGiuongEnum.TRONG,
                  ).length;
                  const isCapCuuRoom = room.loaiPhong === LoaiPhongEnum.CAP_CUU;

                  return (
                    <div
                      key={room.maPhong}
                      className="bg-[#eff4ff]/60 rounded-lg p-2 flex flex-col gap-1.5 border border-[#bcc9c6]/20"
                    >
                      {/* Room Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold text-white ${
                              isCapCuuRoom ? "bg-[#ba1a1a]" : "bg-[#006398]"
                            }`}
                          >
                            {room.soPhong}
                          </span>
                          <span className="text-[11.5px] text-[#0b1c30] font-semibold">
                            {LOAI_PHONG_LABELS[room.loaiPhong] || room.loaiPhong}
                            {room.tang ? ` • Tầng ${room.tang}` : ""}
                          </span>
                          <span className="text-[10px] text-[#3d4947]">
                            (Sức chứa: {room.beds.length} Giường —{" "}
                            <strong className="text-rose-600 font-semibold">{occCount} Đang nằm</strong>,{" "}
                            <strong className="text-emerald-600 font-semibold">{empCount} Trống</strong>)
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#6d7a77]">{room.tenKhoa}</span>
                      </div>

                      {/* 4-column Bed Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                        {room.beds.map((bed) => {
                          const status = bed.TrangThaiGiuong || bed.TrangThai;
                          const isAvailable = status === TrangThaiGiuongEnum.TRONG;
                          const isOccupied = status === TrangThaiGiuongEnum.DANG_SU_DUNG;
                          const alloc = bed.phanGiuongs?.[0];
                          const inpDetail = alloc ? inpatientByMaBN.get(alloc.MaBN) : undefined;
                          const patientInfo = alloc?.bnNoiTru?.benhNhan || inpDetail?.benhNhan;
                          const loaiMeta =
                            LOAI_GIUONG_LABELS[bed.LoaiGiuong] ||
                            LOAI_GIUONG_LABELS[LoaiGiuongEnum.TIEU_CHUAN];

                          if (isOccupied) {
                            return (
                              <div
                                key={bed.MaGiuong}
                                className="bg-white rounded-md p-2 shadow-2xs border border-[#bcc9c6]/40 flex flex-col justify-between gap-1.5"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="font-mono text-[10.5px] font-bold text-[#0b1c30] bg-[#e5eeff] px-1.5 py-0.5 rounded">
                                      {bed.SoGiuong}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${loaiMeta.badgeClass}`}
                                    >
                                      {loaiMeta.label}
                                    </span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[8.5px] font-bold flex items-center gap-1 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    ĐANG DÙNG
                                  </span>
                                </div>

                                <div className="bg-rose-50/50 rounded p-1.5 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] font-bold text-[#0b1c30] truncate">
                                      {patientInfo?.HoTen || alloc?.MaBN || "Đang nằm viện"}
                                    </span>
                                    <span className="text-[9.5px] text-[#3d4947] shrink-0">
                                      {calcAge(patientInfo?.NgaySinh)} - {formatGender(patientInfo?.GioiTinh)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between font-mono text-[9px]">
                                    <span className="text-[#006398] font-semibold">
                                      {alloc?.MaBN || "—"}
                                    </span>
                                    <span className="text-[#6d7a77] truncate">
                                      {inpDetail?.SoHoSoBenhAn || bed.MaGiuong}
                                    </span>
                                  </div>
                                  {inpDetail?.ChanDoanNhapVien && (
                                    <div
                                      className="text-[9.5px] text-[#3d4947] truncate"
                                      title={inpDetail.ChanDoanNhapVien}
                                    >
                                      CĐ:{" "}
                                      <span className="text-[#0b1c30] font-medium">
                                        {inpDetail.ChanDoanNhapVien}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9.5px] text-[#6d7a77] truncate">
                                    {inpDetail?.bacSiTheoDoi?.nhanVien?.HoTen || formatVnd(bed.DonGiaNgay)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleClickTransferFromBed(bed)}
                                    className="px-2.5 py-1 rounded-md bg-[#cce5ff]/80 hover:bg-[#cce5ff] text-[#004b73] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                                  >
                                    <ArrowRightLeft className="w-3.5 h-3.5" /> Chuyển giường
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          if (isAvailable) {
                            const isSelectedAssign =
                              (activeTab === "assign" && assignForm.maGiuong === bed.MaGiuong) ||
                              (activeTab === "transfer" && transferForm.maGiuongMoi === bed.MaGiuong);

                            return (
                              <div
                                key={bed.MaGiuong}
                                className={`bg-emerald-50/60 rounded-md p-2 shadow-2xs border flex flex-col justify-between gap-1.5 transition-all ${
                                  isSelectedAssign
                                    ? "border-[#00685f] ring-1 ring-[#00685f]/40"
                                    : "border-emerald-200/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="font-mono text-[10.5px] font-bold text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded">
                                      {bed.SoGiuong}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${loaiMeta.badgeClass}`}
                                    >
                                      {loaiMeta.label}
                                    </span>
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8.5px] font-bold flex items-center gap-1 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    TRỐNG
                                  </span>
                                </div>

                                <div className="flex flex-col items-center justify-center py-1 text-center">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-0.5" />
                                  <span className="text-[10.5px] font-bold text-emerald-950">
                                    Giường Đã Sẵn Sàng
                                  </span>
                                  <span className="font-mono text-[9.5px] text-emerald-800 font-semibold">
                                    {formatVnd(bed.DonGiaNgay)}/ngày
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] text-emerald-700 font-mono">
                                    {bed.MaGiuong}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleClickEmptyBed(bed)}
                                    className="px-2.5 py-1 rounded-md bg-[#00685f] hover:bg-[#008378] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                                  >
                                    Cấp giường này
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // BAO_TRI
                          return (
                            <div
                              key={bed.MaGiuong}
                              className="bg-amber-50/60 rounded-md p-2 shadow-2xs border border-amber-200/70 flex flex-col justify-between gap-1.5"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span className="font-mono text-[10.5px] font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded">
                                    {bed.SoGiuong}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${loaiMeta.badgeClass}`}
                                  >
                                    {loaiMeta.label}
                                  </span>
                                </div>
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[8.5px] font-bold shrink-0">
                                  BẢO TRÌ
                                </span>
                              </div>

                              <div className="flex flex-col items-center justify-center py-1 text-center">
                                <Sparkles className="w-4 h-4 text-amber-600 mb-0.5" />
                                <span className="text-[10.5px] font-bold text-amber-950">
                                  Khử Khuẩn & Vệ Sinh
                                </span>
                                <span className="text-[9px] text-amber-800">
                                  Quy trình sau luân chuyển (BR01)
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-amber-800 font-mono">{bed.MaGiuong}</span>
                                <span className="text-[9px] text-amber-900 font-semibold">Đang chờ mở lại</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 3. KHU VỰC DƯỚI — CHIA 2 PANEL (BẢNG 7/12 + THAO TÁC 5/12) */}
          <section className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 lg:overflow-hidden">
            {/* PANEL TRÁI: BẢNG BỆNH NHÂN ĐANG ĐIỀU TRỊ NỘI TRÚ */}
            <div className="lg:col-span-7 bg-white rounded-xl p-2.5 shadow-xs border border-[#bcc9c6]/30 flex flex-col min-h-0 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between pb-2 gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00685f]" />
                  <h2 className="text-[12.5px] text-[#0b1c30] font-bold">
                    Bệnh Nhân Đang Điều Trị Nội Trú
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#005049] font-mono text-[9.5px] font-bold">
                    {filteredInpatients.length} BN
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-[#6d7a77]" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => {
                        setTableSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Tìm Tên, Mã BN, HSBA..."
                      className="w-full h-7 pl-7 pr-2 rounded-md bg-[#eff4ff] text-[11px] text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white border border-[#bcc9c6]/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="h-8 px-3 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Xuất danh sách CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto border border-[#bcc9c6]/20 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#eff4ff] text-[#3d4947] text-[9.5px] uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-1.5 px-2">SỐ HSBA</th>
                      <th className="py-1.5 px-2">MÃ & HỌ TÊN</th>
                      <th className="py-1.5 px-2">CHẨN ĐOÁN</th>
                      <th className="py-1.5 px-2 text-center">MỨC ĐỘ</th>
                      <th className="py-1.5 px-2">GIƯỜNG</th>
                      <th className="py-1.5 px-2">BÁC SĨ</th>
                      <th className="py-1.5 px-2 text-right">NGÀY VÀO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5eeff] text-[11px]">
                    {paginatedInpatients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#6d7a77]">
                          {inpatientsLoading
                            ? "Đang tải danh sách nội trú..."
                            : "Chưa có bệnh nhân nội trú nào."}
                        </td>
                      </tr>
                    ) : (
                      paginatedInpatients.map((p) => {
                        const isSelected = p.MaBN === selectedMaBN;
                        const activeBed = p.phanGiuongs?.[0]?.giuongBenh;
                        const tinhTrang =
                          TINH_TRANG_LABELS[(p.TinhTrangNhapVien as TinhTrangNhapVien) || "Vua"] ||
                          TINH_TRANG_LABELS.Vua;

                        return (
                          <tr
                            key={p.MaBN}
                            onClick={() => handleSelectInpatient(p)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-[#00685f]/8 font-medium" : "hover:bg-[#eff4ff]/60"
                            }`}
                          >
                            <td className="py-1.5 px-2 font-mono text-[10px] text-[#00685f] font-bold whitespace-nowrap">
                              {p.SoHoSoBenhAn}
                            </td>
                            <td className="py-1.5 px-2">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-[#0b1c30] truncate max-w-[140px]">
                                  {p.benhNhan?.HoTen || p.MaBN}
                                </span>
                                <span className="text-[#006398] font-mono text-[9.5px]">
                                  {p.MaBN} • {calcAge(p.benhNhan?.NgaySinh)}
                                </span>
                              </div>
                            </td>
                            <td className="py-1.5 px-2 max-w-[140px]">
                              <div className="truncate text-[#0b1c30]" title={p.ChanDoanNhapVien}>
                                {p.ChanDoanNhapVien}
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${tinhTrang.badgeClass}`}
                              >
                                {tinhTrang.dot && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping" />
                                )}
                                {tinhTrang.label}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 whitespace-nowrap">
                              {activeBed ? (
                                <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[9.5px] font-bold">
                                  {activeBed.phong?.SoPhong || activeBed.MaPhong} - {activeBed.SoGiuong}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold inline-flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-700" /> Chờ cấp
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-[#3d4947] whitespace-nowrap text-[10px]">
                              {p.bacSiTheoDoi?.nhanVien?.HoTen || p.MaBSTheoDoi}
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono text-[9.5px] text-[#6d7a77] whitespace-nowrap">
                              {formatDateShort(p.NgayNhapVien)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between pt-2 shrink-0 text-[#3d4947] text-[10px]">
                <span>
                  Hiển thị{" "}
                  <strong className="text-[#0b1c30]">
                    {filteredInpatients.length === 0 ? 0 : (safePage - 1) * pageSize + 1}-
                    {Math.min(safePage * pageSize, filteredInpatients.length)}
                  </strong>{" "}
                  trên <strong className="text-[#0b1c30]">{filteredInpatients.length}</strong> BN
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                        pg === safePage
                          ? "bg-[#00685f] text-white"
                          : "bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30]"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-6 h-6 rounded flex items-center justify-center bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* PANEL PHẢI: CARD THAO TÁC NGHIỆP VỤ NỘI TRÚ (3 TABS) */}
            <div className="lg:col-span-5 bg-white rounded-xl p-2.5 shadow-xs border border-[#bcc9c6]/30 flex flex-col min-h-0 overflow-hidden">
              {/* 3 Tabs */}
              <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg shrink-0 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("admit")}
                  className={`flex-1 py-1 px-2 rounded-md text-[10.5px] transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === "admit"
                      ? "bg-white text-[#00685f] font-bold shadow-2xs"
                      : "text-[#3d4947] hover:text-[#0b1c30] font-medium"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> 1. Nhập viện
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("assign")}
                  className={`flex-1 py-1 px-2 rounded-md text-[10.5px] transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === "assign"
                      ? "bg-white text-[#00685f] font-bold shadow-2xs"
                      : "text-[#3d4947] hover:text-[#0b1c30] font-medium"
                  }`}
                >
                  <Bed className="w-3.5 h-3.5" /> 2. Phân Giường
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transfer")}
                  className={`flex-1 py-1 px-2 rounded-md text-[10.5px] transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                    activeTab === "transfer"
                      ? "bg-white text-[#00685f] font-bold shadow-2xs"
                      : "text-[#3d4947] hover:text-[#0b1c30] font-medium"
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> 3. Chuyển Buồng
                </button>
              </div>

              {/* TAB 1: NHẬP VIỆN (AdmitPatientDto - @Roles(ADMIN, BAC_SI)) */}
              {activeTab === "admit" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!canAdmit) {
                      showToast("error", "Chỉ Bác sĩ hoặc Admin mới có quyền chỉ định nhập viện.");
                      return;
                    }
                    admitMutation.mutate();
                  }}
                  className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto pr-0.5 gap-2"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-[#0b1c30] flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#00685f]" /> Chỉ Định Nhập Viện Nội Trú
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[9px] font-bold">
                        BS / ADMIN
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#3d4947] font-semibold">
                        Mã Bệnh Nhân (hoặc CCCD / SĐT / BHYT) *
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          required
                          value={admitForm.maBN}
                          onChange={(e) => setAdmitForm({ ...admitForm, maBN: e.target.value })}
                          placeholder="Ví dụ: BN001"
                          className="flex-1 h-7 px-2 rounded-md bg-white text-[#0b1c30] font-mono text-[11px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                        />
                        <button
                          type="button"
                          onClick={handleLookupPatientForAdmit}
                          className="h-8 px-3.5 rounded-md bg-[#e5eeff] hover:bg-[#dce9ff] text-[#006398] text-[11.5px] font-semibold cursor-pointer"
                        >
                          Tra cứu
                        </button>
                      </div>
                      {lookupName && (
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          ✓ {lookupName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-[#3d4947] font-semibold">
                          Bác sĩ theo dõi *
                        </label>
                        <select
                          value={admitForm.maBSTheoDoi}
                          onChange={(e) =>
                            setAdmitForm({ ...admitForm, maBSTheoDoi: e.target.value })
                          }
                          className="h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                        >
                          {doctors.map((d) => (
                            <option key={d.MaNV} value={d.MaNV}>
                              {d.nhanVien?.HoTen || d.NhanVien?.HoTen || d.MaNV}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-[#3d4947] font-semibold">
                          Tình trạng nhập viện *
                        </label>
                        <select
                          value={admitForm.tinhTrangNhapVien}
                          onChange={(e) =>
                            setAdmitForm({
                              ...admitForm,
                              tinhTrangNhapVien: e.target.value as TinhTrangNhapVien,
                            })
                          }
                          className="h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                        >
                          <option value="Nhe">Nhẹ (Nhe)</option>
                          <option value="Vua">Vừa (Vua)</option>
                          <option value="Nang">Nặng (Nang)</option>
                          <option value="Nguy_kich">Nguy kịch (Nguy_kich)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-[#3d4947] font-semibold">
                          Số HSBA (tùy chọn)
                        </label>
                        <input
                          type="text"
                          value={admitForm.soHoSoBenhAn}
                          onChange={(e) =>
                            setAdmitForm({ ...admitForm, soHoSoBenhAn: e.target.value })
                          }
                          placeholder="Tự sinh nếu để trống"
                          className="h-7 px-2 rounded-md bg-white text-[#0b1c30] font-mono text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-[#3d4947] font-semibold">
                          Dự kiến xuất viện
                        </label>
                        <input
                          type="date"
                          value={admitForm.ngayXuatVienDuKien}
                          onChange={(e) =>
                            setAdmitForm({ ...admitForm, ngayXuatVienDuKien: e.target.value })
                          }
                          className="h-7 px-2 rounded-md bg-white text-[#0b1c30] font-mono text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#3d4947] font-semibold">
                        Chẩn đoán nhập viện *
                      </label>
                      <input
                        type="text"
                        required
                        value={admitForm.chanDoanNhapVien}
                        onChange={(e) =>
                          setAdmitForm({ ...admitForm, chanDoanNhapVien: e.target.value })
                        }
                        placeholder="Ví dụ: Viêm phổi thùy dưới phổi phải mức độ vừa"
                        className="h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={admitMutation.isPending || !canAdmit}
                    className="w-full h-10 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
                  >
                    <UserCheck className="w-4 h-4" />
                    {admitMutation.isPending
                      ? "Đang lưu hồ sơ..."
                      : canAdmit
                      ? "Lưu Hồ Sơ Nhập Viện (C10)"
                      : "Yêu cầu quyền Bác sĩ / Admin"}
                  </button>
                </form>
              )}

              {/* TAB 2: PHÂN GIƯỜNG (AssignBedDto - BR02) */}
              {activeTab === "assign" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    assignBedMutation.mutate();
                  }}
                  className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto pr-0.5 gap-2"
                >
                  <div className="flex flex-col gap-2">
                    {/* Selected Patient Card */}
                    <div className="bg-[#eff4ff] rounded-lg p-2 flex flex-col gap-1 border border-[#bcc9c6]/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] text-[#6d7a77] uppercase font-bold">
                          BN THỤ HƯỞNG ĐANG CHỌN
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#89f5e7] text-[#005049] font-mono text-[8.5px] font-bold">
                          SERIALIZABLE
                        </span>
                      </div>

                      {selectedInpatient ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#006398]/15 flex items-center justify-center text-[#006398] font-bold text-[10.5px] shrink-0">
                            {getInitials(selectedInpatient.benhNhan?.HoTen)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 leading-tight">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11.5px] font-bold text-[#0b1c30] truncate">
                                {selectedInpatient.benhNhan?.HoTen || selectedInpatient.MaBN}
                              </span>
                              <span className="font-mono text-[10px] text-[#006398] font-bold">
                                {selectedInpatient.MaBN}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9.5px] text-[#3d4947] truncate">
                              <span>
                                {formatGender(selectedInpatient.benhNhan?.GioiTinh)},{" "}
                                {calcAge(selectedInpatient.benhNhan?.NgaySinh)}
                              </span>
                              <span>•</span>
                              <span className="font-mono">{selectedInpatient.SoHoSoBenhAn}</span>
                              {selectedInpatient.benhNhan?.MucHuongBHYT && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-semibold">
                                    BHYT {selectedInpatient.benhNhan.MucHuongBHYT}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10.5px] text-[#6d7a77]">
                          Chọn bệnh nhân từ bảng bên trái hoặc nhập Mã BN bên dưới.
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#0b1c30] font-semibold">
                        Mã Bệnh Nhân nội trú *
                      </label>
                      <input
                        type="text"
                        required
                        value={assignForm.maBN}
                        onChange={(e) => setAssignForm({ ...assignForm, maBN: e.target.value })}
                        placeholder="Ví dụ: BN001"
                        className="h-7 px-2 rounded-md bg-white text-[#0b1c30] font-mono text-[11px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#0b1c30] font-semibold flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-[#00685f]" /> Giường trống nội trú (C02):
                        </label>
                        <span className="text-[9.5px] text-emerald-700 font-semibold">
                          {availableInpatientBeds.length} khả dụng
                        </span>
                      </div>
                      <select
                        required
                        value={assignForm.maGiuong}
                        onChange={(e) =>
                          setAssignForm({ ...assignForm, maGiuong: e.target.value })
                        }
                        className="w-full h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] font-semibold border border-[#bcc9c6]/60 focus:outline-none focus:border-[#00685f]"
                      >
                        <option value="">-- Chọn giường trống phòng NOI_TRU --</option>
                        {availableInpatientBeds.map((b) => (
                          <option key={b.MaGiuong} value={b.MaGiuong}>
                            {b.phong?.SoPhong || b.MaPhong} - {b.SoGiuong} ({b.MaGiuong}) [{b.LoaiGiuong}] —{" "}
                            {formatVnd(b.DonGiaNgay)}/ngày
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#3d4947] font-semibold">
                        Ghi chú phân giường / Yêu cầu trang bị
                      </label>
                      <textarea
                        rows={2}
                        value={assignForm.ghiChu}
                        onChange={(e) => setAssignForm({ ...assignForm, ghiChu: e.target.value })}
                        placeholder="Ví dụ: Nhập viện khoa Nội tầng 2..."
                        className="w-full p-1.5 rounded-md bg-white text-[#0b1c30] text-[10.5px] placeholder:text-[#6d7a77] focus:outline-none focus:border-[#00685f] resize-none border border-[#bcc9c6]/60"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-[#00685f]/8 text-[#00685f] text-[9.5px]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-tight">
                        Khóa giao dịch (BR02) triệt tiêu nguy cơ cấp trùng giường cùng lúc.
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={assignBedMutation.isPending || !assignForm.maBN || !assignForm.maGiuong}
                    className="w-full h-10 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {assignBedMutation.isPending
                      ? "Đang cấp giường..."
                      : "Xác Nhận Cấp Giường Bệnh"}
                  </button>
                </form>
              )}

              {/* TAB 3: CHUYỂN BUỒNG / GIƯỜNG (TransferBedDto - BR01) */}
              {activeTab === "transfer" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    transferBedMutation.mutate();
                  }}
                  className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto pr-0.5 gap-2"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-[#0b1c30]">
                        Luân Chuyển Giường (Rule BR01)
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-mono text-[9px] font-bold">
                        CŨ → BẢO TRÌ
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#eff4ff] flex flex-col gap-1 text-[10.5px] border border-[#bcc9c6]/30">
                      <div className="flex justify-between">
                        <span className="text-[#6d7a77]">Bệnh nhân:</span>
                        <strong className="text-[#0b1c30]">
                          {selectedInpatient?.benhNhan?.HoTen || transferForm.maBN || "Chưa chọn"} (
                          {transferForm.maBN || "—"})
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6d7a77]">Giường hiện tại:</span>
                        <span className="font-mono text-[#ba1a1a] font-bold">
                          {selectedInpatient?.phanGiuongs?.[0]?.giuongBenh
                            ? `${selectedInpatient.phanGiuongs[0].giuongBenh.phong?.SoPhong || selectedInpatient.phanGiuongs[0].giuongBenh.MaPhong} - ${selectedInpatient.phanGiuongs[0].giuongBenh.SoGiuong} (${selectedInpatient.phanGiuongs[0].MaGiuong})`
                            : "Chưa có giường"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#0b1c30] font-semibold">
                        Mã Bệnh Nhân *
                      </label>
                      <input
                        type="text"
                        required
                        value={transferForm.maBN}
                        onChange={(e) => setTransferForm({ ...transferForm, maBN: e.target.value })}
                        className="h-7 px-2 rounded-md bg-white text-[#0b1c30] font-mono text-[11px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#006398]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#0b1c30] font-semibold">
                        Chuyển sang Giường đích (TRỐNG) *
                      </label>
                      <select
                        required
                        value={transferForm.maGiuongMoi}
                        onChange={(e) =>
                          setTransferForm({ ...transferForm, maGiuongMoi: e.target.value })
                        }
                        className="h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] font-semibold border border-[#bcc9c6]/60 focus:outline-none focus:border-[#006398]"
                      >
                        <option value="">-- Chọn giường trống mới --</option>
                        {availableInpatientBeds.map((b) => (
                          <option key={b.MaGiuong} value={b.MaGiuong}>
                            {b.phong?.SoPhong || b.MaPhong} - {b.SoGiuong} ({b.MaGiuong}) [{b.LoaiGiuong}] —{" "}
                            {formatVnd(b.DonGiaNgay)}/ngày
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-[#3d4947] font-semibold">
                        Lý do chuyển giường *
                      </label>
                      <input
                        type="text"
                        required
                        value={transferForm.lyDoChuyen}
                        onChange={(e) =>
                          setTransferForm({ ...transferForm, lyDoChuyen: e.target.value })
                        }
                        className="h-7 px-2 rounded-md bg-white text-[#0b1c30] text-[10.5px] border border-[#bcc9c6]/60 focus:outline-none focus:border-[#006398]"
                      />
                    </div>

                    <div className="p-1.5 rounded-md bg-amber-50 text-amber-900 text-[9.5px] border border-amber-200/70">
                      Giường cũ sẽ tự động chuyển trạng thái <strong>BẢO TRÌ / KHỬ TRÙNG</strong> ngay sau luân chuyển (BR01).
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      transferBedMutation.isPending ||
                      !transferForm.maBN ||
                      !transferForm.maGiuongMoi
                    }
                    className="w-full h-10 px-4 rounded-lg bg-[#006398] hover:bg-[#00476e] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {transferBedMutation.isPending
                      ? "Đang chuyển giường..."
                      : "Xác Nhận Luân Chuyển Giường"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
