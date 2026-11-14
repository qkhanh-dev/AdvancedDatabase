"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bed,
  ClipboardList,
  CreditCard,
  Hospital,
  LogOut,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";

const subsystems = [
  {
    title: "Tiếp Đón & Bệnh Nhân",
    description: "Tiếp nhận hồ sơ, tra cứu CCCD / BHYT và phân luồng phòng khám",
    icon: Users,
    href: "/reception",
    tag: "Ngoại trú",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    title: "Khám Lâm Sàng",
    description: "Nhập sinh hiệu (HA, mạch, nhiệt độ), chẩn đoán ICD và ra quyết định",
    icon: Stethoscope,
    href: "/clinical",
    tag: "Bác sĩ",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    title: "Cận Lâm Sàng & Xét Nghiệm",
    description: "Chỉ định dịch vụ kỹ thuật, trả kết quả xét nghiệm và hình ảnh",
    icon: Activity,
    href: "/laboratory",
    tag: "Kỹ thuật viên",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    title: "Nội Trú & Sơ Đồ Giường Bệnh",
    description: "Sơ đồ buồng bệnh trực quan, phân giường chống xung đột Serializable",
    icon: Bed,
    href: "/inpatient",
    tag: "Lưu viện",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    title: "Dược Phẩm & Kê Đơn",
    description: "Kê toa thuốc, kiểm tra tồn kho và tự động trừ kho nguyên tử",
    icon: Pill,
    href: "/pharmacy",
    tag: "Kho Dược",
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  {
    title: "Thu Ngân & Quyết Toán BHYT",
    description: "Tổng hợp viện phí, bóc tách BHYT (80-100%), quét VietQR và xuất hóa đơn PDF",
    icon: CreditCard,
    href: "/cashier",
    tag: "Viện phí",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    title: "Nhân Sự & Lịch Trực",
    description: "Quản lý Bác sĩ, Điều dưỡng, xếp ca trực chống trùng giờ chuyên môn",
    icon: ClipboardList,
    href: "/admin/schedules",
    tag: "Vận hành",
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
  },
  {
    title: "Quản Trị & Báo Cáo",
    description: "Dashboard doanh thu viện phí, công suất giường và cơ cấu bệnh tật",
    icon: Hospital,
    href: "/admin",
    tag: "Báo cáo",
    color: "text-slate-600 bg-slate-50 border-slate-200",
  },
];

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, hydrate, logout } = useAuthStore();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    hydrate();
    setCheckedAuth(true);
  }, [hydrate]);

  useEffect(() => {
    if (checkedAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [checkedAuth, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

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

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <Hospital className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  Hệ Thống Quản Lý Bệnh Viện (QLBV)
                </h1>
                <p className="text-sm text-slate-500">
                  Đồ án Cơ sở dữ liệu nâng cao • Khoa CNTT, Đại học Sài Gòn (SGU)
                </p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl text-sm pt-2">
              Hệ thống quản lý bệnh viện với mô hình EER 19 bảng BCNF, bảo đảm toàn vẹn giao dịch ACID, phân giường chống trùng bằng khóa dòng và quyết toán viện phí BHYT tự động.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <div className="text-left">
                <div className="font-semibold text-slate-900">{user.hoTen}</div>
                <div className="text-[11px] font-mono text-teal-700">
                  #{user.maNV} • {user.role}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Next.js 14 App Router</Badge>
              <Badge variant="secondary">React 18 & TS</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">Prisma 7 & PG 16</Badge>
              <Badge variant="success">ACID Concurrency</Badge>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Số thực thể chuẩn hóa</CardDescription>
              <CardTitle className="text-2xl font-bold text-blue-600">19 Bảng BCNF</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">25 Khóa ngoại & 13 Enums</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cơ chế Phân giường</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600">Serializable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">SELECT ... FOR UPDATE</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Chiết trừ Viện phí</CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-600">BHYT 80-100%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Tích hợp VietQR & PDFKit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Kiến trúc Phần mềm</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-600">BCE Monolith</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Boundary - Control - Entity</p>
            </CardContent>
          </Card>
        </div>

        {/* Subsystems Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Các Phân Hệ Nghiệp Vụ Y Tế
            </h2>
            <span className="text-xs font-medium text-slate-500">
              8 Phân hệ tích hợp sẵn sàng
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {subsystems.map((sub, idx) => {
              const Icon = sub.icon;
              return (
                <Card
                  key={idx}
                  className="hover:shadow-md transition-shadow duration-200 border-slate-200 flex flex-col justify-between"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-lg border ${sub.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline">{sub.tag}</Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900">
                        {sub.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1.5 line-clamp-2">
                        {sub.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link
                      href={sub.href}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Truy cập phân hệ &rarr;
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
          Nhóm sinh viên thực hiện: Cao Nguyễn Quốc Khánh, Trần Nguyễn Quỳnh Như, Hoàng Văn Lập, Nguyễn Đăng Thụy, Cô Thành Long • GVHD: ThS. Huỳnh Minh Trí
        </div>
      </div>
    </main>
  );
}
