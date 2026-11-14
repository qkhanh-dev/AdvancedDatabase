import Link from "next/link";
import { ArrowLeft, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyPage() {
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
            <Pill className="w-6 h-6 text-rose-600" /> Phân Hệ Dược Phẩm & Kho Thuốc
          </h1>
          <p className="text-sm text-slate-500">
            Dành cho Dược sĩ • Quản lý THUOC, DON_THUOC, CT_DON_THUOC và tự động trừ kho nguyên tử
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Duyệt & Cấp Phát Thuốc Theo Đơn</CardTitle>
          <CardDescription>Kiểm tra số lượng tồn kho trước khi phát thuốc</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 italic">Kết nối API: <code>GET /api/prescriptions/pending</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
