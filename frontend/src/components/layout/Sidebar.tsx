"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BedDouble,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Pill,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleEnum } from "@/types";

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
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.NV_HANH_CHINH,
          RoleEnum.THU_NGAN,
        ],
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
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.DIEU_DUONG],
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
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.DIEU_DUONG,
          RoleEnum.NV_HANH_CHINH,
          RoleEnum.DUOC_SI,
        ],
      },
    ],
  },
  {
    group: "TÀI CHÍNH & VẬN HÀNH",
    items: [
      {
        label: "Thu ngân & Viện phí",
        href: "/cashier",
        icon: CreditCard,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.THU_NGAN,
          RoleEnum.NV_HANH_CHINH,
        ],
      },
      {
        label: "Quản trị & Lịch trực",
        href: "/admin",
        icon: Users,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI],
      },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị hệ thống",
  QUAN_TRI: "Quản trị viên",
  BAC_SI: "Bác sĩ Lâm sàng",
  DIEU_DUONG: "Điều dưỡng / KTV CLS",
  NV_HANH_CHINH: "NV Hành chính",
  THU_NGAN: "Thu ngân",
  DUOC_SI: "Dược sĩ",
};

function getInitials(name?: string | null): string {
  if (!name) return "NV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Sidebar({ mobile = false }: { mobile?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const visibleNavGroups = useMemo(() => {
    if (!user?.role) return [];
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(user.role)),
    })).filter((g) => g.items.length > 0);
  }, [user?.role]);

  return (
    <aside
      className={`h-screen w-[240px] shrink-0 bg-white border-r border-[#bcc9c6]/40 z-40 ${
        mobile ? "flex" : "hidden lg:flex"
      } flex-col justify-between select-none shadow-[0_1px_8px_rgba(0,0,0,0.03)]`}
    >
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="h-14 flex items-center gap-2.5 px-3.5 border-b border-[#bcc9c6]/30 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#00685f] text-white flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#0b1c30] truncate leading-tight">
              QLBV • Smart HIS
            </span>
            <span className="text-[10px] text-[#3d4947] truncate leading-none mt-0.5">
              Bệnh viện Đa khoa Số 1
            </span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <div className="overflow-y-auto px-2.5 py-2.5 space-y-3 flex-1 min-h-0">
          {visibleNavGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="px-2 py-0.5 text-[9.5px] uppercase tracking-wider text-[#6d7a77] font-semibold">
                {group.group}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors whitespace-nowrap truncate ${
                        active
                          ? "bg-[#008378] text-[#f4fffc] font-semibold shadow-xs"
                          : "text-[#3d4947] font-medium hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom RBAC User Card */}
      <div className="p-2.5 border-t border-[#bcc9c6]/30 bg-[#eff4ff]/60 shrink-0">
        <div className="p-2.5 bg-white rounded-lg border border-[#bcc9c6]/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-[#6d7a77]">
              RBAC Phân quyền
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#89f5e7] text-[#005049] font-mono text-[9.5px] font-semibold">
              {user?.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {getInitials(user?.hoTen || user?.maNV)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-[#0b1c30] truncate leading-tight">
                {user?.hoTen || user?.maNV}
              </span>
              <span className="text-[9.5px] text-[#3d4947] truncate">
                {ROLE_LABELS[user?.role || ""] || user?.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex items-center justify-center gap-1.5 w-full py-1 px-2 rounded text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors text-[10.5px] font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất / Đổi tài khoản</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
