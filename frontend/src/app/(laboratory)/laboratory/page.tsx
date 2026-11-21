"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FlaskConical, Lock, Play, RefreshCw } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/useAuthStore";
import { PhieuXetNghiem, RoleEnum, TrangThaiTTEnum } from "@/types";

const completeLabSchema = z
  .object({
    ngayGioXN: z.string().min(10, "Cần thời điểm NgayGioXN"),
    ngayGioTraKQ: z.string().min(10, "Cần thời điểm NgayGioTraKQ"),
    ketQua: z.string().trim().min(1, "KetQua không được để trống (BR-V2-07)").max(500),
    danhGia: z.string().max(255).optional(),
  })
  .refine((d) => new Date(d.ngayGioTraKQ) >= new Date(d.ngayGioXN), {
    message: "NgayGioTraKQ phải >= NgayGioXN (BR-V2-07)",
    path: ["ngayGioTraKQ"],
  });

type CompleteLabFormValues = z.infer<typeof completeLabSchema>;

function toLocalIsoInput(dateStr?: string | null): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LaboratoryPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "WAITING" | "IN_PROGRESS" | "COMPLETED">(
    "PENDING",
  );
  const [selectedLab, setSelectedLab] = useState<PhieuXetNghiem | null>(null);
  const [selectedKtv, setSelectedKtv] = useState<string>("");

  const canPerformLab =
    user?.role === RoleEnum.KY_THUAT_VIEN || user?.role === RoleEnum.ADMIN;

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey:
      statusFilter === "PENDING"
        ? QUERY_KEYS.labRequestsPending
        : QUERY_KEYS.labRequestsByStatus(statusFilter),
    queryFn: () => hospitalApi.lab.getRequests({ status: statusFilter }),
  });

  const { data: technicians = [] } = useQuery({
    queryKey: QUERY_KEYS.technicians,
    queryFn: hospitalApi.staff.getTechnicians,
  });

  const completeForm = useForm<CompleteLabFormValues>({
    resolver: zodResolver(completeLabSchema),
    defaultValues: {
      ngayGioXN: toLocalIsoInput(),
      ngayGioTraKQ: toLocalIsoInput(),
      ketQua: "",
      danhGia: "",
    },
  });

  const handleSelectLab = (item: PhieuXetNghiem) => {
    setSelectedLab(item);
    const defaultKtv =
      item.MaNV_KTV ||
      (user?.role === RoleEnum.KY_THUAT_VIEN ? user.maNV : "") ||
      technicians[0]?.MaNV ||
      "";
    setSelectedKtv(defaultKtv);
    completeForm.reset({
      ngayGioXN: toLocalIsoInput(item.NgayGioXN),
      ngayGioTraKQ: toLocalIsoInput(item.NgayGioTraKQ),
      ketQua: item.KetQua || "",
      danhGia: item.DanhGia || "",
    });
  };

  const invalidateLabQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
    await queryClient.invalidateQueries({ queryKey: ["examinations"] });
    await queryClient.invalidateQueries({ queryKey: ["billing"] });
  };

  const startMutation = useMutation({
    mutationFn: (item: PhieuXetNghiem) =>
      hospitalApi.lab.startRequest(item.MaPhieuXN, {
        maNV_KTV:
          selectedKtv ||
          (user?.role === RoleEnum.KY_THUAT_VIEN ? user.maNV : technicians[0]?.MaNV) ||
          undefined,
        ngayGioXN: new Date().toISOString(),
      }),
    onSuccess: async (updated) => {
      setSelectedLab(updated);
      const startedLocal = toLocalIsoInput(updated.NgayGioXN);
      completeForm.setValue("ngayGioXN", startedLocal);
      const currentReturn = completeForm.getValues("ngayGioTraKQ");
      if (!currentReturn || currentReturn < startedLocal) {
        completeForm.setValue("ngayGioTraKQ", startedLocal);
      }
      await invalidateLabQueries();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (values: CompleteLabFormValues) => {
      if (!selectedLab) throw new Error("Chưa chọn phiếu xét nghiệm");
      return hospitalApi.lab.completeRequest(selectedLab.MaPhieuXN, {
        maNV_KTV:
          selectedLab.MaNV_KTV ||
          selectedKtv ||
          (user?.role === RoleEnum.KY_THUAT_VIEN ? user.maNV : technicians[0]?.MaNV) ||
          undefined,
        ngayGioXN: new Date(values.ngayGioXN).toISOString(),
        ngayGioTraKQ: new Date(values.ngayGioTraKQ).toISOString(),
        ketQua: values.ketQua,
        danhGia: values.danhGia?.trim() || null,
      });
    },
    onSuccess: async (updated) => {
      setSelectedLab(updated);
      await invalidateLabQueries();
    },
  });

  const isPaidLocked =
    selectedLab?.luotKham?.vienPhi?.TrangThaiThanhToan === TrangThaiTTEnum.DA_THANH_TOAN;

  return (
    <AuthGuard
      allowedRoles={[
        RoleEnum.ADMIN,
        RoleEnum.KY_THUAT_VIEN,
        RoleEnum.BAC_SI,
        RoleEnum.DIEU_DUONG,
      ]}
    >
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-violet-50 text-violet-700 border border-violet-200">
                (laboratory) · PHIEU_XET_NGHIEM · KY_THUAT_VIEN · 2 BƯỚC (BR-V2-07 &amp; BR-V2-08)
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Phòng Xét Nghiệm (LIS) — Tiếp nhận mẫu &amp; Trả Kết Quả
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {(["PENDING", "WAITING", "IN_PROGRESS", "COMPLETED"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    statusFilter === st
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
              <button
                type="button"
                onClick={() => refetch()}
                className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </header>

          <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
            {/* LAB QUEUE */}
            <aside className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-fit">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-violet-600" />
                Phiếu xét nghiệm ({requests.length})
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {requests.length === 0 ? (
                  <div className="text-xs text-slate-500 p-4 text-center bg-slate-50 rounded-lg">
                    Không có phiếu xét nghiệm ở trạng thái {statusFilter}.
                  </div>
                ) : (
                  requests.map((r) => {
                    const active = selectedLab?.MaPhieuXN === r.MaPhieuXN;
                    const stepLabel = r.NgayGioTraKQ
                      ? "COMPLETED"
                      : r.NgayGioXN
                        ? "IN_PROGRESS"
                        : "WAITING";
                    return (
                      <button
                        key={r.MaPhieuXN}
                        type="button"
                        onClick={() => handleSelectLab(r)}
                        className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                          active
                            ? "border-violet-500 bg-violet-50/60"
                            : "border-slate-200 hover:border-violet-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-violet-700">{r.MaPhieuXN}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono">
                            {stepLabel}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1">
                          {r.loaiXetNghiem?.TenXN || r.MaLoaiXN} ·{" "}
                          {Number(r.DonGiaXN).toLocaleString("vi-VN")} ₫
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Lượt khám: {r.MaLuotKham} · BN: {r.luotKham?.benhNhan?.HoTen || r.luotKham?.MaBN}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* 2-STEP WORKBENCH */}
            <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 h-fit">
              {!selectedLab ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Chọn một <strong>PHIEU_XET_NGHIEM</strong> bên trái để thực hiện bước 1 (
                  <span className="font-mono">start</span>) hoặc bước 2 (
                  <span className="font-mono">complete</span>).
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono text-violet-700 font-bold">
                        {selectedLab.MaPhieuXN} · Lượt khám {selectedLab.MaLuotKham}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedLab.loaiXetNghiem?.TenXN || selectedLab.MaLoaiXN}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Chỉ tiêu bình thường:{" "}
                        <strong>{selectedLab.loaiXetNghiem?.ChiTieuBinhThuong}</strong> · DonGiaXN:{" "}
                        <strong>{Number(selectedLab.DonGiaXN).toLocaleString("vi-VN")} ₫</strong>
                      </p>
                    </div>
                  </div>

                  {!canPerformLab && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        Chỉ <strong>KY_THUAT_VIEN</strong> (hoặc ADMIN) được phép ghi nhận mẫu và trả
                        kết quả xét nghiệm (BR-V2-01 / RolesGuard). Bạn đang xem ở chế độ chỉ đọc.
                      </span>
                    </div>
                  )}

                  {isPaidLocked && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        [BR-V2-08] Lượt khám này đã chốt hóa đơn DA_THANH_TOAN — không thể sửa phiếu.
                      </span>
                    </div>
                  )}

                  {/* STEP 1: START */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Bước 1 · Tiếp nhận mẫu &amp; Bắt đầu XN (PATCH /start)
                      </h3>
                      <span className="text-[11px] font-mono text-slate-600">
                        {selectedLab.NgayGioXN ? `Đã bắt đầu: ${selectedLab.NgayGioXN}` : "Chưa bắt đầu"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Khi ghi nhận <span className="font-mono font-semibold">MaNV_KTV</span> và{" "}
                      <span className="font-mono font-semibold">NgayGioXN IS NOT NULL</span>, phiếu
                      bắt đầu được tính vào <span className="font-mono">VIEN_PHI.TongTienDichVu</span>{" "}
                      (BR-V2-08).
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <select
                        value={selectedKtv}
                        disabled={!canPerformLab || isPaidLocked}
                        onChange={(e) => setSelectedKtv(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                      >
                        <option value="">-- Chọn KTV thực hiện (KY_THUAT_VIEN) --</option>
                        {technicians.map((ktv) => (
                          <option key={ktv.MaNV} value={ktv.MaNV}>
                            {ktv.MaNV} — {ktv.nhanVien?.HoTen} ({ktv.ChuyenMonXetNghiem})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={
                          !canPerformLab ||
                          isPaidLocked ||
                          Boolean(selectedLab.NgayGioXN) ||
                          Boolean(selectedLab.NgayGioTraKQ) ||
                          startMutation.isPending
                        }
                        onClick={() => startMutation.mutate(selectedLab)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Bắt đầu thực hiện XN
                      </button>
                    </div>
                  </div>

                  {/* STEP 2: COMPLETE */}
                  <form
                    onSubmit={completeForm.handleSubmit((v) => completeMutation.mutate(v))}
                    className="p-4 rounded-xl border border-violet-200 bg-violet-50/30 space-y-3 text-xs"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-violet-900">
                      Bước 2 · Trả Kết Quả Xét Nghiệm (PATCH /complete · BR-V2-07)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700">NgayGioXN *</label>
                        <input
                          type="datetime-local"
                          disabled={!canPerformLab || isPaidLocked}
                          {...completeForm.register("ngayGioXN")}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">
                          NgayGioTraKQ (&gt;= NgayGioXN) *
                        </label>
                        <input
                          type="datetime-local"
                          disabled={!canPerformLab || isPaidLocked}
                          {...completeForm.register("ngayGioTraKQ")}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                        />
                        {completeForm.formState.errors.ngayGioTraKQ && (
                          <p className="text-rose-600 text-[11px] mt-0.5">
                            {completeForm.formState.errors.ngayGioTraKQ.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Kết quả xét nghiệm (KetQua) *</label>
                      <textarea
                        rows={3}
                        disabled={!canPerformLab || isPaidLocked}
                        {...completeForm.register("ketQua")}
                        placeholder="VD: WBC: 7.4 G/L; RBC: 4.8 T/L; HGB: 142 g/L"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      />
                      {completeForm.formState.errors.ketQua && (
                        <p className="text-rose-600 text-[11px] mt-0.5">
                          {completeForm.formState.errors.ketQua.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Đánh giá lâm sàng (DanhGia)</label>
                      <input
                        disabled={!canPerformLab || isPaidLocked}
                        {...completeForm.register("danhGia")}
                        placeholder="Trong giới hạn bình thường"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!canPerformLab || isPaidLocked || completeMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Hoàn tất &amp; Trả Kết Quả (PATCH /complete)
                    </button>
                  </form>
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
