"use client";

import Link from "next/link";
import { ArrowLeft, Hospital, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 bg-blue-600 text-white rounded-2xl w-fit shadow-md">
              <Hospital className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">Đăng Nhập Cán Bộ Y Tế</CardTitle>
            <CardDescription className="text-xs">
              Hệ thống xác thực Passport JWT & Phân quyền RBAC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Tên đăng nhập / Mã NV</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Ví dụ: NV_BS_01"
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm mt-2">
              Đăng Nhập Hệ Thống
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
