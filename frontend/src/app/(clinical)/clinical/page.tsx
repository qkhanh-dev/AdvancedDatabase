import Link from "next/link";
import { ArrowLeft, Stethoscope, Activity, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClinicalPage() {
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
            <Stethoscope className="w-6 h-6 text-emerald-600" /> Phân Hệ Khám Lâm Sàng
          </h1>
          <p className="text-sm text-slate-500">
            Dành cho Bác sĩ điều trị • Quản lý LUOT_KHAM, DON_THUOC, SU_DUNG_DV
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Khám Bệnh & Nhập Sinh Hiệu</CardTitle>
              <Badge variant="secondary">Lượt khám hiện tại</Badge>
            </div>
            <CardDescription>
              Kiểm tra các chỉ số sinh hiệu: Huyết áp (mmHg), Mạch (lần/phút), Thân nhiệt (°C)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500">Huyết áp</span>
                <p className="text-base font-semibold text-slate-800">120/80 mmHg</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500">Mạch đập</span>
                <p className="text-base font-semibold text-slate-800">76 bpm</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500">Thân nhiệt</span>
                <p className="text-base font-semibold text-slate-800">36.8 °C</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <FileText className="w-4 h-4" /> Kê Toa Thuốc
              </Button>
              <Button variant="outline" className="gap-2">
                <Activity className="w-4 h-4" /> Chỉ Định Cận Lâm Sàng
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bệnh Nhân Chờ Khám</CardTitle>
            <CardDescription>Hàng đợi phòng khám chuyên khoa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 italic">Kết nối API: <code>GET /api/examinations/queue</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
