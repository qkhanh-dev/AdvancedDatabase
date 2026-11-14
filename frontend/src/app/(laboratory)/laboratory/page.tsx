"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, RefreshCw, CheckCircle2, AlertCircle, Clock, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import { SuDungDv, DichVu } from "@/types";

export default function LaboratoryPage() {
  const [pendingList, setPendingList] = useState<SuDungDv[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [selectedItem, setSelectedItem] = useState<SuDungDv | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Result submission form
  const [resultForm, setResultForm] = useState({
    ketQua: "Chỉ số bình thường, không ghi nhận bất thường bệnh lý",
    nhanVienThucHien: "DD01",
  });

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      setLoading(true);
      const [pending, srvList] = await Promise.all([
        hospitalApi.clinicalService.getPending().catch(() => []),
        hospitalApi.clinicalService.getAllServices().catch(() => []),
      ]);
      setPendingList(pending);
      setServices(srvList);
      if (pending.length > 0 && !selectedItem) {
        setSelectedItem(pending[0]);
      }
    } catch (err: any) {
      console.error("Load lab error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.clinicalService.updateResult({
        id: selectedItem.MaSD,
        KetQua: resultForm.ketQua,
        NhanVienThucHien: resultForm.nhanVienThucHien,
      });

      setFeedback({
        type: "success",
        text: `Đã cập nhật kết quả thành công cho chỉ định ${res.MaSD}!`,
      });

      // Reload pending items
      const updated = await hospitalApi.clinicalService.getPending();
      setPendingList(updated);
      setSelectedItem(updated.length > 0 ? updated[0] : null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi cập nhật kết quả dịch vụ.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Dành cho Kỹ thuật viên & Điều dưỡng • Tiếp nhận chỉ định, nhập kết quả và trả phiếu xét nghiệm
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadPending} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới danh sách
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
        {/* Left: Pending Requests Queue */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Hàng Đợi Chờ Thực Hiện
                </CardTitle>
                <Badge variant="warning">{pendingList.length}</Badge>
              </div>
              <CardDescription className="text-xs">
                Danh sách chỉ định chưa có kết quả (Trạng thái CHỜ)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {pendingList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-8">
                    Không có chỉ định nào đang chờ thực hiện.
                  </p>
                ) : (
                  pendingList.map((item) => (
                    <div
                      key={item.MaSD}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedItem?.MaSD === item.MaSD
                          ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{item.MaSD}</span>
                        <Badge variant="outline" className="text-[10px]">{item.TrangThai}</Badge>
                      </div>
                      <div className="text-slate-700 font-medium">Mã DV: {item.MaDV}</div>
                      <div className="text-[11px] text-slate-500">
                        Lượt khám: {item.MaLK}
                      </div>
                      {item.GhiChu && (
                        <div className="text-[11px] text-amber-700 italic mt-1">
                          Ghi chú: {item.GhiChu}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Selected Service Details & Result Input */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-indigo-600" /> Nhập Kết Quả Xét Nghiệm / Cận Lâm Sàng
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Mã chỉ định: <span className="font-semibold text-slate-800">{selectedItem.MaSD}</span> • Dịch vụ: <span className="font-semibold">{selectedItem.MaDV}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="warning">{selectedItem.TrangThai}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-3">
                  <div><span className="text-slate-500">Mã Lượt khám:</span> <span className="font-semibold text-slate-800">{selectedItem.MaLK}</span></div>
                  <div><span className="text-slate-500">Bác sĩ chỉ định:</span> <span className="font-semibold text-slate-800">{selectedItem.BacSiChiDinh || "N/A"}</span></div>
                  <div><span className="text-slate-500">Thời gian chỉ định:</span> {selectedItem.ThoiGian || selectedItem.ThoiGianChiDinh ? new Date(selectedItem.ThoiGian || selectedItem.ThoiGianChiDinh).toLocaleString("vi-VN") : "N/A"}</div>
                  <div><span className="text-slate-500">Ghi chú lâm sàng:</span> {selectedItem.GhiChu || "Không có"}</div>
                </div>

                <form onSubmit={handleUpdateResult} className="space-y-4 text-xs">
                  <div>
                    <label className="font-medium text-slate-700">Mã Kỹ thuật viên / Điều dưỡng thực hiện *</label>
                    <input
                      type="text"
                      required
                      value={resultForm.nhanVienThucHien}
                      onChange={(e) => setResultForm({ ...resultForm, nhanVienThucHien: e.target.value })}
                      placeholder="Ví dụ: DD01"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Kết luận & Trả kết quả chi tiết *</label>
                    <textarea
                      rows={5}
                      required
                      value={resultForm.ketQua}
                      onChange={(e) => setResultForm({ ...resultForm, ketQua: e.target.value })}
                      placeholder="Nhập nội dung kết quả xét nghiệm, chỉ số sinh hóa, hình ảnh X-quang..."
                      className="mt-1 w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full text-xs bg-indigo-600 hover:bg-indigo-700">
                    {loading ? "Đang lưu kết quả..." : "Xác Nhận & Hoàn Tất Trả Kết Quả"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Vui lòng chọn một chỉ định từ hàng đợi bên trái để nhập kết quả.
            </Card>
          )}

          {/* Catalog of Services */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Bảng Giá Danh Mục Kỹ Thuật & Cận Lâm Sàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {services.map((s) => (
                  <div key={s.MaDV} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-800">{s.TenDV}</span>
                      <span className="text-[10px] text-slate-500 block">Mã: {s.MaDV}</span>
                    </div>
                    <span className="font-semibold text-indigo-700">{Number(s.DonGia).toLocaleString()} đ</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
