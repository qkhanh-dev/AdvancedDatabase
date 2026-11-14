import Link from "next/link";
import { ArrowLeft, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InpatientPage() {
  const sampleBeds = [
    { id: "G101_01", room: "P101", status: "DANG_SU_DUNG", patient: "Nguyễn Văn An" },
    { id: "G101_02", room: "P101", status: "TRONG", patient: null },
    { id: "G102_01", room: "P102", status: "TRONG", patient: null },
    { id: "G102_02", room: "P102", status: "BAO_TRI", patient: null },
  ];

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
              <Bed className="w-6 h-6 text-amber-600" /> Sơ Đồ Giường Bệnh & Phân Giường Nội Trú
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý thực thể BN_NOI_TRU, GIUONG_BENH, PHAN_GIUONG với khóa dòng Serializable
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="success">TRỐNG</Badge>
          <Badge variant="destructive">ĐANG DÙNG</Badge>
          <Badge variant="warning">BẢO TRÌ</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sơ Đồ Giường Trực Quan Theo Phòng</CardTitle>
          <CardDescription>
            Đảm bảo quy tắc chống phân trùng giường: <code>SELECT ... FOR UPDATE</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleBeds.map((bed) => (
              <div
                key={bed.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  bed.status === "TRONG"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : bed.status === "DANG_SU_DUNG"
                    ? "bg-rose-50 border-rose-200 text-rose-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">{bed.id}</span>
                    <Badge variant={bed.status === "TRONG" ? "success" : bed.status === "DANG_SU_DUNG" ? "destructive" : "warning"}>
                      {bed.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">Phòng: {bed.room}</p>
                  <p className="text-xs font-medium mt-1">
                    {bed.patient ? `Bệnh nhân: ${bed.patient}` : "Sẵn sàng nhận bệnh"}
                  </p>
                </div>
                {bed.status === "TRONG" && (
                  <Button size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Phân Giường
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
