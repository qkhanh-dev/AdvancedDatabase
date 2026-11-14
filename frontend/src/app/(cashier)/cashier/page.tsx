import Link from "next/link";
import { ArrowLeft, CreditCard, QrCode, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CashierPage() {
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
            <CreditCard className="w-6 h-6 text-purple-600" /> Phân Hệ Thu Ngân Viện Phí & Quyết Toán BHYT
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý thực thể HOA_DON, bóc tách BHYT chi trả, tích hợp VietQR và xuất biên lai PDFKit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quyết Toán Chi Phí Lượt Khám</CardTitle>
              <Badge variant="warning">CHƯA THANH TOÁN</Badge>
            </div>
            <CardDescription>
              Công thức: TienBenhNhanTra = TongTienGoc - TienBHYTChiTra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền khám bệnh:</span>
                <span className="font-medium">150,000 đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền thuốc theo đơn:</span>
                <span className="font-medium">320,000 đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền cận lâm sàng:</span>
                <span className="font-medium">200,000 đ</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Tổng chi phí gốc:</span>
                <span>670,000 đ</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Quỹ BHYT chi trả (80%):</span>
                <span>- 436,000 đ</span>
              </div>
              <div className="flex justify-between text-base font-bold text-purple-700 pt-2 border-t">
                <span>Bệnh nhân thanh toán:</span>
                <span>234,000 đ</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <QrCode className="w-4 h-4" /> Quét Mã VietQR
              </Button>
              <Button variant="outline" className="gap-2">
                <FileCheck className="w-4 h-4" /> Xuất Biên Lai PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cổng Thanh Toán Giả Lập</CardTitle>
            <CardDescription>Xác thực chữ ký HMAC Webhook</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống hỗ trợ cơ chế Idempotency chống thanh toán kép hoặc ghi nhận doanh thu trùng lặp khi nhận nhiều Webhook.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
