"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BedDouble,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileCheck2,
  Filter,
  FlaskConical,
  LayoutDashboard,
  Pill,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { hospitalApi } from "@/services/hospitalApi";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DichVu,
  LoaiDichVuEnum,
  RoleEnum,
  SuDungDv,
} from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: RoleEnum[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "TỔNG QUAN",
    items: [
      {
        label: "Bảng điều khiển",
        href: "/",
        icon: LayoutDashboard,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
          RoleEnum.NV_HANH_CHINH,
          RoleEnum.THU_NGAN,
          RoleEnum.DUOC_SI,
        ],
      },
    ],
  },
  {
    group: "TIẾP ĐÓN & LÂM SÀNG",
    items: [
      {
        label: "Tiếp đón & Hồ sơ BN",
        href: "/reception",
        icon: UserPlus,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.NV_HANH_CHINH],
      },
      {
        label: "Khám lâm sàng & Kê đơn",
        href: "/clinical",
        icon: Stethoscope,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.BAC_SI],
      },
      {
        label: "Cận lâm sàng & XN",
        href: "/laboratory",
        icon: FlaskConical,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
        ],
      },
    ],
  },
  {
    group: "ĐIỀU TRỊ & HẬU CẦN",
    items: [
      {
        label: "Nội trú & Sơ đồ giường",
        href: "/inpatient",
        icon: BedDouble,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
        ],
      },
      {
        label: "Kho dược & Phát thuốc",
        href: "/pharmacy",
        icon: Pill,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.DUOC_SI],
      },
      {
        label: "Khoa & Phòng",
        href: "/departments",
        icon: Building2,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI],
      },
    ],
  },
  {
    group: "TÀI CHÍNH & VẬN HÀNH",
    items: [
      {
        label: "Thu ngân & Viện phí",
        href: "/billing",
        icon: CreditCard,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.THU_NGAN],
      },
      {
        label: "Quản trị & Lịch trực",
        href: "/staff",
        icon: Users,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI],
      },
    ],
  },
];

const LOAI_DV_LABELS: Record<string, string> = {
  [LoaiDichVuEnum.XET_NGHIEM]: "XÉT NGHIỆM",
  [LoaiDichVuEnum.CDHA]: "CĐHA",
  [LoaiDichVuEnum.THU_THUAT]: "THỦ THUẬT",
  [LoaiDichVuEnum.KHAM]: "KHÁM",
};

const _ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị hệ thống",
  QUAN_TRI: "Quản trị viên",
  BAC_SI: "Bác sĩ Lâm sàng",
  DIEU_DUONG: "Điều dưỡng / KTV CLS",
  NV_HANH_CHINH: "NV Hành chính",
  THU_NGAN: "Thu ngân",
  DUOC_SI: "Dược sĩ",
};

function formatVnd(amount: number | string | undefined | null): string {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return "0 đ";
  return `${n.toLocaleString("vi-VN")} đ`;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name?: string | null): string {
  if (!name) return "KV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAge(dob?: string | null): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const age = new Date().getFullYear() - d.getFullYear();
  return `${age}T`;
}

function getBirthYear(dob?: string | null): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}`;
}

export default function LaboratoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pendingList, setPendingList] = useState<SuDungDv[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [selectedItem, setSelectedItem] = useState<SuDungDv | null>(null);

  // Filters
  const [queueCategory, setQueueCategory] = useState<string>("ALL");
  const [queueSearch, setQueueSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<string>("ALL");
  const [catalogSearch, setCatalogSearch] = useState("");

  // Result form
  const [ketQuaCLS, setKetQuaCLS] = useState(
    "Các chỉ số trong giới hạn sinh lý bình thường. Chưa ghi nhận bất thường bệnh lý."
  );
  const [maKTVThucHien, setMaKTVThucHien] = useState("DD01");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === RoleEnum.DIEU_DUONG && user?.maNV) {
      setMaKTVThucHien(user.maNV);
    }
  }, [user?.maNV, user?.role]);

  const showNotice = useCallback((type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  }, []);

  const loadLabData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, srvRes] = await Promise.allSettled([
        hospitalApi.clinicalService.getPending(),
        hospitalApi.clinicalService.getAllServices(),
      ]);

      if (pendingRes.status === "rejected") {
        showNotice(
          "error",
          "Tài khoản hiện tại không có quyền xem hàng đợi trả kết quả CLS (chỉ ADMIN hoặc DIEU_DUONG)."
        );
      }

      const pending =
        pendingRes.status === "fulfilled" ? pendingRes.value : [];
      const srvList = srvRes.status === "fulfilled" ? srvRes.value : [];

      setPendingList(pending);
      setServices(srvList);

      setSelectedItem((prev) => {
        if (pending.length === 0) return null;
        if (!prev) return pending[0];
        return (
          pending.find(
            (p) =>
              p.MaLuotKham === prev.MaLuotKham &&
              p.MaDV === prev.MaDV &&
              p.ThoiGianChiDinh === prev.ThoiGianChiDinh
          ) || pending[0]
        );
      });
    } catch {
      showNotice("error", "Không thể tải hàng đợi Cận lâm sàng.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      void loadLabData();
    }
  }, [mounted, isAuthenticated, loadLabData]);

  const serviceMap = useMemo(() => {
    const map = new Map<string, DichVu>();
    services.forEach((s) => map.set(s.MaDV, s));
    return map;
  }, [services]);

  // Sidebar navigation is handled by shared <Sidebar />

  const serviceStats = useMemo(() => {
    let xn = 0;
    let cdha = 0;
    let tt = 0;
    let bhyt = 0;
    services.forEach((s) => {
      if (s.LoaiDichVu === LoaiDichVuEnum.XET_NGHIEM) xn += 1;
      else if (s.LoaiDichVu === LoaiDichVuEnum.CDHA) cdha += 1;
      else if (s.LoaiDichVu === LoaiDichVuEnum.THU_THUAT) tt += 1;
      if (s.ThuocBHYTChiTra) bhyt += 1;
    });
    const pct =
      services.length > 0 ? ((bhyt / services.length) * 100).toFixed(1) : "0";
    return { xn, cdha, tt, bhyt, pct };
  }, [services]);

  const queueCounts = useMemo(() => {
    let xn = 0;
    let cdha = 0;
    let tt = 0;
    pendingList.forEach((item) => {
      const cat = item.dichVu?.LoaiDichVu || serviceMap.get(item.MaDV)?.LoaiDichVu;
      if (cat === LoaiDichVuEnum.XET_NGHIEM) xn += 1;
      else if (cat === LoaiDichVuEnum.CDHA) cdha += 1;
      else if (cat === LoaiDichVuEnum.THU_THUAT) tt += 1;
    });
    return { total: pendingList.length, xn, cdha, tt };
  }, [pendingList, serviceMap]);

  const filteredPending = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    return pendingList.filter((item) => {
      const svc = item.dichVu || serviceMap.get(item.MaDV);
      if (queueCategory !== "ALL" && svc?.LoaiDichVu !== queueCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.MaLuotKham,
        item.MaDV,
        svc?.TenDV,
        item.luotKham?.MaBN,
        item.luotKham?.benhNhan?.HoTen,
        item.luotKham?.benhNhan?.CCCD,
        item.luotKham?.benhNhan?.SoBHYT,
        item.GhiChu,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [pendingList, queueCategory, queueSearch, serviceMap]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return services.filter((s) => {
      if (catalogCategory !== "ALL" && s.LoaiDichVu !== catalogCategory) {
        return false;
      }
      if (!q) return true;
      return (
        s.MaDV.toLowerCase().includes(q) ||
        s.TenDV.toLowerCase().includes(q)
      );
    });
  }, [services, catalogCategory, catalogSearch]);

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!ketQuaCLS.trim() || !maKTVThucHien.trim()) {
      showNotice(
        "error",
        "Vui lòng nhập đầy đủ Mã KTV thực hiện và Nội dung kết quả."
      );
      return;
    }

    setSubmitting(true);
    try {
      await hospitalApi.clinicalService.updateResult({
        maLuotKham: selectedItem.MaLuotKham,
        maDV: selectedItem.MaDV,
        thoiGianChiDinh: selectedItem.ThoiGianChiDinh,
        ketQuaCLS: ketQuaCLS.trim(),
        maKTVThucHien: maKTVThucHien.trim(),
      });
      showNotice(
        "success",
        `Đã trả kết quả CLS thành công cho ${selectedItem.MaLuotKham} - ${selectedItem.MaDV}!`
      );
      await loadLabData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Lỗi cập nhật kết quả cận lâm sàng.";
      showNotice("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dfe9f5] text-[#3d4947] text-sm">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  const selectedService = selectedItem
    ? selectedItem.dichVu || serviceMap.get(selectedItem.MaDV)
    : undefined;

  return (
    <div className="bg-[#dfe9f5] text-[#0b1c30] antialiased h-screen w-screen overflow-hidden flex">
      {/* Shared Left Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#bcc9c6]/40 z-30 flex items-center justify-between px-4 shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="hidden xl:flex items-center gap-1.5 text-[#6d7a77] text-[12px] shrink-0">
              <Link href="/" className="hover:text-[#00685f] font-medium">
                Hệ thống HIS
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0b1c30] font-semibold">
                Cận lâm sàng &amp; Xét nghiệm
              </span>
            </div>

            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-[#6d7a77] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Tìm mã lượt khám, mã DV, tên dịch vụ..."
                className="w-full h-8 pl-8 pr-12 rounded-lg bg-[#eff4ff] border border-[#bcc9c6]/40 text-[12px] text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="px-1 py-0.5 rounded bg-[#e5eeff] text-[9px] font-mono text-[#3d4947] border border-[#bcc9c6]/30">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => void loadLabData()}
              disabled={loading}
              title="Làm mới dữ liệu"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <div className="relative">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff]"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
            </div>
            <div className="h-3.5 w-[1px] bg-[#bcc9c6]/40 mx-0.5 hidden md:block" />
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#cce5ff] text-[#00476e] text-[11px] font-semibold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Khoa Xét nghiệm &amp; CĐHA</span>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#006398] text-white text-[10px] font-bold flex items-center justify-center">
                {getInitials(user?.hoTen || user?.maNV)}
              </div>
              <div className="hidden 2xl:flex flex-col">
                <span className="text-[11.5px] font-semibold text-[#0b1c30] leading-tight">
                  {user?.hoTen || user?.maNV}
                </span>
                <span className="font-mono text-[9.5px] text-[#006398] font-semibold">
                  {user?.maNV || user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 w-full p-2.5 bg-[#dfe9f5] overflow-hidden flex flex-col min-h-0 gap-2">
          {/* Top Stat Bar & Filter Controls */}
          <div className="shrink-0 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2 px-0.5">
            {/* 3 KPI Cards */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white shadow-xs shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#ffdad6]/70 flex items-center justify-center text-[#ba1a1a] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[9.5px] text-[#6d7a77] uppercase tracking-wider font-semibold">
                    Chỉ định đang chờ
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-[#0b1c30] leading-none font-mono">
                      {pendingList.length}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[9.5px] font-semibold leading-none">
                      Cần xử lý
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white shadow-xs shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#dce9ff] flex items-center justify-center text-[#006398] shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[9.5px] text-[#6d7a77] uppercase tracking-wider font-semibold">
                    Tổng dịch vụ kỹ thuật
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-[#0b1c30] leading-none font-mono">
                      {services.length}
                    </span>
                    <span className="text-[#3d4947] font-mono text-[10px] leading-none">
                      XN: {serviceStats.xn} | CĐHA: {serviceStats.cdha} | TT:{" "}
                      {serviceStats.tt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white shadow-xs shrink-0">
                <div className="w-7 h-7 rounded-lg bg-[#9cf2e8]/70 flex items-center justify-center text-[#006860] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[9.5px] text-[#6d7a77] uppercase tracking-wider font-semibold">
                    BHYT Chi trả
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-[#006860] leading-none font-mono">
                      {serviceStats.bhyt} / {services.length}
                    </span>
                    <span className="font-mono text-[10px] text-[#3d4947] font-semibold leading-none">
                      ({serviceStats.pct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter Pills + Search + Refresh */}
            <div className="flex items-center gap-1.5 flex-wrap xl:flex-nowrap justify-end">
              <div className="flex items-center p-0.5 rounded-lg bg-[#eff4ff] shadow-xs shrink-0">
                {(
                  [
                    {
                      key: "ALL",
                      label: `Tất cả (${queueCounts.total})`,
                    },
                    {
                      key: LoaiDichVuEnum.XET_NGHIEM,
                      label: `Xét nghiệm (${queueCounts.xn})`,
                    },
                    {
                      key: LoaiDichVuEnum.CDHA,
                      label: `CĐHA (${queueCounts.cdha})`,
                    },
                    {
                      key: LoaiDichVuEnum.THU_THUAT,
                      label: `Thủ thuật (${queueCounts.tt})`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setQueueCategory(tab.key)}
                    className={`px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold transition-colors whitespace-nowrap ${
                      queueCategory === tab.key
                        ? "bg-white text-[#00685f] shadow-xs"
                        : "text-[#3d4947] hover:text-[#0b1c30]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-36 shrink-0 hidden 2xl:block">
                <Filter className="w-3.5 h-3.5 text-[#6d7a77] absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder="Lọc mã LK, dịch vụ..."
                  className="w-full h-7.5 pl-7 pr-2.5 text-[11px] rounded-lg bg-white text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none shadow-xs focus:ring-1 focus:ring-[#00685f]"
                />
              </div>

              <button
                type="button"
                onClick={() => void loadLabData()}
                disabled={loading}
                className="h-8.5 px-3 flex items-center gap-1.5 rounded-lg bg-white text-[#00685f] hover:bg-[#e5eeff] transition-colors shadow-xs text-[12px] font-semibold whitespace-nowrap shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 ${
                feedback.type === "success"
                  ? "bg-[#89f5e7]/40 border-[#00685f]/30 text-[#005049]"
                  : "bg-[#ffdad6] border-[#ba1a1a]/30 text-[#93000a]"
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-0.5 hover:opacity-70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main 2-Column Split: 38% Left / 62% Right */}
          <div className="flex-1 flex flex-col lg:flex-row gap-2.5 min-h-0 overflow-hidden">
            {/* LEFT COLUMN: Pending Queue (38%) */}
            <section className="w-full lg:w-[38%] flex flex-col h-full bg-white rounded-xl shadow-xs overflow-hidden min-h-0 border border-[#bcc9c6]/30">
              <div className="px-3 py-2 flex items-center justify-between bg-[#eff4ff]/60 shrink-0 border-b border-[#e5eeff]">
                <div className="flex items-center gap-2 min-w-0">
                  <FlaskConical className="w-4 h-4 text-[#00685f] shrink-0" />
                  <h2 className="text-[12.5px] font-bold text-[#0b1c30] truncate">
                    Hàng Đợi Chỉ Định CLS
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#cce5ff] text-[#004b73] font-mono text-[9.5px] font-bold whitespace-nowrap shrink-0">
                    {filteredPending.length} Yêu cầu
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#006860] whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006860] animate-pulse" />
                  Chờ thực hiện
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                {loading && pendingList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6d7a77]">
                    Đang tải hàng đợi chỉ định CLS...
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6d7a77]">
                    Không có chỉ định nào đang chờ thực hiện.
                  </div>
                ) : (
                  filteredPending.map((item, idx) => {
                    const svc = item.dichVu || serviceMap.get(item.MaDV);
                    const bn = item.luotKham?.benhNhan;
                    const bsName = item.luotKham?.bacSi?.nhanVien?.HoTen;
                    const phong = item.luotKham?.MaPhongKham;
                    const bhytPct = bn?.MucHuongBHYT ?? 0;
                    const isSelected =
                      selectedItem?.MaLuotKham === item.MaLuotKham &&
                      selectedItem?.MaDV === item.MaDV &&
                      selectedItem?.ThoiGianChiDinh === item.ThoiGianChiDinh;
                    const cat = svc?.LoaiDichVu || LoaiDichVuEnum.XET_NGHIEM;
                    return (
                      <button
                        key={`${item.MaLuotKham}-${item.MaDV}-${item.ThoiGianChiDinh}-${idx}`}
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? "bg-[#008378]/10 border-l-4 border-[#00685f] shadow-xs"
                            : "bg-[#eff4ff] hover:bg-[#e5eeff] border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wide uppercase ${
                              cat === LoaiDichVuEnum.THU_THUAT
                                ? "bg-[#ffdad6] text-[#ba1a1a]"
                                : cat === LoaiDichVuEnum.CDHA
                                  ? "bg-[#cce5ff] text-[#004b73]"
                                  : "bg-[#d3e4fe] text-[#004b73]"
                            }`}
                          >
                            {LOAI_DV_LABELS[cat] || cat}
                          </span>
                          <span className="font-mono text-[10px] text-[#00685f] font-bold">
                            {formatTime(item.ThoiGianChiDinh)}
                          </span>
                        </div>

                        <h3 className="text-[12px] font-bold text-[#0b1c30] leading-snug line-clamp-2">
                          {svc?.TenDV || item.MaDV}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5 flex-nowrap overflow-hidden whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[9.5px] font-semibold shrink-0">
                            {item.MaLuotKham}
                          </span>
                          {bn?.MaBN && (
                            <span className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#3d4947] font-mono text-[9.5px] shrink-0">
                              {bn.MaBN}
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-[#0b1c30] truncate">
                            {bn?.HoTen || `SL: ${item.SoLuong}`}
                          </span>
                          {bn && (
                            <span className="text-[10px] text-[#3d4947] shrink-0">
                              • {getAge(bn.NgaySinh)} {bn.GioiTinh}
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 pt-1 flex items-center justify-between text-[10.5px] text-[#3d4947] bg-white/80 rounded px-2 py-1 gap-2">
                          <span className="truncate flex items-center gap-1">
                            <Stethoscope className="w-3 h-3 text-[#6d7a77] shrink-0" />
                            <span className="truncate">
                              {bsName
                                ? `${bsName}${phong ? ` (${phong})` : ""}`
                                : formatDateTime(item.ThoiGianChiDinh)}
                            </span>
                          </span>
                          <div className="flex items-center gap-1 font-mono shrink-0">
                            <span className="font-bold text-[#00685f]">
                              {formatVnd(item.DonGiaDV)}
                            </span>
                            {svc?.ThuocBHYTChiTra && bhytPct > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-[#9cf2e8] text-[#00504a] text-[9px] font-bold font-sans">
                                BHYT {bhytPct}%
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-2 px-3 bg-[#eff4ff]/60 flex items-center justify-between text-[10px] text-[#3d4947] shrink-0 border-t border-[#e5eeff]">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-ping" />
                  Đồng bộ LIS/PACS
                </span>
                <span className="font-mono">
                  Hiển thị {filteredPending.length}/{pendingList.length} yêu cầu
                </span>
              </div>
            </section>

            {/* RIGHT COLUMN: Part A (Result Input) + Part B (Catalog) */}
            <div className="w-full lg:w-[62%] flex flex-col h-full gap-2 min-h-0 overflow-hidden">
              {/* PART A: PHIẾU NHẬP & TRẢ KẾT QUẢ CLS */}
              <section className="flex-1 flex flex-col bg-white rounded-xl shadow-xs overflow-hidden min-h-0 border border-[#bcc9c6]/30">
                {!selectedItem ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-[#6d7a77]">
                    <FileCheck2 className="w-8 h-8 mb-2 text-[#6d7a77]" />
                    <p>
                      Chọn một chỉ định từ hàng đợi bên trái để nhập và trả kết
                      quả CLS.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Context Banner */}
                    {(() => {
                      const bn = selectedItem.luotKham?.benhNhan;
                      const unitPrice = Number(selectedItem.DonGiaDV || 0);
                      const bhytPct =
                        selectedService?.ThuocBHYTChiTra && bn?.MucHuongBHYT
                          ? bn.MucHuongBHYT
                          : 0;
                      const bhytCover = Math.round((unitPrice * bhytPct) / 100);
                      const patientPay = unitPrice - bhytCover;
                      return (
                        <div className="p-2.5 px-3 bg-[#eff4ff]/80 flex items-center justify-between gap-3 shrink-0 border-b border-[#e5eeff]">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-[#008378] text-white flex items-center justify-center font-bold text-[13px] shadow-xs shrink-0 ring-2 ring-white">
                              {getInitials(bn?.HoTen || selectedItem.MaDV)}
                            </div>
                            <div className="flex flex-col min-w-0 gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-bold text-[#0b1c30] truncate leading-tight">
                                  {bn?.HoTen ||
                                    selectedService?.TenDV ||
                                    selectedItem.MaDV}
                                </span>
                                {bn && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4947] text-[10px] font-medium">
                                    {bn.GioiTinh}, {getBirthYear(bn.NgaySinh)} (
                                    {getAge(bn.NgaySinh)})
                                  </span>
                                )}
                                {bn?.SoBHYT && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#d3e4fe] text-[#004b73] border border-[#bcc9c6]/30">
                                    <ShieldCheck className="w-3 h-3 text-[#00685f]" />
                                    <span className="font-mono text-[10px] font-bold">
                                      {bn.SoBHYT}
                                    </span>
                                    <span className="px-1 rounded bg-white text-[#00685f] text-[9px] font-bold">
                                      {bhytPct}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                                <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-mono font-bold">
                                  Lượt khám: {selectedItem.MaLuotKham}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#006398] font-mono font-bold">
                                  Mã DV: {selectedItem.MaDV} (
                                  {selectedService?.TenDV || selectedItem.MaDV})
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-white text-[#3d4947] font-mono border border-[#bcc9c6]/30">
                                  {formatDateTime(selectedItem.ThoiGianChiDinh)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:flex flex-col items-end pl-3 border-l border-[#bcc9c6]/40 shrink-0">
                            <div className="px-2.5 py-1 rounded-lg bg-white border border-[#bcc9c6]/30 flex flex-col items-end">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[9.5px] uppercase text-[#6d7a77] font-semibold">
                                  Tổng đơn giá:
                                </span>
                                <span className="text-[13px] font-bold text-[#00685f] font-mono">
                                  {formatVnd(unitPrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[9.5px]">
                                <span className="px-1.5 py-0.5 rounded bg-[#9cf2e8] text-[#00504a] font-bold">
                                  BHYT: {formatVnd(bhytCover)}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30] font-semibold">
                                  BN trả: {formatVnd(patientPay)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Result Form */}
                    <form
                      onSubmit={handleSubmitResult}
                      className="p-2.5 px-3 flex-1 flex flex-col justify-between overflow-hidden gap-2 min-h-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <label className="text-[10.5px] text-[#3d4947] font-semibold whitespace-nowrap">
                            Mã KTV / Điều dưỡng thực hiện *:
                          </label>
                          <input
                            type="text"
                            required
                            value={maKTVThucHien}
                            onChange={(e) => setMaKTVThucHien(e.target.value)}
                            placeholder="VD: DD01"
                            className="w-28 h-7 px-2 rounded-lg bg-[#eff4ff] border border-[#bcc9c6]/50 text-[11px] font-mono font-bold text-[#0b1c30] focus:outline-none focus:border-[#00685f]"
                          />
                        </div>

                        {/* Quick Template Insert Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setKetQuaCLS(
                                "WBC: 7.8 x10^9/L | RBC: 4.7 T/L | HGB: 142 g/L | PLT: 245 G/L. Kết luận: Các chỉ số trong giới hạn bình thường."
                              )
                            }
                            className="h-8 px-3 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11.5px] font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00685f]" />
                            <span>Mẫu bình thường</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setKetQuaCLS(
                                "WBC: 13.4 x10^9/L (Tăng) | CRP: 28 mg/L (Tăng). Kết luận: Theo dõi tình trạng viêm nhiễm cấp, đề nghị bác sĩ đối chiếu lâm sàng."
                              )
                            }
                            className="h-8 px-3 rounded-lg bg-[#ffdad6]/80 hover:bg-[#ffdad6] text-[#ba1a1a] text-[11.5px] font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Mẫu cảnh báo</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col min-h-0">
                        <label className="text-[10px] text-[#6d7a77] uppercase tracking-wider mb-1 flex items-center justify-between shrink-0 font-semibold">
                          <span>
                            Nội dung chi tiết chỉ số &amp; Kết luận Cận Lâm Sàng
                          </span>
                          <span className="text-[#00685f] font-mono text-[9.5px]">
                            PK: {selectedItem.MaLuotKham} • {selectedItem.MaDV}
                          </span>
                        </label>
                        <textarea
                          required
                          value={ketQuaCLS}
                          onChange={(e) => setKetQuaCLS(e.target.value)}
                          placeholder="Nhập chỉ số xét nghiệm, mô tả hình ảnh X-quang / siêu âm và kết luận..."
                          className="flex-1 min-h-[70px] w-full p-2.5 rounded-lg bg-[#eff4ff] font-mono text-[11px] text-[#0b1c30] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#00685f] border border-[#bcc9c6]/30"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-0.5 shrink-0">
                        <div className="flex items-center gap-1 text-[10.5px] text-[#3d4947] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00685f]" />
                          <span>Chuẩn trả kết quả LIS/PACS</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="h-9 px-3.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#0b1c30] text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                            <span>In Phiếu</span>
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="h-9 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[12.5px] font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                          >
                            <FileCheck2 className="w-4 h-4" />
                            <span>
                              {submitting
                                ? "Đang lưu..."
                                : "Xác Nhận & Hoàn Tất Trả Kết Quả"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </section>

              {/* PART B: BẢNG DANH MỤC DỊCH VỤ KỸ THUẬT & GIÁ */}
              <section className="flex-1 flex flex-col bg-white rounded-xl shadow-xs overflow-hidden min-h-0 border border-[#bcc9c6]/30">
                <div className="px-3 py-1.5 bg-[#eff4ff]/60 flex items-center justify-between gap-2 shrink-0 border-b border-[#e5eeff]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <BookOpen className="w-4 h-4 text-[#006398] shrink-0" />
                    <h3 className="text-[12px] font-bold text-[#0b1c30] truncate">
                      Danh Mục Dịch Vụ Kỹ Thuật &amp; Giá Viện Phí
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={catalogCategory}
                      onChange={(e) => setCatalogCategory(e.target.value)}
                      className="h-6.5 px-2 text-[10.5px] font-semibold rounded-md bg-white text-[#0b1c30] border border-[#bcc9c6]/40 focus:outline-none"
                    >
                      <option value="ALL">Tất cả phân loại</option>
                      <option value={LoaiDichVuEnum.XET_NGHIEM}>
                        Xét nghiệm
                      </option>
                      <option value={LoaiDichVuEnum.CDHA}>
                        CĐHA &amp; Thăm dò
                      </option>
                      <option value={LoaiDichVuEnum.THU_THUAT}>
                        Thủ thuật chuyên khoa
                      </option>
                    </select>

                    <div className="relative w-40">
                      <Search className="w-3 h-3 text-[#6d7a77] absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Tìm tên / mã DV..."
                        className="w-full h-6.5 pl-6 pr-2 text-[10.5px] rounded-md bg-white text-[#0b1c30] placeholder:text-[#6d7a77] border border-[#bcc9c6]/40 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#e5eeff] text-[#3d4947] text-[9.5px] uppercase tracking-wider sticky top-0 z-10 whitespace-nowrap">
                      <tr>
                        <th className="px-3 py-1.5 font-bold">Mã DV</th>
                        <th className="px-3 py-1.5 font-bold">
                          Tên Dịch Vụ Kỹ Thuật
                        </th>
                        <th className="px-2 py-1.5 font-bold text-center">
                          Phân loại
                        </th>
                        <th className="px-2 py-1.5 font-bold text-center">
                          ĐVT
                        </th>
                        <th className="px-3 py-1.5 font-bold text-right">
                          Đơn Giá Viện Phí
                        </th>
                        <th className="px-2 py-1.5 font-bold text-center">
                          BHYT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5eeff]">
                      {filteredCatalog.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-6 text-center text-[#6d7a77]"
                          >
                            Không có dịch vụ phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalog.map((s) => (
                          <tr
                            key={s.MaDV}
                            className="hover:bg-[#eff4ff]/60 transition-colors"
                          >
                            <td className="px-3 py-1.5 font-mono font-bold text-[#006398]">
                              {s.MaDV}
                            </td>
                            <td className="px-3 py-1.5 font-medium text-[#0b1c30]">
                              {s.TenDV}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#3d4947] text-[9.5px] font-semibold">
                                {LOAI_DV_LABELS[s.LoaiDichVu] || s.LoaiDichVu}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center text-[#3d4947]">
                              {s.DonViTinhDV}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-[#00685f]">
                              {formatVnd(s.DonGiaHienHanh ?? s.DonGia)}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              {s.ThuocBHYTChiTra ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#9cf2e8] text-[#00504a] text-[9.5px] font-bold">
                                  Có BHYT
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full bg-[#e5eeff] text-[#6d7a77] text-[9.5px] font-medium">
                                  Tự túc
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
