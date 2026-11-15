"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FlaskConical,
  HeartPulse,
  Hospital,
  Info,
  Layers,
  Lock,
  LogOut,
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
import { hospitalApi } from "@/services/hospitalApi";
import { extractApiError } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập Mã NV hoặc CCCD"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface PresetAccount {
  username: string;
  password: string;
  roleLabel: string;
  hoTen: string;
  donVi: string;
  dotColor: string;
  badgeClass: string;
  activeBorderClass: string;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    username: "ADMIN01",
    password: "123456",
    roleLabel: "ADMIN",
    hoTen: "Quản Trị Viên Hệ Thống",
    donVi: "Nhân sự Partial · Quản trị Khoa/Phòng",
    dotColor: "bg-rose-500",
    badgeClass: "bg-rose-50 border-rose-200 text-rose-700",
    activeBorderClass: "border-rose-400 bg-rose-50/50",
  },
  {
    username: "BS01",
    password: "123456",
    roleLabel: "BAC_SI",
    hoTen: "BS. CKI Trần Văn Nam",
    donVi: "Khoa Nội Tổng Hợp (K01)",
    dotColor: "bg-teal-500",
    badgeClass: "bg-teal-50 border-teal-200 text-teal-700",
    activeBorderClass: "border-teal-400 bg-teal-50/50",
  },
  {
    username: "BS02",
    password: "123456",
    roleLabel: "BAC_SI",
    hoTen: "ThS. BS Nguyễn Thị Mai",
    donVi: "Khoa Ngoại Tổng Hợp (K02)",
    dotColor: "bg-sky-500",
    badgeClass: "bg-sky-50 border-sky-200 text-sky-700",
    activeBorderClass: "border-sky-400 bg-sky-50/50",
  },
  {
    username: "DD01",
    password: "123456",
    roleLabel: "DIEU_DUONG",
    hoTen: "CN. Lê Thị Lan",
    donVi: "Điều dưỡng · Phân/Chuyển giường",
    dotColor: "bg-indigo-500",
    badgeClass: "bg-indigo-50 border-indigo-200 text-indigo-700",
    activeBorderClass: "border-indigo-400 bg-indigo-50/50",
  },
  {
    username: "KTV01",
    password: "123456",
    roleLabel: "KY_THUAT_VIEN",
    hoTen: "KTV. Phạm Quốc Bảo",
    donVi: "Xét nghiệm · Trả kết quả CLS",
    dotColor: "bg-violet-500",
    badgeClass: "bg-violet-50 border-violet-200 text-violet-700",
    activeBorderClass: "border-violet-400 bg-violet-50/50",
  },
  {
    username: "TT01",
    password: "123456",
    roleLabel: "TIEP_NHAN",
    hoTen: "Nguyễn Thu Thảo",
    donVi: "Tiếp đón BN · Thẻ BHYT · Lượt khám",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-50 border-amber-200 text-amber-700",
    activeBorderClass: "border-amber-400 bg-amber-50/50",
  },
  {
    username: "NV_TN_01",
    password: "123456",
    roleLabel: "THU_NGAN",
    hoTen: "Phạm Minh Hoàng",
    donVi: "Thu ngân · Lập & Chốt Viện phí",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
    activeBorderClass: "border-emerald-400 bg-emerald-50/50",
  },
];

const RBAC_ROLES = [
  {
    code: "ADMIN",
    badge: "Partial · Quản trị",
    desc: "Quản trị KHOA, PHONG, GIUONG_BENH, NHAN_VIEN (d, p), danh mục THUOC/LOAI_XN.",
    icon: Lock,
    iconStyle: {
      background: "rgba(244, 63, 94, 0.16)",
      border: "1px solid rgba(251, 113, 133, 0.3)",
      color: "#fecdd3",
    },
    badgeStyle: {
      background: "rgba(244, 63, 94, 0.18)",
      border: "1px solid rgba(251, 113, 133, 0.25)",
      color: "#fecdd3",
    },
  },
  {
    code: "BAC_SI",
    badge: "Bảng con BAC_SI",
    desc: "Khám LUOT_KHAM (kèm MaDotNT), kê/sửa DON_THUOC, chỉ định PHIEU_XET_NGHIEM.",
    icon: HeartPulse,
    iconStyle: {
      background: "rgba(20, 184, 166, 0.18)",
      border: "1px solid rgba(45, 212, 191, 0.35)",
      color: "#99f6e4",
    },
    badgeStyle: {
      background: "rgba(20, 184, 166, 0.18)",
      border: "1px solid rgba(45, 212, 191, 0.3)",
      color: "#ccfbf1",
    },
  },
  {
    code: "DIEU_DUONG",
    badge: "Bảng con DIEU_DUONG",
    desc: "Tra cứu bản đồ giường theo ngày, phân bổ & chuyển giường PHAN_GIUONG [TuNgay, DenNgay).",
    icon: Layers,
    iconStyle: {
      background: "rgba(56, 189, 248, 0.16)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      color: "#bae6fd",
    },
    badgeStyle: {
      background: "rgba(56, 189, 248, 0.18)",
      border: "1px solid rgba(56, 189, 248, 0.28)",
      color: "#e0f2fe",
    },
  },
  {
    code: "KY_THUAT_VIEN",
    badge: "Bảng con KY_THUAT_VIEN",
    desc: "Thực hiện xét nghiệm 2 bước: start (NgayGioXN) và complete (KetQua, NgayGioTraKQ).",
    icon: FlaskConical,
    iconStyle: {
      background: "rgba(167, 139, 250, 0.18)",
      border: "1px solid rgba(167, 139, 250, 0.32)",
      color: "#ddd6fe",
    },
    badgeStyle: {
      background: "rgba(167, 139, 250, 0.2)",
      border: "1px solid rgba(167, 139, 250, 0.3)",
      color: "#ede9fe",
    },
  },
  {
    code: "TIEP_NHAN",
    badge: "Partial · Tiếp đón",
    desc: "Tạo BENH_NHAN duy nhất (BR-V2-09), quản lý thẻ THE_BHYT [0..1] & LUOT_KHAM.",
    icon: UserPlus,
    iconStyle: {
      background: "rgba(251, 191, 36, 0.16)",
      border: "1px solid rgba(251, 191, 36, 0.32)",
      color: "#fef08a",
    },
    badgeStyle: {
      background: "rgba(251, 191, 36, 0.18)",
      border: "1px solid rgba(251, 191, 36, 0.28)",
      color: "#fef9c3",
    },
  },
  {
    code: "THU_NGAN",
    badge: "Partial · Viện phí",
    desc: "Preview chi phí, chọn 1 THE_BHYT hợp lệ, lập & chốt VIEN_PHI (khóa sau thanh toán).",
    icon: Banknote,
    iconStyle: {
      background: "rgba(52, 211, 153, 0.16)",
      border: "1px solid rgba(52, 211, 153, 0.3)",
      color: "#a7f3d0",
    },
    badgeStyle: {
      background: "rgba(52, 211, 153, 0.18)",
      border: "1px solid rgba(52, 211, 153, 0.28)",
      color: "#d1fae5",
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, login, logout, hydrate } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "BS01",
      password: "123456",
    },
  });

  const watchedUsername = watch("username");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { data: profileData } = useQuery({
    queryKey: QUERY_KEYS.authProfile,
    queryFn: hospitalApi.auth.getProfile,
    enabled: isAuthenticated && !!token,
    retry: false,
  });

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

  const performLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await hospitalApi.auth.login({
        username: values.username.trim(),
        password: values.password,
      });

      login(res.user, res.access_token);
      setRedirectCountdown(5);
      setMessage({
        type: "success",
        text: `Đăng nhập thành công! Xin chào ${res.user.hoTen || res.user.HoTen} (${res.user.role}) · Thâm niên: ${res.user.SoNamCongTac ?? 0} năm.`,
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authProfile });
    } catch (err: unknown) {
      const parsed = extractApiError(err);
      if (!parsed.statusCode) {
        setMessage({
          type: "error",
          text: "Không thể kết nối máy chủ API (http://localhost:3001/api). Vui lòng kiểm tra Backend.",
        });
      } else {
        const prefix = parsed.ruleCode ? `[${parsed.ruleCode}] ` : "";
        setMessage({ type: "error", text: `${prefix}${parsed.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (preset: PresetAccount) => {
    setValue("username", preset.username, { shouldValidate: true });
    setValue("password", preset.password, { shouldValidate: true });
    await performLogin({ username: preset.username, password: preset.password });
  };

  const handleLogout = () => {
    setRedirectCountdown(null);
    logout();
    queryClient.removeQueries({ queryKey: QUERY_KEYS.authProfile });
    setMessage({ type: "success", text: "Đã đăng xuất khỏi hệ thống." });
  };

  const getInitials = (name?: string | null) => {
    const clean = (name ?? "").trim();
    if (!clean) return "NV";
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const specializationBadge = profileData?.bacSi
    ? `BAC_SI · ${profileData.bacSi.ChuyenKhoa}`
    : profileData?.dieuDuong
      ? `DIEU_DUONG · ${profileData.dieuDuong.CapBac}`
      : profileData?.kyThuatVien
        ? `KY_THUAT_VIEN · ${profileData.kyThuatVien.ChuyenMonXetNghiem}`
        : `${user?.role || ""} (Partial)`;

  return (
    <div
      className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row lg:overflow-hidden text-slate-800 antialiased relative"
      style={{
        background:
          "linear-gradient(145deg, rgb(3, 35, 34) 0%, rgb(6, 64, 61) 35%, rgb(13, 94, 89) 70%, rgb(15, 118, 110) 100%)",
      }}
    >
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[90px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(13,148,136,0.06) 65%, transparent 80%)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-[90px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(15,118,110,0.05) 70%, transparent 80%)",
        }}
      />

      <aside className="w-full lg:w-[38%] xl:w-[36%] 2xl:w-[34%] lg:h-full text-white px-5 py-5 lg:px-6 lg:py-5 xl:px-8 xl:py-6 flex flex-col justify-between relative z-10 lg:overflow-y-auto shrink-0 lg:border-r lg:border-white/10">
        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
              }}
            >
              <Hospital className="w-4 h-4 text-teal-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base xl:text-lg font-extrabold tracking-tight text-white">
                  QLBV • Smart HIS
                </span>
                <span
                  className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-full tracking-wide"
                  style={{
                    background: "rgba(45, 212, 191, 0.15)",
                    border: "1px solid rgba(45, 212, 191, 0.35)",
                    color: "#99f6e4",
                  }}
                >
                  v2.0-PROD
                </span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-teal-100/75 font-medium tracking-wide truncate">
                EER 18 BẢNG · 20 FK NO ACTION · BR-V2-01..13
              </p>
            </div>
          </div>

          <div className="mt-1.5">
            <h1 className="text-lg lg:text-xl xl:text-[22px] font-extrabold text-white leading-snug tracking-tight">
              Cổng Điều Hành Bệnh Viện Chuẩn Hóa v2
            </h1>
            <p className="text-[11px] xl:text-xs text-teal-100/85 mt-1 max-w-md leading-relaxed">
              Phân quyền theo cây chuyên biệt hóa <span className="font-mono">NHAN_VIEN (d, p)</span>{" "}
              với 6 nhóm vai trò chuẩn và bảo vệ khóa giao dịch mức CSDL.
            </p>
          </div>
        </div>

        <div className="relative z-10 my-3 lg:my-auto py-1.5 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <h3 className="text-[10px] xl:text-[11px] font-bold tracking-wider uppercase text-teal-200/95">
                6 Vai Trò Phân Quyền (d, p)
              </h3>
            </div>
            <span className="text-[10px] text-teal-200/70 font-mono">RolesGuard</span>
          </div>

          <div className="space-y-1.5">
            {RBAC_ROLES.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.code}
                  className="rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 transition-colors hover:bg-white/[0.12]"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={item.iconStyle}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                        {item.code}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0"
                        style={item.badgeStyle}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[10px] xl:text-[11px] text-teal-100/75 leading-tight truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="relative z-10 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] xl:text-[11px] text-teal-100/75 shrink-0"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-300" />
              PostgreSQL Triggers
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-300" />
              JWT 8h
            </span>
          </div>
          <span>Swagger: /api/docs</span>
        </div>
      </aside>

      <main className="w-full lg:w-[62%] xl:w-[64%] 2xl:w-[66%] lg:h-full bg-transparent flex flex-col justify-between px-5 py-4 sm:px-8 xl:px-12 relative z-10 lg:overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between shrink-0 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-100 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Về Trang Chủ
          </Link>
          {isAuthenticated ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Đã xác thực JWT
            </span>
          ) : (
            <span className="text-[11px] font-mono text-teal-200/75">AuthModule v2 • /login</span>
          )}
        </div>

        <div className="w-full max-w-2xl mx-auto flex flex-col gap-3.5 my-auto py-1">
          {isAuthenticated && user && (
            <div className="bg-white border border-teal-200/80 rounded-xl p-4 shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-teal-600" />
              <div className="flex flex-wrap items-center justify-between gap-3 pl-1">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center border-2 border-teal-500 shadow-sm">
                      {getInitials(user.hoTen || user.maNV)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Phiên làm việc v2 đang hoạt động
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">#{user.maNV}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {profileData?.HoTen || user.hoTen}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-teal-700">{specializationBadge}</span>
                      <span>•</span>
                      <span>
                        {user.tenKhoa || profileData?.khoa?.TenKhoa || user.maKhoa}
                        {user.maKhoa ? ` (${user.maKhoa})` : ""}
                      </span>
                      <span>•</span>
                      <span className="font-mono font-semibold text-indigo-700">
                        SoNamCongTac (dẫn xuất):{" "}
                        {profileData?.SoNamCongTac ?? user.SoNamCongTac ?? 0} năm
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold font-mono rounded-md bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                  Role: {user.role}
                </span>
              </div>

              <div className="mt-3 pt-3 pl-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  GET /api/auth/profile:{" "}
                  <span className="font-mono font-semibold text-slate-700">
                    {profileData ? "Đã xác minh (V_NHAN_VIEN)" : "Đang tải..."}
                  </span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {redirectCountdown !== null && (
                    <button
                      type="button"
                      onClick={() => setRedirectCountdown(null)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      Ở lại trang
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                  <Link
                    href="/"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                  >
                    Vào Bảng điều khiển
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {redirectCountdown !== null && (
                <div className="mt-3 ml-1 rounded-lg bg-teal-50/90 border border-teal-200 px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-teal-900">
                    <span className="font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      Đang chuyển vào Bảng điều khiển hệ thống...
                    </span>
                    <span className="font-mono font-bold text-teal-700">{redirectCountdown}s</span>
                  </div>
                  <div className="w-full h-1.5 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-1000 ease-linear"
                      style={{ width: `${(redirectCountdown / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 xl:p-7 shrink-0">
            <div className="mb-4">
              <h2 className="text-xl xl:text-2xl font-bold text-slate-900 tracking-tight">
                Đăng nhập Cổng Cán Bộ Y Tế
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Hỗ trợ đăng nhập bằng <span className="font-mono">MaNV</span> hoặc{" "}
                <span className="font-mono">CCCD</span>.
              </p>
            </div>

            <form onSubmit={handleSubmit(performLogin)} className="space-y-3.5">
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Tài khoản đăng nhập (MaNV hoặc CCCD) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    {...register("username")}
                    placeholder="VD: BS01, DD01, KTV01, TT01, NV_TN_01, ADMIN01 hoặc CCCD"
                    className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all font-mono"
                  />
                </div>
                {errors.username && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Mật khẩu hệ thống <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Nhập mật khẩu (mặc định: 123456)"
                    className="block w-full pl-10 pr-10 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : message.type === "info"
                        ? "bg-sky-50 text-sky-800 border-sky-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : message.type === "info" ? (
                    <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  Đăng nhập nhanh đủ 6 vai trò v2
                </span>
                <span className="text-[11px] text-slate-400 font-mono">1-Click Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_ACCOUNTS.map((preset) => {
                  const isSelected = watchedUsername === preset.username;
                  return (
                    <button
                      key={preset.username}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickSelect(preset)}
                      className={`group text-left p-2.5 rounded-lg border transition-all cursor-pointer disabled:opacity-60 ${
                        isSelected
                          ? preset.activeBorderClass
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-teal-800 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${preset.dotColor}`} />
                          {preset.username}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${preset.badgeClass}`}
                        >
                          {preset.roleLabel}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                        {preset.hoTen}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{preset.donVi}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-teal-100/70 shrink-0 py-2">
          <p>© 2026 QLBV Smart HIS v2.0 • Khoa CNTT, Đại học Sài Gòn (SGU).</p>
        </footer>
      </main>
    </div>
  );
}
