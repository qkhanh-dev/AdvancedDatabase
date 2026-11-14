"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Hospital, Lock, User, LogOut, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import { useAuthStore } from "@/store/useAuthStore";
import { RoleEnum } from "@/types";

export default function LoginPage() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [username, setUsername] = useState("BS01");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<RoleEnum>(RoleEnum.BAC_SI);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadProfile();
    }
  }, [isAuthenticated, token]);

  const loadProfile = async () => {
    try {
      const p = await hospitalApi.auth.getProfile();
      setProfileData(p);
    } catch (err: any) {
      console.warn("Could not fetch profile:", err?.response?.data || err.message);
    }
  };

  const handleQuickSelect = (u: string, p: string, r: RoleEnum) => {
    setUsername(u);
    setPassword(p);
    setRole(r);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await hospitalApi.auth.login({
        username,
        password,
        role,
      });

      login(res.user, res.access_token);
      setMessage({ type: "success", text: `Đăng nhập thành công! Xin chào ${res.user.hoTen}` });
      await loadProfile();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.message)
          ? err?.response?.data?.message.join(", ")
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileData(null);
    setMessage({ type: "success", text: "Đã đăng xuất khỏi hệ thống." });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
            </Button>
          </Link>
          {isAuthenticated && (
            <Badge variant="success" className="gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
            </Badge>
          )}
        </div>

        {/* Current Session Info if logged in */}
        {isAuthenticated && user && (
          <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Phiên Đăng Nhập Hoạt Động
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-semibold">Mã NV:</span> {user.maNV}</div>
                <div><span className="font-semibold">Họ tên:</span> {user.hoTen}</div>
                <div><span className="font-semibold">Vai trò (Role):</span> <Badge variant="secondary">{user.role}</Badge></div>
                <div><span className="font-semibold">Khoa:</span> {user.tenKhoa || user.maKhoa || "N/A"}</div>
              </div>
              {profileData && (
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
                  <span className="font-semibold">Dữ liệu hồ sơ máy chủ:</span> {profileData.HoTen} ({profileData.LoaiNV}) - ĐT: {profileData.SoDienThoai}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto p-3 bg-blue-600 text-white rounded-2xl w-fit shadow-md">
              <Hospital className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">Đăng Nhập Cán Bộ Y Tế</CardTitle>
            <CardDescription className="text-xs">
              Hệ thống xác thực Passport JWT & Phân quyền RBAC (Role-Based Access Control)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Quick Fill Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Tài khoản mẫu kiểm thử:</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex flex-col items-center py-2 h-auto"
                  onClick={() => handleQuickSelect("BS01", "123456", RoleEnum.BAC_SI)}
                >
                  <span className="font-medium text-slate-800">BS01</span>
                  <span className="text-[10px] text-slate-500">Bác sĩ</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex flex-col items-center py-2 h-auto"
                  onClick={() => handleQuickSelect("DD01", "123456", RoleEnum.DIEU_DUONG)}
                >
                  <span className="font-medium text-slate-800">DD01</span>
                  <span className="text-[10px] text-slate-500">Điều dưỡng</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex flex-col items-center py-2 h-auto"
                  onClick={() => handleQuickSelect("NV_TN_01", "123456", RoleEnum.THU_NGAN)}
                >
                  <span className="font-medium text-slate-800">NV_TN_01</span>
                  <span className="text-[10px] text-slate-500">Thu ngân</span>
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Tên đăng nhập / Mã NV</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ví dụ: BS01, DD01, NV_TN_01"
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Vai trò đăng nhập (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleEnum)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value={RoleEnum.BAC_SI}>Bác sĩ (BAC_SI)</option>
                  <option value={RoleEnum.DIEU_DUONG}>Điều dưỡng (DIEU_DUONG)</option>
                  <option value={RoleEnum.THU_NGAN}>Thu ngân / Tiếp đón (THU_NGAN)</option>
                  <option value={RoleEnum.DUOC_SI}>Dược sĩ (DUOC_SI)</option>
                  <option value={RoleEnum.QUAN_TRI}>Quản trị viên (QUAN_TRI)</option>
                </select>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm mt-2"
              >
                {loading ? "Đang xác thực..." : "Đăng Nhập Hệ Thống"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
