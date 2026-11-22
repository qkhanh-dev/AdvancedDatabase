"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { HinhThucTTEnum, RoleEnum, TrangThaiTTEnum } from "@/types";

function formatVnd(v: number | string | undefined) {
  return `${Number(v || 0).toLocaleString("vi-VN")} ₫`;
}

export default function CashierPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<HinhThucTTEnum>(HinhThucTTEnum.TIEN_MAT);
  const [ngayLap, setNgayLap] = useState("2026-11-15");

  const { data: exams = [] } = useQuery({
    queryKey: QUERY_KEYS.examinationsList(),
    queryFn: () => hospitalApi.examination.getAll(),
  });

  const { data: preview } = useQuery({
    queryKey: QUERY_KEYS.billingPreview(selectedExamId),
    queryFn: () => hospitalApi.billing.preview(selectedExamId),
    enabled: !!selectedExamId,
  });

  const invoiceId = preview?.vienPhi?.MaHoaDon || "";

  const { data: invoiceDetail } = useQuery({
    queryKey: QUERY_KEYS.billingInvoice(invoiceId),
    queryFn: () => hospitalApi.billing.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });

  const handleSelectExam = (id: string) => {
    setSelectedExamId(id);
    setSelectedCardId("");
  };

  const invalidateBilling = async () => {
    await queryClient.invalidateQueries({ queryKey: ["examinations"] });
    if (selectedExamId) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingPreview(selectedExamId) });
    }
    if (invoiceId) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingInvoice(invoiceId) });
    }
    await queryClient.invalidateQueries({ queryKey: ["reports", "dashboard"] });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: () =>
      hospitalApi.billing.createInvoice({
        maLuotKham: selectedExamId,
        ngayLap,
        hinhThucThanhToan: paymentMethod,
        maTheBHYT: selectedCardId ? selectedCardId : null,
      }),
    onSuccess: invalidateBilling,
  });

  const payMutation = useMutation({
    mutationFn: (maHoaDon: string) =>
      hospitalApi.billing.payInvoice(maHoaDon, { hinhThucThanhToan: paymentMethod }),
    onSuccess: invalidateBilling,
  });

  const activeInvoice = invoiceDetail || preview?.vienPhi || null;
  const chosenCard = preview?.theBHYTHopLe.find((c) => c.MaTheBHYT === selectedCardId) || null;
  const estimatedDiscount = chosenCard
    ? Math.round((preview?.TongChiPhi || 0) * Number(chosenCard.MucHuong) * 100) / 100
    : 0;
  const estimatedNet = Math.max(0, (preview?.TongChiPhi || 0) - estimatedDiscount);

  return (
    <AuthGuard allowedRoles={[RoleEnum.ADMIN, RoleEnum.THU_NGAN, RoleEnum.TIEP_NHAN]}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                (cashier) · VIEN_PHI (V_VIEN_PHI) · 1 THE_BHYT HỢP LỆ · BR-V2-05, 08, 13
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Thu ngân &amp; Quyết toán Viện phí (Thuốc + Xét nghiệm)
              </h1>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              Thu ngân trực phiên: <strong>{user?.hoTen} ({user?.maNV})</strong>
            </div>
          </header>

          <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
            {/* EXAM LIST */}
            <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-fit">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Chọn Lượt khám cần tính viện phí ({exams.length})
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {exams.map((ex) => {
                  const active = selectedExamId === ex.MaLuotKham;
                  const vp = ex.vienPhi;
                  return (
                    <button
                      key={ex.MaLuotKham}
                      type="button"
                      onClick={() => handleSelectExam(ex.MaLuotKham)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                        active
                          ? "border-emerald-500 bg-emerald-50/60"
                          : "border-slate-200 hover:border-emerald-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-800">{ex.MaLuotKham}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            vp?.TrangThaiThanhToan === TrangThaiTTEnum.DA_THANH_TOAN
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : vp
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {vp ? vp.TrangThaiThanhToan : "CHƯA LẬP HĐ"}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {ex.benhNhan?.HoTen} ({ex.MaBN})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ex.ChanDoanSoBo} · {ex.NgayGioKham?.slice(0, 10)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* BILLING WORKBENCH */}
            <section className="lg:col-span-8 space-y-5">
              {!preview ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  Chọn một <strong>Lượt khám</strong> bên trái để xem bảng kê{" "}
                  <span className="font-mono">TongTienThuoc + TongTienDichVu</span> (chỉ tính phiếu XN
                  có <span className="font-mono">NgayGioXN IS NOT NULL</span>, không tính tiền giường/khám).
                </div>
              ) : (
                <>
                  {/* COST BREAKDOWN */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-emerald-700 font-bold">
                          {preview.MaLuotKham} · BN: {preview.MaBN} · Ngày khám: {preview.NgayKham}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          Bảng Kê Chi Phí Chuẩn v2 (BR-V2-08)
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">TongTienThuoc (DON_THUOC)</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {formatVnd(preview.TongTienThuoc)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">
                          TongTienDichVu (XN có NgayGioXN ≠ NULL)
                        </div>
                        <div className="text-lg font-bold text-slate-900 mt-1">
                          {formatVnd(preview.TongTienDichVu)}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200">
                        <div className="text-teal-800">Tổng chi phí (TongChiPhi)</div>
                        <div className="text-lg font-bold text-teal-900 mt-1">
                          {formatVnd(preview.TongChiPhi)}
                        </div>
                      </div>
                    </div>

                    {/* NO EXISTING INVOICE -> CREATE */}
                    {!activeInvoice ? (
                      <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Chọn tối đa 1 Thẻ BHYT còn hạn tại ngày {preview.NgayKham} (BR-V2-08)
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                              <input
                                type="radio"
                                name="bhytCard"
                                checked={selectedCardId === ""}
                                onChange={() => setSelectedCardId("")}
                              />
                              <span>Không áp dụng thẻ BHYT (TruBHYT = 0 ₫)</span>
                            </label>
                            {preview.theBHYTHopLe.map((c) => (
                              <label
                                key={c.MaTheBHYT}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="bhytCard"
                                    checked={selectedCardId === c.MaTheBHYT}
                                    onChange={() => setSelectedCardId(c.MaTheBHYT)}
                                  />
                                  <span className="font-mono font-bold text-emerald-900">
                                    {c.MaTheBHYT}
                                  </span>
                                  <span className="text-slate-600">
                                    ({c.NgayBatDau} → {c.NgayHetHan})
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-emerald-700">
                                  MucHuong: {Number(c.MucHuong) * 100}%
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-slate-700">Ngày lập hóa đơn</label>
                            <input
                              type="date"
                              value={ngayLap}
                              onChange={(e) => setNgayLap(e.target.value)}
                              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-slate-700">
                              Hình thức thanh toán
                            </label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value as HinhThucTTEnum)}
                              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                            >
                              <option value={HinhThucTTEnum.TIEN_MAT}>TIEN_MAT (Tiền mặt)</option>
                              <option value={HinhThucTTEnum.CHUYEN_KHOAN}>
                                CHUYEN_KHOAN (Chuyển khoản)
                              </option>
                              <option value={HinhThucTTEnum.THE}>THE (Thẻ POS)</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div>
                              Dự kiến TruBHYT: <strong>-{formatVnd(estimatedDiscount)}</strong>
                            </div>
                            <div className="text-sm font-bold text-emerald-700 mt-0.5">
                              Dự kiến ThucThu: {formatVnd(estimatedNet)}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={createInvoiceMutation.isPending}
                            onClick={() => createInvoiceMutation.mutate()}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            <CreditCard className="w-4 h-4" />
                            Lập Hóa Đơn Viện Phí (CHUA_THANH_TOAN)
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* EXISTING INVOICE */
                      <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono font-bold text-sm text-slate-900">
                              Hóa đơn: {activeInvoice.MaHoaDon}
                            </span>
                            <div className="text-slate-500">
                              Ngày lập: {activeInvoice.NgayLap} · Hình thức:{" "}
                              {activeInvoice.HinhThucThanhToan}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full font-mono font-bold border ${
                              activeInvoice.TrangThaiThanhToan === TrangThaiTTEnum.DA_THANH_TOAN
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            {activeInvoice.TrangThaiThanhToan}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-slate-500">TongTienThuoc</div>
                            <div className="font-bold mt-1">
                              {formatVnd(activeInvoice.TongTienThuoc)}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="text-slate-500">TongTienDichVu</div>
                            <div className="font-bold mt-1">
                              {formatVnd(activeInvoice.TongTienDichVu)}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="text-amber-800">TruBHYT</div>
                            <div className="font-bold text-amber-900 mt-1">
                              -{formatVnd(activeInvoice.TruBHYT)}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                            <div className="text-emerald-800">ThucThu (V_VIEN_PHI)</div>
                            <div className="font-bold text-emerald-900 mt-1">
                              {formatVnd(activeInvoice.ThucThu)}
                            </div>
                          </div>
                        </div>

                        {activeInvoice.TrangThaiThanhToan === TrangThaiTTEnum.CHUA_THANH_TOAN ? (
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <span>
                                <strong>[BR-V2-13]</strong> Hóa đơn đang ở trạng thái{" "}
                                <span className="font-mono">CHUA_THANH_TOAN</span>. Nếu bác sĩ/KTV
                                giảm chi phí trước khi thanh toán, hệ thống sẽ tự động kiểm tra ràng
                                buộc <span className="font-mono">TruBHYT &lt;= TongChiPhi</span>.
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <select
                                value={paymentMethod}
                                onChange={(e) =>
                                  setPaymentMethod(e.target.value as HinhThucTTEnum)
                                }
                                className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                              >
                                <option value={HinhThucTTEnum.TIEN_MAT}>TIEN_MAT</option>
                                <option value={HinhThucTTEnum.CHUYEN_KHOAN}>CHUYEN_KHOAN</option>
                                <option value={HinhThucTTEnum.THE}>THE</option>
                              </select>
                              <button
                                type="button"
                                disabled={payMutation.isPending}
                                onClick={() => payMutation.mutate(activeInvoice.MaHoaDon)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Chốt Thanh Toán (PATCH /pay · Khóa Chi Phí)
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>
                              Hóa đơn đã chốt <strong>DA_THANH_TOAN</strong>. Toàn bộ đơn thuốc, phiếu
                              xét nghiệm và viện phí của lượt khám {activeInvoice.MaLuotKham} đã
                              được khóa vĩnh viễn theo BR-V2-08.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
