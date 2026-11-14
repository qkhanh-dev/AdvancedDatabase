"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Pill, Search, CheckCircle2, AlertCircle, RefreshCw, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import { Thuoc, DonThuoc, TrangThaiPhatThuocEnum } from "@/types";

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Thuoc[]>([]);
  const [prescriptionId, setPrescriptionId] = useState("");
  const [currentPrescription, setCurrentPrescription] = useState<DonThuoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const list = await hospitalApi.prescription.getAllMedicines();
      setMedicines(list);
    } catch (err: any) {
      console.error("Load medicines error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescriptionId.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const p = await hospitalApi.prescription.getById(prescriptionId.trim());
      setCurrentPrescription(p);
    } catch (err: any) {
      setCurrentPrescription(null);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Không tìm thấy đơn thuốc với mã đã nhập.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!currentPrescription) return;
    setDispensing(true);
    setFeedback(null);
    try {
      const pId = currentPrescription.MaDT || currentPrescription.MaDon;
      const updated = await hospitalApi.prescription.dispense(pId);
      setCurrentPrescription(updated);
      setFeedback({
        type: "success",
        text: `Đã cấp phát thuốc thành công cho đơn ${updated.MaDT}! Kho dược đã tự động khấu trừ nguyên tử.`,
      });
      // Refresh inventory
      await loadMedicines();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi cấp phát thuốc (ví dụ: kho không đủ số lượng tồn).",
      });
    } finally {
      setDispensing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-rose-600" /> Phân Hệ Dược Phẩm & Cấp Phát Thuốc
            </h1>
            <p className="text-sm text-slate-500">
              Dành cho Dược sĩ • Quản lý kho dược, tra cứu đơn thuốc, kiểm tra tồn kho và khấu trừ nguyên tử ACID
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadMedicines} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Cập nhật kho
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tra cứu & Duyệt Cấp Phát Thuốc */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-600" /> Tra Cứu Đơn Thuốc (Prescription)
              </CardTitle>
              <CardDescription className="text-xs">
                Nhập Mã đơn thuốc do Bác sĩ kê để kiểm tra và phát thuốc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLookupPrescription} className="space-y-3">
                <input
                  type="text"
                  required
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  placeholder="Nhập mã đơn thuốc (VD: DT202611140001)..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
                <Button type="submit" disabled={loading} className="w-full text-xs bg-rose-600 hover:bg-rose-700">
                  {loading ? "Đang tra cứu..." : "Tra Cứu Đơn Thuốc"}
                </Button>
              </form>

              {currentPrescription && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{currentPrescription.MaDT}</span>
                    <Badge variant={currentPrescription.TrangThai === TrangThaiPhatThuocEnum.DA_PHAT ? "success" : "warning"}>
                      {currentPrescription.TrangThai}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div>Lượt khám: <span className="font-medium text-slate-800">{currentPrescription.MaLK}</span></div>
                    <div>Bác sĩ kê: <span className="font-medium text-slate-800">{currentPrescription.MaBS}</span></div>
                    <div>Ngày kê: {currentPrescription.NgayKe || currentPrescription.NgayGioKe ? new Date(currentPrescription.NgayKe || currentPrescription.NgayGioKe).toLocaleString("vi-VN") : "N/A"}</div>
                    {currentPrescription.GhiChu && (
                      <div className="italic text-slate-500">Lời dặn: {currentPrescription.GhiChu}</div>
                    )}
                  </div>

                  {/* Chi tiết các loại thuốc trong đơn */}
                  {currentPrescription.ChiTiet && currentPrescription.ChiTiet.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-1.5">
                      <span className="font-semibold text-slate-700 block">Danh mục thuốc kê:</span>
                      {currentPrescription.ChiTiet.map((item: any, idx: number) => (
                        <div key={idx} className="p-2 bg-white rounded border border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="font-medium text-slate-800">{item.Thuoc?.TenThuoc || item.MaThuoc}</span>
                            <span className="text-[10px] text-slate-500 block">{item.CachDung}</span>
                          </div>
                          <span className="font-bold text-rose-600">x{item.SoLuong} {item.Thuoc?.DonViTinh || "viên"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentPrescription.TrangThai === TrangThaiPhatThuocEnum.CHUA_PHAT && (
                    <Button
                      onClick={handleDispense}
                      disabled={dispensing}
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5 mt-2"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      {dispensing ? "Đang xử lý trừ kho..." : "Xác Nhận Cấp Phát Thuốc"}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tồn Kho Dược Phẩm */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Danh Mục Dược Phẩm & Tồn Kho Hiện Tại</CardTitle>
                  <CardDescription className="text-xs">
                    Theo dõi số lượng tồn kho nguyên tử, đơn giá và hạn dùng
                  </CardDescription>
                </div>
                <Badge variant="secondary">{medicines.length} mặt hàng</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Mã thuốc</th>
                      <th className="p-2.5">Tên thuốc</th>
                      <th className="p-2.5">Hàm lượng</th>
                      <th className="p-2.5">Đơn vị</th>
                      <th className="p-2.5 text-right">Đơn giá</th>
                      <th className="p-2.5 text-right">Tồn kho</th>
                      <th className="p-2.5">Hạn sử dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((m) => (
                      <tr key={m.MaThuoc} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-700">{m.MaThuoc}</td>
                        <td className="p-2.5 font-medium text-slate-900">{m.TenThuoc}</td>
                        <td className="p-2.5 text-slate-500">{m.HamLuong || "N/A"}</td>
                        <td className="p-2.5 text-slate-500">{m.DonViTinh}</td>
                        <td className="p-2.5 text-right font-medium text-slate-700">
                          {Number(m.DonGia).toLocaleString()} đ
                        </td>
                        <td className="p-2.5 text-right">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              m.SoLuongTon <= 10
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {m.SoLuongTon}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {m.HanSuDung ? new Date(m.HanSuDung).toLocaleDateString("vi-VN") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
