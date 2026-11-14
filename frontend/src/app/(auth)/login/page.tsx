"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
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
import { useAuthStore } from "@/store/useAuthStore";
import { NhanVien } from "@/types";

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
    donVi: "Phòng CNTT & Quản trị",
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
    donVi: "Khoa Nội Tổng Hợp (K01)",
    dotColor: "bg-indigo-500",
    badgeClass: "bg-indigo-50 border-indigo-200 text-indigo-700",
    activeBorderClass: "border-indigo-400 bg-indigo-50/50",
  },
  {
    username: "NV_TN_01",
    password: "123456",
    roleLabel: "THU_NGAN",
    hoTen: "Phạm Minh Hoàng",
    donVi: "Thu ngân viện phí & Tiếp đón",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-700",
    activeBorderClass: "border-emerald-400 bg-emerald-50/50",
  },
];

const RBAC_ROLES = [
  {
    code: "ADMIN",
    badge: "Toàn quyền",
    desc: "Quản trị hệ thống, danh mục viện phí, cấu hình tham số, sao lưu & audit logs.",
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
    badge: "Bác sĩ Lâm sàng",
    desc: "Khám bệnh, chẩn đoán ICD-10, kê đơn thuốc, chỉ định CLS, bệnh án nội trú.",
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
    badge: "Điều dưỡng / CLS",
    desc: "Đo sinh hiệu, trả KQ cận lâm sàng, phân/chuyển sơ đồ giường, phát thuốc theo y lệnh.",
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
    code: "NV_HANH_CHINH",
    badge: "Tiếp đón / Kho",
    desc: "Tiếp đón bệnh nhân, đăng ký sổ khám, phân luồng phòng khám, hỗ trợ kho dược.",
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
    badge: "Viện phí & BHYT",
    desc: "Giám định BHYT, lập hóa đơn viện phí, gạch nợ VietQR tự động, xuất biên lai PDF.",
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
  const { user, token, isAuthenticated, login, logout, hydrate } = useAuthStore();
  const [username, setUsername] = useState("BS01");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [profileData, setProfileData] = useState<NhanVien | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadProfile();
    }
  }, [isAuthenticated, token]);

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

  const loadProfile = async () => {
    try {
      const p = await hospitalApi.auth.getProfile();
      setProfileData(p);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      console.warn("Could not fetch profile:", error?.response?.data || error?.message);
    }
  };

  const performLogin = async (loginUsername: string, loginPassword: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await hospitalApi.auth.login({
        username: loginUsername.trim(),
        password: loginPassword,
      });

      login(res.user, res.access_token);
      setRedirectCountdown(5);
      setMessage({
        type: "success",
        text: `Đăng nhập thành công! Xin chào ${res.user.hoTen} (${res.user.role}).`,
      });
      await loadProfile();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string | string[] } };
        code?: string;
      };
      if (!error?.response) {
        setMessage({
          type: "error",
          text: "Không thể kết nối máy chủ API (http://localhost:3001/api). Vui lòng kiểm tra Backend.",
        });
      } else {
        const rawMsg = error?.response?.data?.message;
        const errorMsg = Array.isArray(rawMsg)
          ? rawMsg.join(", ")
          : rawMsg || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
        setMessage({ type: "error", text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (preset: PresetAccount) => {
    setUsername(preset.username);
    setPassword(preset.password);
    await performLogin(preset.username, preset.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const handleLogout = () => {
    setRedirectCountdown(null);
    logout();
    setProfileData(null);
    setMessage({ type: "success", text: "Đã đăng xuất khỏi hệ thống." });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "NV";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row lg:overflow-hidden text-slate-800 antialiased relative"
      style={{
        background:
          "linear-gradient(145deg, rgb(3, 35, 34) 0%, rgb(6, 64, 61) 35%, rgb(13, 94, 89) 70%, rgb(15, 118, 110) 100%)",
      }}
    >
      {/* Ambient glow layers (Full screen) */}
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

      {/* DNA & Dot Grid Watermark (Full screen) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-white"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-20,120 Q280,60 520,160 T980,240 T1240,180" strokeWidth="1.5" />
        <path d="M-20,280 Q240,210 560,320 T1020,360 T1260,300" strokeWidth="1.2" />
        <path d="M-40,520 Q300,460 620,560 T1060,610 T1280,540" strokeWidth="1.5" />
        <path d="M-20,680 Q320,590 680,720 T1120,730" strokeWidth="1.2" />
        <defs>
          <pattern height="28" id="subtle-dots" patternUnits="userSpaceOnUse" width="28">
            <circle cx="2" cy="2" fill="rgba(255,255,255,0.45)" r="1" />
          </pattern>
        </defs>
        <rect fill="url(#subtle-dots)" height="100%" opacity="0.5" width="100%" />
      </svg>

      {/* CỘT TRÁI (34%-38% Desktop): BRANDING & TỔNG QUAN PHÂN QUYỀN RBAC */}
      <aside className="w-full lg:w-[38%] xl:w-[36%] 2xl:w-[34%] lg:h-full text-white px-5 py-5 lg:px-6 lg:py-5 xl:px-8 xl:py-6 flex flex-col justify-between relative z-10 lg:overflow-y-auto shrink-0 lg:border-r lg:border-white/10">

        {/* Header / Brand Section */}
        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25)",
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
                  v1.0-PROD
                </span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-teal-100/75 font-medium tracking-wide truncate">
                HỆ THỐNG QUẢN LÝ BỆNH VIỆN ĐA KHOA ĐIỆN TỬ
              </p>
            </div>
          </div>

          <div className="mt-1.5">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] xl:text-[11px] text-teal-100 mb-1.5"
              style={{
                background: "rgba(255, 255, 255, 0.07)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tiêu chuẩn bảo mật y tế &amp; BYT 4210 / HL7 FHIR
            </div>
            <h1 className="text-lg lg:text-xl xl:text-[22px] font-extrabold text-white leading-snug tracking-tight">
              Nền tảng Quản trị &amp; Điều hành Y tế Toàn diện
            </h1>
            <p className="text-[11px] xl:text-xs text-teal-100/85 mt-1 max-w-md leading-relaxed">
              Tích hợp liên thông Bệnh án điện tử (EMR), Xét nghiệm (LIS), Chẩn đoán hình ảnh (PACS)
              và Cổng giám định BHYT trực tuyến.
            </p>
          </div>
        </div>

        {/* RBAC Roles Matrix */}
        <div className="relative z-10 my-3 lg:my-auto py-1.5 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <h3 className="text-[10px] xl:text-[11px] font-bold tracking-wider uppercase text-teal-200/95">
                5 Vai Trò Phân Quyền (RBAC)
              </h3>
            </div>
            <span className="text-[10px] text-teal-200/70 font-mono">JwtAuthGuard</span>
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

        {/* Footer Info */}
        <div
          className="relative z-10 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] xl:text-[11px] text-teal-100/75 shrink-0"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-300" />
              AES-256
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-teal-300" />
              JWT 8h
            </span>
          </div>
          <span>Hotline IT: 1900-8899 (Ext. 102)</span>
        </div>
      </aside>

      {/* CỘT PHẢI (62%-66% Desktop): FORM ĐĂNG NHẬP & PHIÊN LÀM VIỆC */}
      <main className="w-full lg:w-[62%] xl:w-[64%] 2xl:w-[66%] lg:h-full bg-transparent flex flex-col justify-between px-5 py-4 sm:px-8 xl:px-12 relative z-10 lg:overflow-y-auto">
        {/* Top Navigation Bar */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-between shrink-0 pb-2">
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
            <span className="text-[11px] font-mono text-teal-200/75">
              AuthModule • /login
            </span>
          )}
        </div>

        {/* Center Content Wrapper */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-3.5 my-auto py-1">
          {/* CARD THÔNG BÁO PHIÊN LÀM VIỆC HIỆN TẠI (GET /api/auth/profile) */}
          {isAuthenticated && user && (
            <div className="bg-white border border-teal-200/80 rounded-xl p-4 shadow-sm relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-teal-600" />
              <div className="flex flex-wrap items-center justify-between gap-3 pl-1">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center border-2 border-teal-500 shadow-sm">
                      {getInitials(user.hoTen)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Phiên làm việc đang hoạt động
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">#{user.maNV}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{user.hoTen}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-teal-700">
                        {profileData?.LoaiNV || user.loaiNV || user.role}
                      </span>
                      <span>•</span>
                      <span>
                        {user.tenKhoa || user.maKhoa || "Bệnh viện Đa Khoa"}
                        {user.maKhoa ? ` (${user.maKhoa})` : ""}
                      </span>
                      {(profileData?.SoDienThoai || user.soDienThoai) && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-slate-600">
                            {profileData?.SoDienThoai || user.soDienThoai}
                          </span>
                        </>
                      )}
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
                  Hồ sơ đồng bộ máy chủ:{" "}
                  <span className="font-mono font-semibold text-slate-700">
                    {profileData ? "Đã xác minh" : "Đang tải..."}
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
                    <span className="font-mono font-bold text-teal-700">
                      {redirectCountdown}s
                    </span>
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

          {/* FORM ĐĂNG NHẬP CHÍNH */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 xl:p-7 shrink-0">
            <div className="mb-4">
              <h2 className="text-xl xl:text-2xl font-bold text-slate-900 tracking-tight">
                Đăng nhập Cổng Cán Bộ Y Tế
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sử dụng tài khoản cán bộ được cấp bởi phòng Tổ Chức - CNTT để làm việc.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Input 1: Tài khoản */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Tài khoản đăng nhập (Mã NV / CCCD / Email){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập Mã NV (VD: BS01, DD01, NV_TN_01) hoặc CCCD"
                    className="block w-full pl-10 pr-3 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Input 2: Mật khẩu */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Mật khẩu hệ thống <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMessage({
                        type: "info",
                        text: "Vui lòng liên hệ Phòng CNTT qua Hotline 1900-8899 (Ext. 102) để cấp lại mật khẩu.",
                      })
                    }
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu truy cập (mặc định: 123456)"
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
              </div>

              {/* Lưu ý RBAC tự động */}
              <div className="rounded-lg bg-teal-50/70 border border-teal-200/70 px-3 py-2 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="text-xs text-teal-900 leading-relaxed">
                  <strong className="font-semibold text-teal-950">Cơ chế bảo mật RBAC:</strong> Vai
                  trò chuyên môn sẽ được xác thực tự động theo hồ sơ Nhân sự sau khi đăng nhập thành
                  công.
                </p>
              </div>

              {/* Thông báo trạng thái */}
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

              {/* Nút Đăng nhập chính */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-teal-500/20 active:scale-[0.99]"
              >
                <span>{loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-0.5">
                <span className="text-[11px] font-mono text-slate-400">
                  Endpoint: POST /api/auth/login
                </span>
              </div>
            </form>

            {/* KHỐI TÀI KHOẢN MẪU KIỂM THỬ (QUICK LOGIN) */}
            <div className="mt-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  Đăng nhập nhanh (Tài khoản mẫu kiểm thử)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">1-Click Auto Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_ACCOUNTS.map((preset, idx) => {
                  const isSelected = username === preset.username;
                  return (
                    <button
                      key={preset.username}
                      type="button"
                      disabled={loading}
                      onClick={() => handleQuickSelect(preset)}
                      className={`group text-left p-2.5 rounded-lg border transition-all cursor-pointer disabled:opacity-60 ${
                        idx === 0 ? "sm:col-span-2" : ""
                      } ${
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

        {/* Chân trang phụ */}
        <footer className="text-center text-xs text-teal-100/70 shrink-0 py-2">
          <p>© 2026 QLBV Smart HIS • Khoa CNTT, Đại học Sài Gòn (SGU).</p>
        </footer>
      </main>
    </div>
  );
}
