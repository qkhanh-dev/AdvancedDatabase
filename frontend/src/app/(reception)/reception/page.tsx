"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  Bed,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Droplets,
  Eraser,
  FlaskConical,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { hospitalApi } from "@/services/hospitalApi";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BenhNhan,
  GioiTinhEnum,
  Khoa,
  NhomMauEnum,
  RoleEnum,
} from "@/types";

type PatientFilterTab = "ALL" | "NGOAI_TRU" | "NOI_TRU" | "BHYT";

interface NavItem {
  id: string;
  title: string;
  href: string;
  group: "OVERVIEW" | "CLINICAL" | "INPATIENT" | "FINANCE";
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: RoleEnum[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    title: "Bảng điều khiển",
    href: "/",
    group: "OVERVIEW",
    icon: LayoutDashboard,
    allowedRoles: [
      RoleEnum.ADMIN,
      RoleEnum.BAC_SI,
      RoleEnum.DIEU_DUONG,
      RoleEnum.NV_HANH_CHINH,
      RoleEnum.THU_NGAN,
      RoleEnum.DUOC_SI,
    ],
  },
  {
    id: "reception",
    title: "Tiếp đón & Hồ sơ BN",
    href: "/reception",
    group: "CLINICAL",
    icon: Users,
    allowedRoles: [
      RoleEnum.ADMIN,
      RoleEnum.NV_HANH_CHINH,
      RoleEnum.THU_NGAN,
      RoleEnum.BAC_SI,
      RoleEnum.DIEU_DUONG,
    ],
  },
  {
    id: "clinical",
    title: "Khám lâm sàng",
    href: "/clinical",
    group: "CLINICAL",
    icon: Stethoscope,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "laboratory",
    title: "Cận lâm sàng & XN",
    href: "/laboratory",
    group: "CLINICAL",
    icon: FlaskConical,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "inpatient",
    title: "Nội trú & Giường bệnh",
    href: "/inpatient",
    group: "INPATIENT",
    icon: Bed,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "pharmacy",
    title: "Kho dược & Phát thuốc",
    href: "/pharmacy",
    group: "INPATIENT",
    icon: Pill,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.DIEU_DUONG, RoleEnum.NV_HANH_CHINH, RoleEnum.DUOC_SI],
  },
  {
    id: "cashier",
    title: "Thu ngân & Viện phí",
    href: "/cashier",
    group: "FINANCE",
    icon: CreditCard,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.THU_NGAN],
  },
  {
    id: "admin",
    title: "Quản trị & Lịch trực",
    href: "/admin",
    group: "FINANCE",
    icon: CalendarClock,
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.NV_HANH_CHINH],
  },
];

export default function ReceptionPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrate, logout } = useAuthStore();

  const [checkedAuth, setCheckedAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [departments, setDepartments] = useState<Khoa[]>([]);
  const [patients, setPatients] = useState<BenhNhan[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("--:--");

  // Search / Selected Patient state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<BenhNhan | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter tab on right column
  const [patientFilter, setPatientFilter] = useState<PatientFilterTab>("ALL");

  // Reception Form state (aligned with API Contract v1 ReceptionDto)
  const [isNgoaiTru, setIsNgoaiTru] = useState(true);
  const [coverageMode, setCoverageMode] = useState<80 | 95 | 100 | 0>(80);
  const [formData, setFormData] = useState({
    hoTen: "",
    ngaySinh: "1992-06-15",
    gioiTinh: GioiTinhEnum.NAM,
    cccd: "",
    soDienThoai: "",
    nhomMau: NhomMauEnum.O,
    soBHYT: "",
    diaChi: "",
    maKhoa: "K01",
    lyDoKham: "",
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    hydrate();
    setCheckedAuth(true);
  }, [hydrate]);

  useEffect(() => {
    if (checkedAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [checkedAuth, isAuthenticated, router]);

  const loadInitialData = async () => {
    try {
      setLoadingList(true);
      const [deptList, patientRes] = await Promise.all([
        hospitalApi.department.getAll().catch(() => []),
        hospitalApi.patient.getAll(1, 50).catch(() => ({ data: [], total: 0 })),
      ]);
      setDepartments(deptList);
      const list = patientRes.data || [];
      setPatients(list);
      setTotalPatients(patientRes.total || list.length);
      if (deptList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          maKhoa: prev.maKhoa || deptList[0].MaKhoa,
        }));
      }
      if (list.length > 0 && !selectedPatient) {
        setSelectedPatient(list[0]);
      }
      setLastUpdated(
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!checkedAuth || !isAuthenticated) return;
    loadInitialData();

    // Check ?q= param from Dashboard search
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q && q.trim()) {
        setSearchQuery(q.trim());
        runLookup(q.trim());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAuth, isAuthenticated]);

  // Ctrl+K shortcut for Omnibar Lookup
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

  const runLookup = async (query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await hospitalApi.patient.lookup(query.trim());
      setSelectedPatient(res);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSearchError(
        error?.response?.data?.message ||
          "Không tìm thấy hồ sơ bệnh nhân với Mã BN / CCCD / BHYT / SĐT đã nhập.",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await runLookup(searchQuery);
  };

  const handleSelectPatientCard = async (patient: BenhNhan) => {
    setSelectedPatient(patient);
    setSearchError(null);
    try {
      const detail = await hospitalApi.patient.lookup(patient.MaBN);
      setSelectedPatient(detail);
    } catch {
      // Keep basic patient card data if lookup fails
    }
  };

  const handleResetForm = () => {
    setFormData({
      hoTen: "",
      ngaySinh: "1992-06-15",
      gioiTinh: GioiTinhEnum.NAM,
      cccd: "",
      soDienThoai: "",
      nhomMau: NhomMauEnum.O,
      soBHYT: "",
      diaChi: "",
      maKhoa: departments[0]?.MaKhoa || "K01",
      lyDoKham: "",
    });
    setCoverageMode(80);
    setIsNgoaiTru(true);
    setFeedback(null);
  };

  const handleFillSampleScan = (type: "CCCD" | "BHYT") => {
    const rand = Math.floor(100000 + Math.random() * 899999);
    if (type === "CCCD") {
      setFormData((prev) => ({
        ...prev,
        hoTen: prev.hoTen || "NGUYỄN MINH KHANG",
        cccd: `079092${rand}`,
        ngaySinh: "1992-08-14",
        gioiTinh: GioiTinhEnum.NAM,
        diaChi: prev.diaChi || "273 An Dương Vương, Quận 5, TP.HCM",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        soBHYT: `DN4799200${rand}`,
      }));
      setCoverageMode(80);
    }
  };

  const handleReceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const newPatient = await hospitalApi.patient.reception({
        hoTen: formData.hoTen.trim(),
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh,
        cccd: formData.cccd.trim() || undefined,
        soDienThoai: formData.soDienThoai.trim() || undefined,
        soBHYT: coverageMode > 0 && formData.soBHYT.trim() ? formData.soBHYT.trim().toUpperCase() : undefined,
        mucHuongBHYT: coverageMode > 0 ? coverageMode : 0,
        diaChi: formData.diaChi.trim() || "TP. Hồ Chí Minh",
        nhomMau: formData.nhomMau,
        isNgoaiTru,
      });

      setFeedback({
        type: "success",
        text: `Tiếp nhận thành công: ${newPatient.HoTen} (Mã BN: ${newPatient.MaBN})`,
      });
      setSelectedPatient(newPatient);
      handleResetForm();
      setFeedback({
        type: "success",
        text: `Tiếp nhận thành công: ${newPatient.HoTen} (Mã BN: ${newPatient.MaBN})`,
      });
      await loadInitialData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const rawMsg = error?.response?.data?.message;
      setFeedback({
        type: "error",
        text: Array.isArray(rawMsg)
          ? rawMsg.join(", ")
          : rawMsg || "Lỗi tiếp nhận bệnh nhân. Vui lòng kiểm tra dữ liệu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const counts = useMemo(() => {
    return {
      all: patients.length,
      ngoaiTru: patients.filter((p) => p.CoNgoaiTru).length,
      noiTru: patients.filter((p) => p.CoNoiTru).length,
      bhyt: patients.filter((p) => Boolean(p.SoBHYT || p.BHYT)).length,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (patientFilter === "NGOAI_TRU") return patients.filter((p) => p.CoNgoaiTru);
    if (patientFilter === "NOI_TRU") return patients.filter((p) => p.CoNoiTru);
    if (patientFilter === "BHYT") return patients.filter((p) => Boolean(p.SoBHYT || p.BHYT));
    return patients;
  }, [patients, patientFilter]);

  if (!checkedAuth || !isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-md animate-pulse">
            <Hospital className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-slate-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </main>
    );
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const calcAge = (dob: string) => {
    const year = new Date(dob).getFullYear();
    if (Number.isNaN(year)) return "";
    return `${new Date().getFullYear() - year} tuổi (${year})`;
  };

  const visibleNav = NAV_ITEMS.filter((item) => item.allowedRoles.includes(user.role));

  const _SidebarContent = (
    <div className="w-[240px] h-full bg-white border-r border-slate-200/80 flex flex-col justify-between select-none shadow-sm">
      <div className="flex flex-col min-h-0 flex-1">
        <div className="h-14 flex items-center justify-between gap-2.5 px-3.5 border-b border-slate-200/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Hospital className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 truncate leading-tight">
                QLBV • Smart HIS
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-none mt-0.5">
                Tiếp đón &amp; Quản lý hồ sơ
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-2.5 py-3 space-y-3 flex-1 min-h-0">
          {(
            [
              { key: "OVERVIEW", label: "TỔNG QUAN" },
              { key: "CLINICAL", label: "TIẾP ĐÓN & LÂM SÀNG" },
              { key: "INPATIENT", label: "ĐIỀU TRỊ & HẬU CẦN" },
              { key: "FINANCE", label: "TÀI CHÍNH & VẬN HÀNH" },
            ] as const
          ).map((grp) => {
            const items = visibleNav.filter((n) => n.group === grp.key);
            if (items.length === 0) return null;
            return (
              <div key={grp.key} className="space-y-1">
                <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  {grp.label}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-all ${
                        active
                          ? "bg-teal-600 text-white font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-2.5 border-t border-slate-200/70 bg-slate-50/70 shrink-0">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-slate-400">QUẦY TIẾP ĐÓN</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[9.5px] font-bold">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {getInitials(user.hoTen)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11.5px] font-semibold text-slate-900 truncate leading-tight">
                {user.hoTen}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {user.tenKhoa || user.maKhoa || "Tổ Tiếp Đón"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors text-[10.5px] font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất / Đổi tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );

  const selectedBhyt = selectedPatient?.SoBHYT || selectedPatient?.BHYT;
  const selectedMucHuong = selectedPatient?.MucHuongBHYT ?? (selectedBhyt ? 80 : 0);
  const latestExam = selectedPatient?.luotKhams?.[0];

  return (
    <div className="min-h-screen lg:h-screen w-full flex bg-[#dfe9f5]/70 text-slate-900 lg:overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200/80 shrink-0 flex items-center justify-between px-4 gap-3 z-20">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 shrink-0 whitespace-nowrap">
              <Link href="/" className="hover:text-teal-700 transition-colors">
                HIS
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-semibold">Tiếp Đón &amp; Quản Lý Hồ Sơ BN</span>
              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[10px] font-semibold">
                MOD-01
              </span>
            </div>

            {/* Omnibar Lookup */}
            <form onSubmit={handleLookup} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu Mã BN, CCCD, BHYT, SĐT..."
                className="w-full h-8 pl-8 pr-24 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-500 border border-slate-200">
                  Ctrl+K
                </kbd>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-[10.5px] font-semibold transition-colors"
                >
                  {searching ? "..." : "Tìm"}
                </button>
              </div>
            </form>

            {/* Quick Scan Fill Buttons */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleFillSampleScan("CCCD")}
                className="h-8 px-2.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Điền nhanh dữ liệu quét CCCD"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Quét CCCD</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillSampleScan("BHYT")}
                className="h-8 px-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Điền nhanh mã thẻ BHYT"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Thẻ BHYT</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Quyền: {user.role}</span>
            </div>
            <button
              type="button"
              onClick={loadInitialData}
              disabled={loadingList}
              title="Làm mới danh sách"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin text-teal-600" : ""}`} />
            </button>
            <div className="relative">
              <Link
                href="/"
                title="Về Bảng điều khiển"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
          </div>
        </header>

        {/* Main 2-Column Body */}
        <main className="flex-1 flex flex-col p-3 gap-2 min-h-0 lg:overflow-hidden">
          {searchError && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{searchError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchError(null)}
                className="text-amber-700 hover:text-amber-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 min-h-0">
            {/* LEFT COLUMN (50%): Patient Quick View + Registration Form */}
            <div className="flex flex-col gap-2.5 min-h-0 h-full">
              {/* Patient Record Quick View */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 flex flex-col gap-2 shrink-0">
                {selectedPatient ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-teal-500/20">
                            {getInitials(selectedPatient.HoTen)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-bold text-slate-900 uppercase truncate">
                              {selectedPatient.HoTen}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[10px] font-bold">
                              #{selectedPatient.MaBN}
                            </span>
                            {selectedPatient.NhomMau && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold inline-flex items-center gap-0.5">
                                <Droplets className="w-2.5 h-2.5" />
                                {selectedPatient.NhomMau}
                              </span>
                            )}
                            {selectedPatient.CoNgoaiTru && (
                              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-semibold">
                                Ngoại trú
                              </span>
                            )}
                            {selectedPatient.CoNoiTru && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                                Nội trú
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                            <span>
                              {selectedPatient.GioiTinh} • {calcAge(selectedPatient.NgaySinh)}
                            </span>
                            {selectedPatient.SoDienThoai && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-slate-700">
                                  {selectedPatient.SoDienThoai}
                                </span>
                              </>
                            )}
                            {selectedPatient.CCCD && (
                              <>
                                <span>•</span>
                                <span>
                                  CCCD:{" "}
                                  <span className="font-mono text-slate-700">
                                    {selectedPatient.CCCD}
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-right shrink-0">
                        <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                        <div className="flex flex-col">
                          <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white font-mono text-[9.5px] font-bold uppercase">
                            {selectedBhyt
                              ? `BHYT ${selectedMucHuong}% • ${selectedBhyt}`
                              : "Tự chi trả (Không BHYT)"}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {selectedPatient.bnNgoaiTru?.SoSoKhamBenh
                              ? `Sổ khám: ${selectedPatient.bnNgoaiTru.SoSoKhamBenh}`
                              : "Hồ sơ điện tử chuẩn BCNF"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
                      <div className="flex flex-col bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[9.5px] uppercase font-bold">
                          Địa chỉ
                        </span>
                        <span
                          className="text-slate-800 font-medium truncate"
                          title={selectedPatient.DiaChi || "Chưa cập nhật"}
                        >
                          {selectedPatient.DiaChi || "Chưa cập nhật"}
                        </span>
                      </div>
                      <div className="flex flex-col bg-teal-50/60 p-1.5 rounded-lg">
                        <span className="text-teal-700 text-[9.5px] uppercase font-bold">
                          Tình trạng hồ sơ
                        </span>
                        <span className="text-teal-900 font-semibold truncate">
                          {selectedPatient.bnNgoaiTru?.TinhTrangTheoDoi ||
                            (selectedPatient.CoNoiTru
                              ? "Đang theo dõi nội trú"
                              : "Sẵn sàng phân luồng khám")}
                        </span>
                      </div>
                      <div className="flex flex-col bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-400 text-[9.5px] uppercase font-bold">
                          Lần khám gần nhất
                        </span>
                        <span className="text-slate-800 font-medium truncate">
                          {latestExam
                            ? `${new Date(latestExam.ThoiGianKham).toLocaleDateString("vi-VN")} • ${latestExam.ChanDoanXacDinh || latestExam.ChanDoanSoBo || latestExam.MaLuotKham}`
                            : "Chưa có lượt khám"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-3 text-center text-xs text-slate-500">
                    Tra cứu Mã BN / CCCD / BHYT ở thanh trên hoặc chọn hồ sơ ở danh sách bên phải để
                    xem chi tiết.
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">
                      Đăng Ký Tiếp Nhận Mới
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold">
                      POST /api/patients/reception
                    </span>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                    <span className="text-slate-600 font-medium">Lập sổ ngoại trú:</span>
                    <input
                      type="checkbox"
                      checked={isNgoaiTru}
                      onChange={(e) => setIsNgoaiTru(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                    />
                  </label>
                </div>

                <form
                  onSubmit={handleReceptionSubmit}
                  className="flex-1 flex flex-col justify-between pt-2.5 gap-2 min-h-0"
                >
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
                    {/* Hàng 1: Họ tên, Ngày sinh, Giới tính */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-700 uppercase font-bold">
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.hoTen}
                          onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                          placeholder="NGUYỄN VĂN A"
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-7 sm:col-span-4 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-700 uppercase font-bold">
                          Ngày sinh <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.ngaySinh}
                          onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                          className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-2 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Giới tính
                        </label>
                        <select
                          value={formData.gioiTinh}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gioiTinh: e.target.value as GioiTinhEnum,
                            })
                          }
                          className="h-8 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        >
                          <option value={GioiTinhEnum.NAM}>Nam</option>
                          <option value={GioiTinhEnum.NU}>Nữ</option>
                          <option value={GioiTinhEnum.KHAC}>Khác</option>
                        </select>
                      </div>
                    </div>

                    {/* Hàng 2: CCCD, SĐT, Nhóm máu */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-5 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Số CCCD (12 số)
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          value={formData.cccd}
                          onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                          placeholder="079200000001"
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-7 sm:col-span-4 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={formData.soDienThoai}
                          onChange={(e) =>
                            setFormData({ ...formData, soDienThoai: e.target.value })
                          }
                          placeholder="0901234567"
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Nhóm máu
                        </label>
                        <select
                          value={formData.nhomMau}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nhomMau: e.target.value as NhomMauEnum,
                            })
                          }
                          className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        >
                          <option value={NhomMauEnum.O}>O</option>
                          <option value={NhomMauEnum.A}>A</option>
                          <option value={NhomMauEnum.B}>B</option>
                          <option value={NhomMauEnum.AB}>AB</option>
                          <option value={NhomMauEnum.CHUA_RO}>Chưa rõ</option>
                        </select>
                      </div>
                    </div>

                    {/* Hàng 3: Mã BHYT & Mức hưởng */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Mã BHYT (15 ký tự)
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          disabled={coverageMode === 0}
                          value={coverageMode === 0 ? "" : formData.soBHYT}
                          onChange={(e) => setFormData({ ...formData, soBHYT: e.target.value })}
                          placeholder={
                            coverageMode === 0 ? "Không áp dụng BHYT" : "GD47995000888"
                          }
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs uppercase text-slate-900 disabled:opacity-60 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Mức hưởng BHYT
                        </label>
                        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 h-8">
                          {(
                            [
                              { val: 80, label: "80%" },
                              { val: 95, label: "95%" },
                              { val: 100, label: "100%" },
                              { val: 0, label: "Tự túc" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setCoverageMode(opt.val)}
                              className={`rounded-md text-[10.5px] font-bold transition-all ${
                                coverageMode === opt.val
                                  ? "bg-teal-600 text-white shadow-xs"
                                  : "text-slate-600 hover:bg-white"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hàng 4: Địa chỉ */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] text-slate-700 uppercase font-bold">
                        Địa chỉ cư trú
                      </label>
                      <input
                        type="text"
                        value={formData.diaChi}
                        onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                        placeholder="273 An Dương Vương, Quận 5, TP.HCM"
                        className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    {/* Hàng 5: Khoa tiếp nhận & Lý do khám */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Khoa tiếp nhận khám
                        </label>
                        <select
                          value={formData.maKhoa}
                          onChange={(e) => setFormData({ ...formData, maKhoa: e.target.value })}
                          className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        >
                          {departments.map((dept) => (
                            <option key={dept.MaKhoa} value={dept.MaKhoa}>
                              {dept.TenKhoa} ({dept.MaKhoa})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-12 sm:col-span-6 flex flex-col gap-0.5">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">
                          Lý do khám / Triệu chứng
                        </label>
                        <input
                          type="text"
                          value={formData.lyDoKham}
                          onChange={(e) => setFormData({ ...formData, lyDoKham: e.target.value })}
                          placeholder="Đau đầu, sốt nhẹ, khám định kỳ..."
                          className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>

                    {feedback && (
                      <div
                        className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                          feedback.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {feedback.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{feedback.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Eraser className="w-4 h-4" />
                      <span>Xóa trắng</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-10 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-[13px] font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{loading ? "Đang xử lý..." : "Xác Nhận & Cấp Mã BN"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN (50%): Reception List */}
            <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 flex flex-col h-full min-h-0">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-slate-900">
                        Danh Sách Hồ Sơ Bệnh Nhân
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[10px] font-bold">
                        {totalPatients} BN
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Cập nhật lúc {lastUpdated} • Bấm vào hồ sơ để xem chi tiết
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10.5px]">
                  {(
                    [
                      { key: "ALL", label: `Tất cả (${counts.all})` },
                      { key: "NGOAI_TRU", label: `Ngoại trú (${counts.ngoaiTru})` },
                      { key: "NOI_TRU", label: `Nội trú (${counts.noiTru})` },
                      { key: "BHYT", label: `BHYT (${counts.bhyt})` },
                    ] as { key: PatientFilterTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setPatientFilter(tab.key)}
                      className={`px-2 py-1 rounded-md font-semibold transition-all ${
                        patientFilter === tab.key
                          ? "bg-teal-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Patient Cards */}
              <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2 min-h-0">
                {filteredPatients.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">
                    {loadingList ? "Đang tải dữ liệu..." : "Không có hồ sơ phù hợp."}
                  </p>
                ) : (
                  filteredPatients.map((p) => {
                    const isSelected = selectedPatient?.MaBN === p.MaBN;
                    const bhytCode = p.SoBHYT || p.BHYT;
                    return (
                      <button
                        key={p.MaBN}
                        type="button"
                        onClick={() => handleSelectPatientCard(p)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? "bg-teal-50/60 border-teal-400 shadow-xs"
                            : "bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {getInitials(p.HoTen)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[12.5px] text-slate-900 font-bold truncate">
                                  {p.HoTen}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[9.5px] font-bold">
                                  #{p.MaBN}
                                </span>
                                {bhytCode ? (
                                  <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[9.5px] font-bold">
                                    BHYT {p.MucHuongBHYT ?? 80}%
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9.5px] font-semibold">
                                    Tự túc
                                  </span>
                                )}
                              </div>
                              <span className="text-[10.5px] text-slate-500 mt-0.5">
                                {calcAge(p.NgaySinh)} • {p.GioiTinh}
                                {p.NhomMau ? ` • Máu ${p.NhomMau}` : ""}
                                {p.SoDienThoai ? ` • SĐT: ${p.SoDienThoai}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {p.CoNoiTru ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] font-semibold">
                                Nội trú
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-semibold">
                                Ngoại trú
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                          <span className="font-mono">
                            CCCD: {p.CCCD || "Chưa có"}
                            {bhytCode ? ` • BHYT: ${bhytCode}` : ""}
                          </span>
                          <span className="truncate max-w-[220px]">{p.DiaChi || "TP.HCM"}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
