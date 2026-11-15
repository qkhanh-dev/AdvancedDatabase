"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  FlaskConical,
  Lock,
  Pill,
  Plus,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { PrescriptionItemDto, RoleEnum, TrangThaiKhamEnum, TrangThaiTTEnum } from "@/types";

export default function ClinicalPage() {
  const queryClient = useQueryClient();
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Exam update state
  const [trieuChung, setTrieuChung] = useState("");
  const [chanDoanSoBo, setChanDoanSoBo] = useState("");
  const [trangThai, setTrangThai] = useState<TrangThaiKhamEnum>(TrangThaiKhamEnum.DANG_KHAM);
  const [maDotNT, setMaDotNT] = useState<string>("");

  // Prescription state
  const [loiDan, setLoiDan] = useState("Uống đủ liều và tái khám đúng hẹn");
  const [rxItems, setRxItems] = useState<PrescriptionItemDto[]>([]);
  const [pickMedicine, setPickMedicine] = useState("TH01");
  const [pickQty, setPickQty] = useState(10);
  const [pickDose, setPickDose] = useState("Sáng 1 viên, Tối 1 viên sau ăn");

  // Lab request state
  const [pickLabType, setPickLabType] = useState("XN01");

  const { data: exams = [] } = useQuery({
    queryKey: QUERY_KEYS.examinationsList(),
    queryFn: () => hospitalApi.examination.getAll(),
  });

  const { data: examDetail } = useQuery({
    queryKey: QUERY_KEYS.examinationDetail(selectedExamId),
    queryFn: () => hospitalApi.examination.getDetail(selectedExamId),
    enabled: !!selectedExamId,
  });

  const { data: medicines = [] } = useQuery({
    queryKey: QUERY_KEYS.medicinesList,
    queryFn: hospitalApi.prescription.getMedicines,
  });

  const { data: labTypes = [] } = useQuery({
    queryKey: QUERY_KEYS.labTypesList,
    queryFn: hospitalApi.lab.getTypes,
  });

  const { data: openAdmissions = [] } = useQuery({
    queryKey: QUERY_KEYS.inpatientAdmissions(true),
    queryFn: () => hospitalApi.inpatient.getAdmissions(true, examDetail?.MaBN),
    enabled: !!examDetail?.MaBN,
  });

  const selectExam = (id: string) => {
    setSelectedExamId(id);
    const found = exams.find((e) => e.MaLuotKham === id);
    if (found) {
      setTrieuChung(found.TrieuChung);
      setChanDoanSoBo(found.ChanDoanSoBo);
      setTrangThai((found.TrangThai as TrangThaiKhamEnum) || TrangThaiKhamEnum.DANG_KHAM);
      setMaDotNT(found.MaDotNT || "");
    }
  };

  const isLockedPaid = examDetail?.vienPhi?.TrangThaiThanhToan === TrangThaiTTEnum.DA_THANH_TOAN;

  const invalidateExamData = async () => {
    await queryClient.invalidateQueries({ queryKey: ["examinations"] });
    if (selectedExamId) {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.examinationDetail(selectedExamId) });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingPreview(selectedExamId) });
    }
    await queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
  };

  const updateExamMutation = useMutation({
    mutationFn: () =>
      hospitalApi.examination.update(selectedExamId, {
        trieuChung,
        chanDoanSoBo,
        trangThai,
        maDotNT: maDotNT.trim() ? maDotNT.trim() : null,
      }),
    onSuccess: invalidateExamData,
  });

  const createRxMutation = useMutation({
    mutationFn: () =>
      hospitalApi.prescription.create({
        maLuotKham: selectedExamId,
        loiDanCuaBacSi: loiDan,
        items: rxItems,
      }),
    onSuccess: async () => {
      setRxItems([]);
      await invalidateExamData();
    },
  });

  const updateRxMutation = useMutation({
    mutationFn: () => {
      const maDon = examDetail?.donThuoc?.MaDonThuoc;
      if (!maDon) throw new Error("Không tìm thấy đơn thuốc");
      return hospitalApi.prescription.update(maDon, {
        loiDanCuaBacSi: loiDan,
        ...(rxItems.length > 0 ? { items: rxItems } : {}),
      });
    },
    onSuccess: async () => {
      setRxItems([]);
      await invalidateExamData();
    },
  });

  const deleteRxMutation = useMutation({
    mutationFn: (maDonThuoc: string) => hospitalApi.prescription.remove(maDonThuoc),
    onSuccess: invalidateExamData,
  });

  const createLabMutation = useMutation({
    mutationFn: () =>
      hospitalApi.lab.createRequest({
        maLuotKham: selectedExamId,
        maLoaiXN: pickLabType,
      }),
    onSuccess: invalidateExamData,
  });

  const deleteLabMutation = useMutation({
    mutationFn: (maPhieuXN: string) => hospitalApi.lab.deleteRequest(maPhieuXN),
    onSuccess: invalidateExamData,
  });

  const addMedicineLine = () => {
    if (!pickMedicine || pickQty <= 0 || !pickDose.trim()) return;
    setRxItems((prev) => {
      const idx = prev.findIndex((i) => i.maThuoc === pickMedicine);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], soLuong: next[idx].soLuong + pickQty, lieuDung: pickDose };
        return next;
      }
      return [...prev, { maThuoc: pickMedicine, soLuong: pickQty, lieuDung: pickDose }];
    });
  };

  return (
    <AuthGuard allowedRoles={[RoleEnum.ADMIN, RoleEnum.BAC_SI]}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-teal-50 text-teal-700 border border-teal-200">
              (clinical) · LUOT_KHAM (BR-V2-04) · DON_THUOC (BR-V2-05/06) · KHÓA CHI PHÍ (BR-V2-08/13)
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Khám lâm sàng, Kê / Sửa Đơn thuốc &amp; Chỉ định Xét nghiệm
            </h1>
          </header>

          <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
            {/* EXAM QUEUE */}
            <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs h-fit">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                Danh sách Lượt khám ({exams.length})
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {exams.map((ex) => {
                  const active = selectedExamId === ex.MaLuotKham;
                  const paid = ex.vienPhi?.TrangThaiThanhToan === TrangThaiTTEnum.DA_THANH_TOAN;
                  return (
                    <button
                      key={ex.MaLuotKham}
                      type="button"
                      onClick={() => selectExam(ex.MaLuotKham)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                        active
                          ? "border-teal-500 bg-teal-50/70"
                          : "border-slate-200 hover:border-teal-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-teal-800">{ex.MaLuotKham}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono">
                          {ex.TrangThai}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {ex.benhNhan?.HoTen} ({ex.MaBN})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {ex.ChanDoanSoBo}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                        {ex.MaDotNT && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Nội trú: {ex.MaDotNT}
                          </span>
                        )}
                        {paid && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> ĐÃ THANH TOÁN
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* WORKBENCH */}
            <section className="lg:col-span-8 space-y-5">
              {!examDetail ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  Chọn một <strong>Lượt khám</strong> bên trái để cập nhật chẩn đoán, kê đơn thuốc
                  (snapshot <span className="font-mono">DonGiaKe</span>) hoặc chỉ định phiếu xét
                  nghiệm.
                </div>
              ) : (
                <>
                  {isLockedPaid && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
                      <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">
                          [BR-V2-08] Hóa đơn {examDetail.vienPhi?.MaHoaDon} đã DA_THANH_TOAN
                        </strong>
                        <p className="mt-0.5">
                          Hệ thống đã khóa toàn bộ thao tác kê mới, chỉnh sửa hoặc xóa đơn thuốc và
                          phiếu xét nghiệm cho lượt khám này.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPDATE EXAMINATION FORM */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs text-teal-700 font-semibold">
                          {examDetail.MaLuotKham} · BN: {examDetail.benhNhan?.HoTen} (
                          {examDetail.benhNhan?.Tuoi ?? "?"} tuổi)
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          Lý do khám: {examDetail.LyDoKham}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100">
                        BS: {examDetail.MaNV_BacSi}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-slate-700">Triệu chứng</label>
                        <input
                          value={trieuChung}
                          disabled={isLockedPaid}
                          onChange={(e) => setTrieuChung(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">Chẩn đoán sơ bộ</label>
                        <input
                          value={chanDoanSoBo}
                          disabled={isLockedPaid}
                          onChange={(e) => setChanDoanSoBo(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">Trạng thái lượt khám</label>
                        <select
                          value={trangThai}
                          disabled={isLockedPaid}
                          onChange={(e) => setTrangThai(e.target.value as TrangThaiKhamEnum)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                        >
                          {Object.values(TrangThaiKhamEnum).map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">
                          Gắn đợt nội trú MaDotNT (FK11 · BR-V2-04)
                        </label>
                        <select
                          value={maDotNT}
                          disabled={isLockedPaid}
                          onChange={(e) => setMaDotNT(e.target.value)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono disabled:bg-slate-100"
                        >
                          <option value="">Ngoại trú (null)</option>
                          {openAdmissions.map((d) => (
                            <option key={d.MaDotNT} value={d.MaDotNT}>
                              {d.MaDotNT} (Từ {d.NgayNhapVien})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isLockedPaid || updateExamMutation.isPending}
                      onClick={() => updateExamMutation.mutate()}
                      className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold"
                    >
                      Cập nhật Lượt khám
                    </button>
                  </div>

                  {/* PRESCRIPTION 1-0..1 */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-indigo-600" />
                        Đơn thuốc DON_THUOC (1–0..1 · snapshot DonGiaKe)
                      </h3>
                      {examDetail.donThuoc && (
                        <span className="text-xs font-mono font-bold text-indigo-700">
                          TongTienThuoc (V_DON_THUOC):{" "}
                          {Number(examDetail.donThuoc.TongTienThuoc || 0).toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                    </div>

                    {examDetail.donThuoc && (
                      <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="font-mono">{examDetail.donThuoc.MaDonThuoc}</strong> ·
                            Ngày kê: {examDetail.donThuoc.NgayKeDon}
                          </div>
                          {!isLockedPaid && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteRxMutation.mutate(examDetail.donThuoc!.MaDonThuoc)
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3 h-3" /> Xóa đơn trước TT
                            </button>
                          )}
                        </div>
                        <p className="text-slate-700">
                          Lời dặn: <strong>{examDetail.donThuoc.LoiDanCuaBacSi}</strong>
                        </p>
                        <div className="space-y-1">
                          {(examDetail.donThuoc.chiTietDonThuocs || []).map((ct) => (
                            <div
                              key={ct.MaThuoc}
                              className="flex justify-between bg-white px-2.5 py-1.5 rounded border border-indigo-100"
                            >
                              <span>
                                <strong>{ct.thuoc?.TenThuoc || ct.MaThuoc}</strong> × {ct.SoLuong}{" "}
                                {ct.thuoc?.DonViTinh || ""} — <em>{ct.LieuDung}</em>
                              </span>
                              <span className="font-mono text-indigo-800">
                                DonGiaKe: {Number(ct.DonGiaKe).toLocaleString("vi-VN")} ₫
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FORM KE DON / SUA DON */}
                    {!isLockedPaid && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                          <div className="sm:col-span-5">
                            <label className="font-semibold text-slate-700">Thuốc (THUOC)</label>
                            <select
                              value={pickMedicine}
                              onChange={(e) => setPickMedicine(e.target.value)}
                              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                            >
                              {medicines.map((m) => (
                                <option key={m.MaThuoc} value={m.MaThuoc}>
                                  {m.MaThuoc} — {m.TenThuoc} ({Number(m.DonGia).toLocaleString("vi-VN")} ₫/{m.DonViTinh})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="font-semibold text-slate-700">Số lượng &gt; 0</label>
                            <input
                              type="number"
                              min={1}
                              value={pickQty}
                              onChange={(e) => setPickQty(Number(e.target.value))}
                              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="font-semibold text-slate-700">Liều dùng</label>
                            <input
                              value={pickDose}
                              onChange={(e) => setPickDose(e.target.value)}
                              className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addMedicineLine}
                            className="sm:col-span-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center justify-center"
                            title="Thêm dòng thuốc"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {rxItems.length > 0 && (
                          <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            {rxItems.map((it) => (
                              <div key={it.maThuoc} className="flex justify-between items-center">
                                <span>
                                  <strong className="font-mono">{it.maThuoc}</strong> × {it.soLuong} —{" "}
                                  {it.lieuDung}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRxItems((prev) =>
                                      prev.filter((x) => x.maThuoc !== it.maThuoc),
                                    )
                                  }
                                  className="text-rose-600 hover:underline"
                                >
                                  Bỏ dòng
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <label className="font-semibold text-slate-700">Lời dặn của bác sĩ</label>
                          <input
                            value={loiDan}
                            onChange={(e) => setLoiDan(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        </div>

                        {!examDetail.donThuoc ? (
                          <button
                            type="button"
                            disabled={rxItems.length === 0 || createRxMutation.isPending}
                            onClick={() => createRxMutation.mutate()}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold"
                          >
                            Kê Đơn Thuốc Mới (POST /api/prescriptions)
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updateRxMutation.isPending}
                            onClick={() => updateRxMutation.mutate()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Cập nhật Đơn Thuốc trước thanh toán (PATCH)
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LAB REQUESTS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-violet-600" />
                      Chỉ định Phiếu xét nghiệm (PHIEU_XET_NGHIEM)
                    </h3>

                    {!isLockedPaid && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <select
                          value={pickLabType}
                          onChange={(e) => setPickLabType(e.target.value)}
                          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-slate-300 bg-white"
                        >
                          {labTypes.map((lt) => (
                            <option key={lt.MaLoaiXN} value={lt.MaLoaiXN}>
                              {lt.MaLoaiXN} — {lt.TenXN} ({Number(lt.DonGia).toLocaleString("vi-VN")} ₫)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={createLabMutation.isPending}
                          onClick={() => createLabMutation.mutate()}
                          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                        >
                          Chỉ định Xét nghiệm
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 text-xs">
                      {(examDetail.phieuXetNghiems || []).map((pxn) => (
                        <div
                          key={pxn.MaPhieuXN}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              <span className="font-mono text-violet-700">{pxn.MaPhieuXN}</span> —{" "}
                              {pxn.loaiXetNghiem?.TenXN || pxn.MaLoaiXN}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              DonGiaXN:{" "}
                              <strong>{Number(pxn.DonGiaXN).toLocaleString("vi-VN")} ₫</strong> ·{" "}
                              {pxn.NgayGioTraKQ
                                ? `Đã có KQ: ${pxn.KetQua} (${pxn.DanhGia || "Bình thường"})`
                                : pxn.NgayGioXN
                                  ? `Đang thực hiện (KTV: ${pxn.MaNV_KTV})`
                                  : "Đang chờ KTV nhận mẫu"}
                            </div>
                          </div>
                          {!isLockedPaid && (
                            <button
                              type="button"
                              onClick={() => deleteLabMutation.mutate(pxn.MaPhieuXN)}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                            >
                              Hủy phiếu
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
