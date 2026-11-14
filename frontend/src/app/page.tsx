"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Bed,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FlaskConical,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { hospitalApi } from "@/services/hospitalApi";
import { useAuthStore } from "@/store/useAuthStore";
import { GiuongBenh, Khoa, RoleEnum, TrangThaiGiuongEnum } from "@/types";

interface SubsystemItem {
  id: string;
  title: string;
  description: string;
  href: string;
  modulePath: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  arrowColorClass: string;
  allowedRoles: RoleEnum[];
}

const SUBSYSTEMS: SubsystemItem[] = [
  {
    id: "reception",
    title: "Tiếp đón & Hồ sơ BN",
    description: "Quản lý tiếp nhận, tra cứu CCCD / BHYT và phân luồng phòng khám",
    href: "/reception",
    modulePath: "/reception",
    icon: Users,
    iconBgClass: "bg-teal-50 text-teal-700 border-teal-200",
    arrowColorClass: "text-teal-600",
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
    description: "Nhập sinh hiệu, chẩn đoán ICD-10, kê đơn thuốc và chỉ định CLS",
    href: "/clinical",
    modulePath: "/clinical",
    icon: Stethoscope,
    iconBgClass: "bg-sky-50 text-sky-700 border-sky-200",
    arrowColorClass: "text-sky-600",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "laboratory",
    title: "Cận lâm sàng & XN",
    description: "Chỉ định dịch vụ kỹ thuật, trả kết quả xét nghiệm và CĐHA",
    href: "/laboratory",
    modulePath: "/laboratory",
    icon: FlaskConical,
    iconBgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    arrowColorClass: "text-indigo-600",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "inpatient",
    title: "Nội trú & Giường bệnh",
    description: "Sơ đồ buồng bệnh thời gian thực, phân giường Serializable",
    href: "/inpatient",
    modulePath: "/inpatient",
    icon: Bed,
    iconBgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    arrowColorClass: "text-emerald-600",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
  },
  {
    id: "pharmacy",
    title: "Kho dược & Phát thuốc",
    description: "Quản lý tồn kho, hạn dùng, duyệt đơn và khấu trừ kho nguyên tử",
    href: "/pharmacy",
    modulePath: "/pharmacy",
    icon: Pill,
    iconBgClass: "bg-amber-50 text-amber-700 border-amber-200",
    arrowColorClass: "text-amber-600",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.DIEU_DUONG, RoleEnum.NV_HANH_CHINH, RoleEnum.DUOC_SI],
  },
  {
    id: "cashier",
    title: "Thu ngân & Viện phí BHYT",
    description: "Tính viện phí BHYT (80-100%), gạch nợ VietQR và xuất PDFKit",
    href: "/cashier",
    modulePath: "/cashier",
    icon: CreditCard,
    iconBgClass: "bg-purple-50 text-purple-700 border-purple-200",
    arrowColorClass: "text-purple-600",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.THU_NGAN],
  },
  {
    id: "admin",
    title: "Quản trị & Lịch trực toàn viện",
    description: "Phân ca kíp trực chống trùng giờ, quản lý khoa phòng và báo cáo",
    href: "/admin",
    modulePath: "/admin",
    icon: CalendarClock,
    iconBgClass: "bg-slate-100 text-slate-700 border-slate-300",
    arrowColorClass: "text-slate-700",
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.NV_HANH_CHINH],
  },
];

const RBAC_MATRIX = [
  {
    role: "BAC_SI",
    clinical: { text: "FULL", cls: "text-teal-700 font-bold" },
    cls: { text: "FULL", cls: "text-teal-700 font-bold" },
    pharmacy: { text: "VIEW", cls: "text-slate-500" },
    billing: { text: "VIEW", cls: "text-slate-500" },
    admin: { text: "DUTY", cls: "text-sky-600 font-semibold" },
  },
  {
    role: "DIEU_DUONG",
    clinical: { text: "VITAL", cls: "text-sky-600 font-semibold" },
    cls: { text: "FULL", cls: "text-teal-700 font-bold" },
    pharmacy: { text: "DISP", cls: "text-teal-700 font-bold" },
    billing: { text: "NO", cls: "text-rose-600" },
    admin: { text: "NO", cls: "text-rose-600" },
  },
  {
    role: "THU_NGAN",
    clinical: { text: "RECEPT", cls: "text-slate-600" },
    cls: { text: "VIEW", cls: "text-slate-500" },
    pharmacy: { text: "VIEW", cls: "text-slate-500" },
    billing: { text: "FULL", cls: "text-teal-700 font-bold" },
    admin: { text: "NO", cls: "text-rose-600" },
  },
  {
    role: "NV_HANH_CHINH",
    clinical: { text: "RECEPT", cls: "text-slate-600" },
    cls: { text: "NO", cls: "text-rose-600" },
    pharmacy: { text: "DISP", cls: "text-teal-700 font-bold" },
    billing: { text: "VIEW", cls: "text-slate-500" },
    admin: { text: "VIEW", cls: "text-slate-500" },
  },
  {
    role: "ADMIN",
    clinical: { text: "FULL", cls: "text-teal-700 font-bold" },
    cls: { text: "FULL", cls: "text-teal-700 font-bold" },
    pharmacy: { text: "FULL", cls: "text-teal-700 font-bold" },
    billing: { text: "FULL", cls: "text-teal-700 font-bold" },
    admin: { text: "FULL", cls: "text-teal-700 font-bold" },
  },
];

function formatVndCompact(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString("vi-VN");
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hydrate, logout } = useAuthStore();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("--:--:--");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate();
    setCheckedAuth(true);
  }, [hydrate]);

  useEffect(() => {
    if (checkedAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [checkedAuth, isAuthenticated, router]);

  const canViewReport =
    !!user &&
    [
      RoleEnum.ADMIN,
      RoleEnum.BAC_SI,
      RoleEnum.NV_HANH_CHINH,
      RoleEnum.THU_NGAN,
    ].includes(user.role);

  const {
    data: dashboardData,
    isFetching: isFetchingReport,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => hospitalApi.report.getDashboardSummary(),
    enabled: checkedAuth && isAuthenticated && canViewReport,
    retry: false,
  });

  const {
    data: departments = [],
    isFetching: isFetchingDepts,
    refetch: refetchDepts,
  } = useQuery<Khoa[]>({
    queryKey: ["departments", "list"],
    queryFn: () => hospitalApi.department.getAll(),
    enabled: checkedAuth && isAuthenticated,
    retry: false,
  });

  const {
    data: bedMap = [],
    isFetching: isFetchingBeds,
    refetch: refetchBeds,
  } = useQuery<GiuongBenh[]>({
    queryKey: ["beds", "map"],
    queryFn: () => hospitalApi.department.getBedMap(),
    enabled: checkedAuth && isAuthenticated,
    retry: false,
  });

  const isSyncing = isFetchingReport || isFetchingDepts || isFetchingBeds;

  const handleRefreshAll = async () => {
    await Promise.all([
      canViewReport ? refetchReport() : Promise.resolve(),
      refetchDepts(),
      refetchBeds(),
    ]);
    setLastSyncedAt(new Date().toLocaleTimeString("vi-VN"));
  };

  useEffect(() => {
    if (checkedAuth && isAuthenticated) {
      setLastSyncedAt(new Date().toLocaleTimeString("vi-VN"));
    }
  }, [checkedAuth, isAuthenticated, dashboardData, bedMap]);

  const accessibleSubsystems = useMemo(() => {
    if (!user) return [];
    return SUBSYSTEMS.filter((s) => s.allowedRoles.includes(user.role));
  }, [user]);

  const canAccess = (id: string) =>
    accessibleSubsystems.some((s) => s.id === id);

  // Keyboard shortcuts: Ctrl+K (Search), F2 (/reception), F3 (/clinical), F4 (/laboratory)
  useEffect(() => {
    if (!checkedAuth || !isAuthenticated || !user) return;
    const hasMod = (id: string) => accessibleSubsystems.some((s) => s.id === id);
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F2" && hasMod("reception")) {
        e.preventDefault();
        router.push("/reception");
      } else if (e.key === "F3" && hasMod("clinical")) {
        e.preventDefault();
        router.push("/clinical");
      } else if (e.key === "F4" && hasMod("laboratory")) {
        e.preventDefault();
        router.push("/laboratory");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [checkedAuth, isAuthenticated, user, accessibleSubsystems, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/reception?q=${encodeURIComponent(q)}` : "/reception");
  };

  const departmentBedStats = useMemo(() => {
    const map = new Map<
      string,
      { maKhoa: string; tenKhoa: string; total: number; occupied: number }
    >();

    for (const dept of departments) {
      map.set(dept.MaKhoa, {
        maKhoa: dept.MaKhoa,
        tenKhoa: dept.TenKhoa,
        total: 0,
        occupied: 0,
      });
    }

    for (const bed of bedMap) {
      const maKhoa = bed.phong?.MaKhoa || "K01";
      const existing = map.get(maKhoa) || {
        maKhoa,
        tenKhoa: maKhoa === "K01" ? "Khoa Nội Tổng Hợp" : maKhoa === "K02" ? "Khoa Ngoại Tổng Hợp" : `Khoa ${maKhoa}`,
        total: 0,
        occupied: 0,
      };
      existing.total += 1;
      if (bed.TrangThai === TrangThaiGiuongEnum.DANG_SU_DUNG) {
        existing.occupied += 1;
      }
      map.set(maKhoa, existing);
    }

    return Array.from(map.values()).map((item) => {
      const rate = item.total > 0 ? Math.round((item.occupied / item.total) * 100) : 0;
      return {
        ...item,
        available: Math.max(0, item.total - item.occupied),
        rate,
      };
    });
  }, [departments, bedMap]);

  if (!checkedAuth || !isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-md animate-pulse">
            <Hospital className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </main>
    );
  }

  const totalPatients = dashboardData?.overview?.totalPatients ?? 0;
  const totalInpatients = dashboardData?.overview?.totalInpatients ?? 0;
  const totalOutpatients = Math.max(0, totalPatients - totalInpatients);
  const totalExaminations = dashboardData?.overview?.totalExaminations ?? 0;
  const totalDoctors = dashboardData?.overview?.totalDoctors ?? 0;

  const totalBeds =
    dashboardData?.overview?.totalBeds ?? bedMap.length;
  const occupiedBeds =
    dashboardData?.overview?.occupiedBeds ??
    bedMap.filter((b) => b.TrangThai === TrangThaiGiuongEnum.DANG_SU_DUNG).length;
  const bedRateStr =
    dashboardData?.overview?.bedOccupancyRate !== undefined
      ? String(dashboardData.overview.bedOccupancyRate)
      : totalBeds > 0
        ? `${((occupiedBeds / totalBeds) * 100).toFixed(1)}%`
        : "0.0%";
  const bedRateNum = parseFloat(bedRateStr.replace("%", "")) || 0;

  const tongDoanhThu = Number(dashboardData?.revenue?.tongDoanhThu ?? 0);
  const tongBHYT = Number(dashboardData?.revenue?.tongBHYTChiTra ?? 0);
  const tongBNTra = Number(dashboardData?.revenue?.tongBenhNhanThanhToan ?? 0);
  const bhytPercent =
    tongDoanhThu > 0 ? Math.round((tongBHYT / tongDoanhThu) * 100) : 0;

  const soHoaDonDaThu = Number(dashboardData?.revenue?.soHoaDonDaThu ?? 0);
  const soHoaDonChuaThu = Number(dashboardData?.revenue?.soHoaDonChuaThu ?? 0);
  const totalInvoices = soHoaDonDaThu + soHoaDonChuaThu;
  const paidRate =
    totalInvoices > 0 ? ((soHoaDonDaThu / totalInvoices) * 100).toFixed(1) : "0.0";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const SidebarContent = (
    <div className="w-[244px] h-full bg-white border-r border-slate-200/80 flex flex-col justify-between select-none shadow-sm">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
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
                Bệnh viện Đa khoa SGU
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

        {/* Navigation Links */}
        <div className="overflow-y-auto px-2.5 py-3 space-y-3 flex-1 min-h-0">
          <div className="space-y-1">
            <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              TỔNG QUAN
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] transition-all ${
                pathname === "/"
                  ? "bg-teal-600 text-white font-semibold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Bảng điều khiển</span>
            </Link>
          </div>

          {SUBSYSTEMS.slice(0, 3).some((item) => item.allowedRoles.includes(user.role)) && (
            <div className="space-y-1">
              <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                TIẾP ĐÓN &amp; LÂM SÀNG
              </div>
              {SUBSYSTEMS.slice(0, 3)
                .filter((item) => item.allowedRoles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-[12px] font-medium"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
            </div>
          )}

          {SUBSYSTEMS.slice(3, 5).some((item) => item.allowedRoles.includes(user.role)) && (
            <div className="space-y-1">
              <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                ĐIỀU TRỊ &amp; HẬU CẦN
              </div>
              {SUBSYSTEMS.slice(3, 5)
                .filter((item) => item.allowedRoles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-[12px] font-medium"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
            </div>
          )}

          {SUBSYSTEMS.slice(5, 7).some((item) => item.allowedRoles.includes(user.role)) && (
            <div className="space-y-1">
              <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                TÀI CHÍNH &amp; VẬN HÀNH
              </div>
              {SUBSYSTEMS.slice(5, 7)
                .filter((item) => item.allowedRoles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-[12px] font-medium"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Card */}
      <div className="p-2.5 border-t border-slate-200/70 bg-slate-50/70 shrink-0">
        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-slate-400">
              RBAC Vai trò
            </span>
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
                {user.tenKhoa || user.maKhoa || "Bệnh viện Đa khoa"}
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

  return (
    <div className="min-h-screen lg:h-screen w-full flex bg-slate-100/70 text-slate-900 lg:overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-full shrink-0 z-30">{SidebarContent}</aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 shrink-0 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <span>Hệ thống HIS</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-semibold">Bảng điều khiển tổng quan</span>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh BN, CCCD, BHYT..."
                className="w-full h-8 pl-8 pr-14 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-[9.5px] font-mono text-slate-500 border border-slate-200">
                  Ctrl+K
                </kbd>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefreshAll}
              title="Làm mới dữ liệu"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-teal-600" : ""}`} />
            </button>

            <Link
              href="/laboratory"
              title="Chỉ định cận lâm sàng"
              className="relative h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </Link>

            <div className="hidden sm:block h-4 w-[1px] bg-slate-200 mx-0.5" />

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
              <Hospital className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {user.maKhoa || "K01"} - {user.tenKhoa || "Khoa Nội Tổng Hợp"}
              </span>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-teal-500/20">
                {getInitials(user.hoTen)}
              </div>
              <div className="hidden 2xl:flex flex-col">
                <span className="text-[11.5px] font-semibold text-slate-900 leading-tight">
                  {user.hoTen}
                </span>
                <span className="text-[9.5px] font-mono text-teal-700 font-semibold">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 w-full p-3.5 flex flex-col gap-2.5 lg:overflow-hidden">
          {/* ROW 1: HERO BANNER & 4 QUICK HOTKEYS */}
          <section
            className="relative overflow-hidden rounded-xl p-3 text-white shadow-sm shrink-0"
            style={{
              background:
                "linear-gradient(110deg, rgb(13, 94, 89) 0%, rgb(15, 118, 110) 55%, rgb(13, 148, 136) 100%)",
            }}
          >
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-[17px] font-bold tracking-tight text-white">
                    Xin chào, {user.hoTen}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50/95 text-teal-900 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    Đang trực ca
                  </span>
                </div>
                <p className="text-[11px] text-teal-100/90 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>
                    Mã NV: <strong className="font-mono text-white">{user.maNV}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {user.tenKhoa || "Khoa Nội Tổng Hợp"} (
                    <span className="font-mono font-semibold text-teal-200">
                      {user.maKhoa || "K01"}
                    </span>
                    )
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date().toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/15 text-white text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    API Contract v1.0
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {canAccess("reception") && (
                  <Link
                    href="/reception"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-teal-50 transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-bold leading-tight">Tiếp đón</span>
                        <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                          F2
                        </kbd>
                      </div>
                      <span className="text-[9.5px] text-slate-500 block truncate">
                        Tiếp nhận BN mới
                      </span>
                    </div>
                  </Link>
                )}

                {canAccess("clinical") && (
                  <Link
                    href="/clinical"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-sky-50 transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-sky-50 flex items-center justify-center text-sky-700 shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-bold leading-tight">Khám bệnh</span>
                        <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                          F3
                        </kbd>
                      </div>
                      <span className="text-[9.5px] text-slate-500 block truncate">
                        Lượt khám lâm sàng
                      </span>
                    </div>
                  </Link>
                )}

                {canAccess("laboratory") && (
                  <Link
                    href="/laboratory"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-indigo-50 transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-bold leading-tight">Cận lâm sàng</span>
                        <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                          F4
                        </kbd>
                      </div>
                      <span className="text-[9.5px] text-slate-500 block truncate">
                        Xét nghiệm &amp; CĐHA
                      </span>
                    </div>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleRefreshAll}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-50 transition-all shadow-xs text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-bold leading-tight">Làm mới</span>
                      <kbd className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
                        Sync
                      </kbd>
                    </div>
                    <span className="text-[9.5px] text-slate-500 block truncate">
                      Đồng bộ dữ liệu
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* ROW 2: 5 KPI CARDS (REAL API DATA) */}
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 shrink-0">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">
                  TỔNG BỆNH NHÂN
                </span>
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl font-bold text-slate-900 leading-none font-mono">
                  {totalPatients.toLocaleString("vi-VN")}
                </span>
                <span className="text-[10.5px] text-teal-700 font-semibold">hồ sơ</span>
              </div>
              <div className="bg-slate-50 rounded px-2 py-1 text-[10.5px] text-slate-600 flex justify-between items-center">
                <span>
                  Nội trú:{" "}
                  <strong className="font-mono text-sky-700 font-bold">{totalInpatients}</strong>
                </span>
                <span>
                  Ngoại trú:{" "}
                  <strong className="font-mono text-slate-800 font-semibold">
                    {totalOutpatients}
                  </strong>
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">
                  LƯỢT KHÁM BỆNH
                </span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl font-bold text-slate-900 leading-none font-mono">
                  {totalExaminations.toLocaleString("vi-VN")}
                </span>
                <span className="text-[10.5px] text-slate-500">lượt</span>
              </div>
              <div className="bg-slate-50 rounded px-2 py-1 text-[10.5px] text-slate-600 flex justify-between items-center">
                <span>
                  Bác sĩ: <strong className="font-mono text-slate-800">{totalDoctors}</strong>
                </span>
                <span className="text-teal-700 font-semibold">Lâm sàng</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">
                  CÔNG SUẤT GIƯỜNG
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                  <Bed className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 my-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-900 leading-none font-mono">
                    {bedRateStr}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {occupiedBeds}/{totalBeds}
                  </span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  <div
                    className={`h-full rounded-full ${
                      bedRateNum >= 90 ? "bg-rose-500" : "bg-teal-600"
                    }`}
                    style={{ width: `${Math.min(100, bedRateNum)}%` }}
                  />
                </div>
              </div>
              <div className="bg-slate-50 rounded px-2 py-1 text-[10.5px] text-slate-600 flex justify-between items-center">
                <span>
                  Trống:{" "}
                  <strong className="font-mono text-emerald-700 font-bold">
                    {Math.max(0, totalBeds - occupiedBeds)}
                  </strong>
                </span>
                <span className="text-slate-500">Serializable</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">
                  DOANH THU &amp; VIỆN PHÍ
                </span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-xl font-bold text-teal-700 leading-none font-mono">
                  {formatVndCompact(tongDoanhThu)}
                </span>
                <span className="text-[10.5px] text-slate-500">VND</span>
              </div>
              <div className="bg-slate-50 rounded px-2 py-1 text-[10.5px] text-slate-600 flex justify-between items-center">
                <span>
                  BHYT ({bhytPercent}%):{" "}
                  <strong className="font-mono text-teal-700 font-bold">
                    {formatVndCompact(tongBHYT)}
                  </strong>
                </span>
                <span>
                  BN:{" "}
                  <strong className="font-mono text-slate-800">
                    {formatVndCompact(tongBNTra)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold truncate">
                  HÓA ĐƠN ĐIỆN TỬ
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl font-bold text-slate-900 leading-none font-mono">
                  {totalInvoices}
                </span>
                <span className="text-[10.5px] text-teal-700 font-semibold">{paidRate}% Thu</span>
              </div>
              <div className="bg-slate-50 rounded px-2 py-1 text-[10.5px] text-slate-600 flex justify-between items-center">
                <span>
                  Đã thu:{" "}
                  <strong className="font-mono text-teal-700 font-bold">{soHoaDonDaThu}</strong>
                </span>
                <span className="text-rose-600 font-medium">
                  Chờ: <strong className="font-mono font-bold">{soHoaDonChuaThu}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* ROW 3: 2-COLUMN WORKSPACE */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
            {/* LEFT (7 COLS): 7 SUBSYSTEMS */}
            <div className="lg:col-span-7 bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-col min-h-0">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h2 className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">
                    CÁC PHÂN HỆ NGHIỆP VỤ BỆNH VIỆN
                  </h2>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-semibold font-mono">
                  {accessibleSubsystems.length} phân hệ khả dụng
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
                {accessibleSubsystems.map((sub, idx) => {
                  const Icon = sub.icon;
                  const isFullSpan =
                    accessibleSubsystems.length % 2 === 1 && idx === accessibleSubsystems.length - 1;

                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className={`group p-2.5 rounded-lg border transition-all flex flex-col justify-between bg-slate-50/70 hover:bg-teal-50/40 border-slate-200/80 hover:border-teal-300 ${
                        isFullSpan ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${sub.iconBgClass}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <h3 className="text-[12.5px] font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                              {sub.title}
                            </h3>
                          </div>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[9.5px] font-semibold shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Thao tác
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-snug line-clamp-2">
                          {sub.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 font-mono text-[10px] text-slate-400">
                        <span>Mod: {sub.modulePath}</span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 ${sub.arrowColorClass} group-hover:translate-x-1 transition-transform`}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* RIGHT (5 COLS): RBAC MATRIX + DEPARTMENT BED STATUS */}
            <div className="lg:col-span-5 flex flex-col gap-2.5 min-h-0">
              {/* PANEL 1: RBAC MATRIX */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs shrink-0">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <h3 className="text-[12px] font-bold text-slate-900">
                      MA TRẬN PHÂN QUYỀN RBAC (5 VAI TRÒ)
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[9.5px] font-bold">
                    YOU: {user.role}
                  </span>
                </div>

                <div className="overflow-x-auto mt-1.5">
                  <table className="w-full text-left text-[10.5px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[9.5px] uppercase">
                        <th className="py-1 pr-1 font-semibold">Vai trò</th>
                        <th className="py-1 px-1 text-center font-semibold">Lâm sàng</th>
                        <th className="py-1 px-1 text-center font-semibold">Cận LS</th>
                        <th className="py-1 px-1 text-center font-semibold">Dược</th>
                        <th className="py-1 px-1 text-center font-semibold">T.Ngân</th>
                        <th className="py-1 pl-1 text-center font-semibold">Q.Trị</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                      {RBAC_MATRIX.map((row) => {
                        const isMe = row.role === user.role;
                        return (
                          <tr
                            key={row.role}
                            className={isMe ? "bg-teal-50/70 font-bold" : ""}
                          >
                            <td className="py-1 pr-1 text-slate-800 flex items-center gap-1">
                              <span className={isMe ? "text-teal-700" : ""}>{row.role}</span>
                              {isMe && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                            </td>
                            <td className={`py-1 px-1 text-center ${row.clinical.cls}`}>
                              {row.clinical.text}
                            </td>
                            <td className={`py-1 px-1 text-center ${row.cls.cls}`}>
                              {row.cls.text}
                            </td>
                            <td className={`py-1 px-1 text-center ${row.pharmacy.cls}`}>
                              {row.pharmacy.text}
                            </td>
                            <td className={`py-1 px-1 text-center ${row.billing.cls}`}>
                              {row.billing.text}
                            </td>
                            <td className={`py-1 pl-1 text-center ${row.admin.cls}`}>
                              {row.admin.text}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PANEL 2: BED OCCUPANCY BY DEPARTMENT */}
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-xs flex flex-col justify-between flex-1 min-h-0">
                <div className="min-h-0 flex flex-col flex-1">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-teal-600" />
                      <h3 className="text-[12px] font-bold text-slate-900">
                        TÌNH TRẠNG GIƯỜNG BỆNH THEO KHOA
                      </h3>
                    </div>
                    <Link
                      href="/inpatient"
                      className="text-[10.5px] text-teal-700 hover:underline flex items-center font-semibold"
                    >
                      Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-2 mt-2 overflow-y-auto flex-1 pr-0.5">
                    {departmentBedStats.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4 text-center">
                        Chưa có dữ liệu giường bệnh từ máy chủ.
                      </div>
                    ) : (
                      departmentBedStats.map((dept) => {
                        const isCritical = dept.rate >= 90;
                        const isWarning = dept.rate >= 70 && dept.rate < 90;
                        return (
                          <div
                            key={dept.maKhoa}
                            className={`p-2 rounded-lg border ${
                              isCritical
                                ? "bg-rose-50/60 border-rose-200"
                                : "bg-slate-50/70 border-slate-200/70"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`font-mono text-[9.5px] px-1.5 py-0.5 rounded font-bold text-white ${
                                    isCritical
                                      ? "bg-rose-600"
                                      : isWarning
                                        ? "bg-amber-600"
                                        : "bg-teal-600"
                                  }`}
                                >
                                  {dept.maKhoa}
                                </span>
                                <span className="text-[11.5px] font-semibold text-slate-900 truncate">
                                  {dept.tenKhoa}
                                </span>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase shrink-0 ${
                                  isCritical
                                    ? "bg-rose-600 text-white"
                                    : isWarning
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-teal-50 text-teal-800 border border-teal-200"
                                }`}
                              >
                                {isCritical
                                  ? `NGUY CẤP ${dept.rate}%`
                                  : isWarning
                                    ? `GẦN ĐẦY ${dept.rate}%`
                                    : `ỔN ĐỊNH ${dept.rate}%`}
                              </span>
                            </div>

                            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isCritical
                                    ? "bg-rose-600"
                                    : isWarning
                                      ? "bg-amber-500"
                                      : "bg-teal-600"
                                }`}
                                style={{ width: `${Math.min(100, dept.rate)}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center mt-1 font-mono text-[10px]">
                              <span
                                className={`font-bold ${
                                  isCritical ? "text-rose-600" : "text-teal-700"
                                }`}
                              >
                                {dept.occupied} / {dept.total} giường
                              </span>
                              <span className="text-slate-500">
                                Còn {dept.available} giường trống
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-500 mt-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    Cập nhật lúc: <span className="font-mono">{lastSyncedAt}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshAll}
                    className="text-teal-700 hover:underline font-semibold"
                  >
                    Đồng bộ lại
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
