import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaboratoryPage() {
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
            <Activity className="w-6 h-6 text-indigo-600" /> Phân Hệ Cận Lâm Sàng & Xét Nghiệm
          </h1>
          <p className="text-sm text-slate-500">
            Dành cho Điều dưỡng & Kỹ thuật viên • Quản lý DICH_VU, SU_DUNG_DV
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Chỉ Định Chờ Thực Hiện</CardTitle>
          <CardDescription>Tiếp nhận chỉ định từ bác sĩ và trả kết quả cận lâm sàng</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 italic">Kết nối API: <code>GET /api/services/pending</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
