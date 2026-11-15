"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  BedDouble,
  Building2,
  Calendar,
  CreditCard,
  FlaskConical,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ROLE_LABELS, Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleEnum, TrangThaiGiuongEnum } from "@/types";

const ALL_ROLES = [
  RoleEnum.ADMIN,
  RoleEnum.BAC_SI,
  RoleEnum.DIEU_DUONG,
  RoleEnum.KY_THUAT_VIEN,
  RoleEnum.TIEP_NHAN,
  RoleEnum.THU_NGAN,
];

function formatVnd(val: number | string | undefined) {
  return `${Number(val || 0).toLocaleString("vi-VN")} ₫`;
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState("2026-11-15");

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.dashboardReport(selectedDate),
    queryFn: () => hospitalApi.report.getDashboard(selectedDate),
    enabled: !!token,
  });

  const { data: departments = [] } = useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: hospitalApi.department.getAll,
    enabled: !!token,
  });

  const { data: bedMap = [] } = useQuery({
    queryKey: QUERY_KEYS.bedsMap(selectedDate),
    queryFn: () => hospitalApi.department.getBedMap(selectedDate),
    enabled: !!token,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: QUERY_KEYS.staff(),
    queryFn: () => hospitalApi.staff.getAll(),
    enabled: !!token,
  });

  const { data: profile } = useQuery({
    queryKey: QUERY_KEYS.authProfile,
    queryFn: hospitalApi.auth.getProfile,
    enabled: !!token,
  });

  const shortcuts = [
    {
      label: "Tiếp đón & Thẻ BHYT",
      href: "/reception",
      icon: UserPlus,
      roles: [RoleEnum.ADMIN, RoleEnum.TIEP_NHAN, RoleEnum.THU_NGAN],
      desc: "Hồ sơ BENH_NHAN, THE_BHYT, mở LUOT_KHAM",
    },
    {
      label: "Khám lâm sàng & Kê đơn",
      href: "/clinical",
      icon: Stethoscope,
      roles: [RoleEnum.ADMIN, RoleEnum.BAC_SI],
      desc: "LUOT_KHAM, DON_THUOC (snapshot), chỉ định XN",
    },
    {
      label: "Xét nghiệm & Trả KQ CLS",
      href: "/laboratory",
      icon: FlaskConical,
      roles: [RoleEnum.ADMIN, RoleEnum.KY_THUAT_VIEN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
      desc: "Quy trình 2 bước start / complete PHIEU_XET_NGHIEM",
    },
    {
      label: "Nội trú & Sơ đồ giường",
      href: "/inpatient",
      icon: BedDouble,
      roles: [RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG],
      desc: "DOT_NOI_TRU, PHAN_GIUONG theo ngày, xuất viện",
    },
    {
      label: "Thu ngân & Viện phí",
      href: "/cashier",
      icon: CreditCard,
      roles: [RoleEnum.ADMIN, RoleEnum.THU_NGAN, RoleEnum.TIEP_NHAN],
      desc: "Preview V_VIEN_PHI, chọn 1 THE_BHYT, chốt TT",
    },
    {
      label: "Quản trị Hệ thống",
      href: "/admin",
      icon: Users,
      roles: [RoleEnum.ADMIN],
      desc: "CRUD KHOA, PHONG, GIUONG, NHAN_VIEN (d, p)",
    },
  ].filter((item) => user?.role && item.roles.includes(user.role));

  const readyBeds = bedMap.filter((b) => b.TrangThai === TrangThaiGiuongEnum.SAN_SANG).length;
  const occupiedBeds = bedMap.filter((b) => b.dangCoNguoiNam).length;

  return (
    <AuthGuard allowedRoles={ALL_ROLES}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-teal-50 text-teal-700 border border-teal-200">
                  QLBV v2.0 · 18 BẢNG · BR-V2-01..13
                </span>
                <span className="text-xs text-slate-500">
                  Thâm niên của bạn:{" "}
                  <strong className="text-indigo-700 font-mono">
                    {profile?.SoNamCongTac ?? user?.SoNamCongTac ?? 0} năm
                  </strong>{" "}
                  (V_NHAN_VIEN)
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Xin chào, {profile?.HoTen || user?.hoTen} ({user?.role ? ROLE_LABELS[user.role] : ""})
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-slate-600 font-medium">Ngày báo cáo:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono font-semibold text-slate-900 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>
          </header>

          <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* KPI CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tổng Bệnh nhân (BENH_NHAN)</span>
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-2">
                  {dashboard?.tongBenhNhan ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lượt khám toàn viện: <strong>{dashboard?.tongLuotKham ?? 0}</strong>
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Đợt Nội trú đang mở (BR-V2-12)</span>
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-indigo-700 mt-2">
                  {dashboard?.soDotNoiTruDangMo ?? 0}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  DOT_NOI_TRU có NgayRaVien IS NULL
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Công suất giường ngày {selectedDate}</span>
                  <BedDouble className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold text-sky-700 mt-2">
                  {dashboard?.congSuatGiuong.giuongDangCoNguoiNam ?? occupiedBeds} /{" "}
                  {dashboard?.congSuatGiuong.giuongSanSang ?? readyBeds}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tỷ lệ lấp đầy:{" "}
                  <strong>{dashboard?.congSuatGiuong.tyLeLapDay ?? 0}%</strong> · Bảo trì:{" "}
                  {dashboard?.congSuatGiuong.giuongBaoTri ?? 0}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Thực thu Viện phí (V_VIEN_PHI)</span>
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold text-emerald-700 mt-2">
                  {formatVnd(dashboard?.doanhThu.daThanhToan.ThucThu)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Chưa TT: {formatVnd(dashboard?.doanhThu.chuaThanhToan.ThucThu)} · BHYT:{" "}
                  {formatVnd(dashboard?.doanhThu.TruBHYT)}
                </p>
              </div>
            </section>

            {/* REVENUE BREAKDOWN */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Cơ cấu Doanh thu chuẩn v2 (Thuốc + Xét nghiệm - Trừ BHYT = Thực thu)
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">
                    VIEW: V_VIEN_PHI
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-500">TongTienThuoc</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {formatVnd(dashboard?.doanhThu.TongTienThuoc)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-slate-500">TongTienDichVu (XN)</div>
                    <div className="font-bold text-slate-900 mt-1">
                      {formatVnd(dashboard?.doanhThu.TongTienDichVu)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-amber-800">TruBHYT (≤ 1 thẻ)</div>
                    <div className="font-bold text-amber-900 mt-1">
                      -{formatVnd(dashboard?.doanhThu.TruBHYT)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-emerald-800">ThucThu (Tổng)</div>
                    <div className="font-bold text-emerald-900 mt-1">
                      {formatVnd(dashboard?.doanhThu.ThucThu)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">
                    Lối tắt nghiệp vụ theo vai trò ({user?.role})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {shortcuts.map((s) => {
                      const Icon = s.icon;
                      return (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {s.label}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{s.desc}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STAFF & DEPARTMENTS SUMMARY */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    Khoa & Nhân sự (SoNamCongTac)
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">
                    {departments.length} khoa
                  </span>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {departments.map((k) => (
                    <div
                      key={k.MaKhoa}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {k.TenKhoa} <span className="font-mono text-slate-500">({k.MaKhoa})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{k.DiaDiem}</div>
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200">
                        {k._count?.nhanViens ?? 0} NV
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Nhân sự & Thâm niên dẫn xuất
                  </h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {staffList.slice(0, 8).map((nv) => (
                      <div
                        key={nv.MaNV}
                        className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0"
                      >
                        <div className="min-w-0">
                          <span className="font-mono font-semibold text-teal-700">{nv.MaNV}</span>{" "}
                          <span className="text-slate-800">{nv.HoTen}</span>
                        </div>
                        <span className="font-mono text-indigo-700 shrink-0 ml-2">
                          {nv.SoNamCongTac ?? 0} năm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
