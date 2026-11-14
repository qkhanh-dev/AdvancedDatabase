import Link from "next/link";
import { ArrowLeft, Users, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReceptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" /> Phân Hệ Tiếp Đón & Hồ Sơ Bệnh Nhân
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý thực thể BENH_NHAN, BN_NGOAI_TRU và cấp số khám
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" /> Tiếp Nhận Bệnh Nhân Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tra cứu thông tin Bệnh nhân (CCCD / BHYT)</CardTitle>
            <CardDescription>
              Áp dụng Filtered Unique Index UX_BENH_NHAN_CCCD và UX_BENH_NHAN_BHYT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập số CCCD (12 số) hoặc Mã BHYT (15 ký tự)..."
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <Button variant="default" className="gap-2">
                <Search className="w-4 h-4" /> Tìm Kiếm
              </Button>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg text-xs text-slate-600">
              Sẵn sàng kết nối API: <code>GET /api/patients/lookup?q=...</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hàng Đợi Tiếp Đón</CardTitle>
            <CardDescription>Danh sách chờ phân luồng khám</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 italic">Chưa có lượt tiếp đón nào đang chờ.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
