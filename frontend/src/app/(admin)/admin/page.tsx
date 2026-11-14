import Link from "next/link";
import { ArrowLeft, Hospital, BarChart3, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Hospital className="w-6 h-6 text-slate-700" /> Quản Trị Hệ Thống & Báo Cáo
          </h1>
          <p className="text-sm text-slate-500">
            Dành cho Quản trị viên • Quản lý KHOA, PHONG, NHAN_VIEN, LICH_TRUC và Dashboard thống kê
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Phân Công Lịch Trực
            </CardTitle>
            <CardDescription>Kiểm tra chống trùng lịch ca trực</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Quản lý ca trực (SÁNG, CHIỀU, TỐI, ĐÊM) cho y bác sĩ.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" /> Hồ Sơ Cán Bộ Y Tế
            </CardTitle>
            <CardDescription>Bác sĩ, Điều dưỡng, Nhân viên hành chính</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Kế thừa mô hình IS-A từ NHAN_VIEN với khóa ngoại CASCADE.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" /> Báo Cáo Doanh Thu
            </CardTitle>
            <CardDescription>Recharts & Analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Biểu đồ doanh thu viện phí, công suất giường và cơ cấu BHYT.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
