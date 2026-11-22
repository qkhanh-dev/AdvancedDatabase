"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleEnum } from "@/types";
import { ROLE_LABELS, Sidebar } from "@/components/layout/Sidebar";

interface AuthGuardProps {
  allowedRoles: RoleEnum[];
  children: React.ReactNode;
}

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm">
        Đang xác thực phiên làm việc RBAC...
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen bg-[#f8f9ff]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                403 FORBIDDEN · RBAC (d, p)
              </span>
              <h1 className="text-lg font-bold text-slate-900 mt-2">
                Không có quyền truy cập phân hệ này
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tài khoản <strong>{user.hoTen}</strong> đang giữ vai trò{" "}
                <span className="font-mono font-semibold text-teal-700">
                  {user.role} ({ROLE_LABELS[user.role] || user.role})
                </span>
                . Phân hệ này chỉ dành cho: {allowedRoles.join(", ")}.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay về Bảng điều khiển
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
