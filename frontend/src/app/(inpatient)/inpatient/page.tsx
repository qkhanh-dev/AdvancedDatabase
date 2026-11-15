"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightLeft,
  BedDouble,
  Calendar,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { RoleEnum, TrangThaiGiuongEnum } from "@/types";

const admissionSchema = z.object({
  maBN: z.string().min(1, "Chọn bệnh nhân"),
  ngayNhapVien: z.string().min(10, "Chọn ngày nhập viện"),
  nguoiNhaLienHe: z.string().trim().min(2, "Nhập người nhà liên hệ").max(100),
  tinhTrangNhapVien: z.string().trim().min(2, "Nhập tình trạng nhập viện").max(100),
});

const allocateSchema = z.object({
  maDotNT: z.string().min(1, "Chọn đợt nội trú đang mở"),
  maGiuong: z.string().min(1, "Chọn giường bệnh SAN_SANG"),
  tuNgay: z.string().min(10, "Chọn TuNgay >= NgayNhapVien"),
});

const transferSchema = z.object({
  maDotNT: z.string().min(1, "Chọn đợt nội trú đang mở"),
  maGiuongMoi: z.string().min(1, "Chọn giường đích SAN_SANG"),
  ngayChuyen: z.string().min(10, "Chọn ngày chuyển > TuNgay hiện tại"),
});

type AdmissionValues = z.infer<typeof admissionSchema>;
type AllocateValues = z.infer<typeof allocateSchema>;
type TransferValues = z.infer<typeof transferSchema>;

export default function InpatientPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState("2026-11-15");
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [showAllAdmissions, setShowAllAdmissions] = useState(false);
  const [dischargeDates, setDischargeDates] = useState<Record<string, string>>({});

  const { data: bedMap = [] } = useQuery({
    queryKey: QUERY_KEYS.bedsMap(selectedDate, selectedKhoa || undefined),
    queryFn: () => hospitalApi.department.getBedMap(selectedDate, selectedKhoa || undefined),
  });

  const { data: admissions = [] } = useQuery({
    queryKey: QUERY_KEYS.inpatientAdmissions(!showAllAdmissions),
    queryFn: () => hospitalApi.inpatient.getAdmissions(!showAllAdmissions),
  });

  const { data: departments = [] } = useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: hospitalApi.department.getAll,
  });

  const { data: patientsRes } = useQuery({
    queryKey: QUERY_KEYS.patientsList(),
    queryFn: () => hospitalApi.patient.getAll(1, 50),
  });

  const admitForm = useForm<AdmissionValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      maBN: "",
      ngayNhapVien: selectedDate,
      nguoiNhaLienHe: "",
      tinhTrangNhapVien: "",
    },
  });

  const allocateForm = useForm<AllocateValues>({
    resolver: zodResolver(allocateSchema),
    defaultValues: {
      maDotNT: "",
      maGiuong: "",
      tuNgay: selectedDate,
    },
  });

  const transferForm = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      maDotNT: "",
      maGiuongMoi: "",
      ngayChuyen: selectedDate,
    },
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["beds", "map"] });
    await queryClient.invalidateQueries({ queryKey: ["inpatient", "admissions"] });
    await queryClient.invalidateQueries({ queryKey: ["reports", "dashboard"] });
  };

  const admitMutation = useMutation({
    mutationFn: (v: AdmissionValues) => hospitalApi.inpatient.admit(v),
    onSuccess: async () => {
      admitForm.reset({
        maBN: "",
        ngayNhapVien: selectedDate,
        nguoiNhaLienHe: "",
        tinhTrangNhapVien: "",
      });
      await invalidateAll();
    },
  });

  const allocateMutation = useMutation({
    mutationFn: (v: AllocateValues) => hospitalApi.inpatient.allocateBed(v),
    onSuccess: invalidateAll,
  });

  const transferMutation = useMutation({
    mutationFn: (v: TransferValues) => hospitalApi.inpatient.transferBed(v),
    onSuccess: invalidateAll,
  });

  const dischargeMutation = useMutation({
    mutationFn: ({ maDotNT, ngayRaVien }: { maDotNT: string; ngayRaVien: string }) =>
      hospitalApi.inpatient.discharge(maDotNT, { ngayRaVien }),
    onSuccess: invalidateAll,
  });

  const openAdmissions = admissions.filter((a) => !a.NgayRaVien);
  const readyBeds = bedMap.filter((b) => b.TrangThai === TrangThaiGiuongEnum.SAN_SANG);

  return (
    <AuthGuard allowedRoles={[RoleEnum.ADMIN, RoleEnum.BAC_SI, RoleEnum.DIEU_DUONG]}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                (inpatient) · DOT_NOI_TRU · PHAN_GIUONG [TuNgay, DenNgay) · BR-V2-02, 03, 11, 12
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Điều trị Nội trú, Sơ đồ Giường theo ngày &amp; Xuất viện
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Xem giường ngày:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono font-semibold focus:outline-none"
                />
              </label>
              <select
                value={selectedKhoa}
                onChange={(e) => setSelectedKhoa(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">Tất cả các khoa</option>
                {departments.map((k) => (
                  <option key={k.MaKhoa} value={k.MaKhoa}>
                    {k.TenKhoa} ({k.MaKhoa})
                  </option>
                ))}
              </select>
            </div>
          </header>

          <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
            {/* BED MAP BY DATE (BR-V2-11) */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-teal-600" />
                  Sơ đồ Giường bệnh ngày {selectedDate} (tách biệt TrangThai khai thác vs PHAN_GIUONG)
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SAN_SANG + Trống: {bedMap.filter((b) => b.TrangThai === "SAN_SANG" && !b.dangCoNguoiNam).length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                    Đang có người nằm: {bedMap.filter((b) => b.dangCoNguoiNam).length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Bảo trì / Ngưng: {bedMap.filter((b) => b.TrangThai !== "SAN_SANG").length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bedMap.map((bed) => {
                  const occupied = Boolean(bed.dangCoNguoiNam);
                  const disabledOp = bed.TrangThai !== TrangThaiGiuongEnum.SAN_SANG;
                  return (
                    <div
                      key={bed.MaGiuong}
                      className={`p-3.5 rounded-xl border text-xs transition-all ${
                        disabledOp
                          ? "border-amber-200 bg-amber-50/40"
                          : occupied
                            ? "border-sky-300 bg-sky-50/50"
                            : "border-emerald-200 bg-emerald-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {bed.MaGiuong} · Giường {bed.SoGiuong}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                            disabledOp
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-white text-emerald-700 border-emerald-200"
                          }`}
                        >
                          KT: {bed.TrangThai}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {bed.phong?.TenPhong} ({bed.phong?.khoa?.TenKhoa}) · {bed.LoaiGiuong} ·{" "}
                        {Number(bed.DonGiaNgay).toLocaleString("vi-VN")} ₫/ngày
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200/70">
                        {occupied && bed.phanGiuongHienTai ? (
                          <div className="text-[11px] text-sky-900">
                            <strong className="font-mono">{bed.phanGiuongHienTai.MaDotNT}</strong> —{" "}
                            {bed.phanGiuongHienTai.dotNoiTru?.benhNhan?.HoTen} (Từ{" "}
                            {bed.phanGiuongHienTai.TuNgay})
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">
                            Tại {selectedDate}: Chưa có bệnh nhân nằm
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3 WORKFLOW FORMS */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* OPEN DOT_NOI_TRU */}
              <form
                onSubmit={admitForm.handleSubmit((v) => admitMutation.mutate(v))}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  1. Mở Đợt nội trú (BR-V2-12)
                </h3>
                <div>
                  <label className="font-semibold text-slate-700">Bệnh nhân *</label>
                  <select
                    {...admitForm.register("maBN")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Chọn bệnh nhân --</option>
                    {(patientsRes?.data || []).map((p) => (
                      <option key={p.MaBN} value={p.MaBN}>
                        {p.MaBN} — {p.HoTen} ({p.Tuoi ?? "?"} tuổi)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Ngày nhập viện *</label>
                  <input
                    type="date"
                    {...admitForm.register("ngayNhapVien")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Người nhà liên hệ *</label>
                  <input
                    {...admitForm.register("nguoiNhaLienHe")}
                    placeholder="Nguyễn Thị Lan (0909111222)"
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tình trạng nhập viện *</label>
                  <input
                    {...admitForm.register("tinhTrangNhapVien")}
                    placeholder="Sốt cao, cần theo dõi nội trú"
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={admitMutation.isPending}
                  className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  Mở Đợt Nội Trú
                </button>
              </form>

              {/* ALLOCATE BED */}
              <form
                onSubmit={allocateForm.handleSubmit((v) => allocateMutation.mutate(v))}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-sky-600" />
                  2. Phân giường PHAN_GIUONG (BR-V2-03)
                </h3>
                <div>
                  <label className="font-semibold text-slate-700">Đợt nội trú đang mở *</label>
                  <select
                    {...allocateForm.register("maDotNT")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value="">-- Chọn MaDotNT --</option>
                    {openAdmissions.map((a) => (
                      <option key={a.MaDotNT} value={a.MaDotNT}>
                        {a.MaDotNT} — {a.benhNhan?.HoTen} (Từ {a.NgayNhapVien})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Giường SAN_SANG *</label>
                  <select
                    {...allocateForm.register("maGiuong")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value="">-- Chọn giường --</option>
                    {readyBeds.map((g) => (
                      <option key={g.MaGiuong} value={g.MaGiuong}>
                        {g.MaGiuong} ({g.phong?.TenPhong})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Từ ngày (TuNgay) *</label>
                  <input
                    type="date"
                    {...allocateForm.register("tuNgay")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={allocateMutation.isPending}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  Phân Giường (Serializable Lock)
                </button>
              </form>

              {/* TRANSFER BED */}
              <form
                onSubmit={transferForm.handleSubmit((v) => transferMutation.mutate(v))}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                  3. Chuyển giường (BR-V2-03)
                </h3>
                <div>
                  <label className="font-semibold text-slate-700">Đợt nội trú đang mở *</label>
                  <select
                    {...transferForm.register("maDotNT")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value="">-- Chọn MaDotNT --</option>
                    {openAdmissions.map((a) => (
                      <option key={a.MaDotNT} value={a.MaDotNT}>
                        {a.MaDotNT} — {a.benhNhan?.HoTen}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Giường mới SAN_SANG *</label>
                  <select
                    {...transferForm.register("maGiuongMoi")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  >
                    <option value="">-- Chọn giường đích --</option>
                    {readyBeds.map((g) => (
                      <option key={g.MaGiuong} value={g.MaGiuong}>
                        {g.MaGiuong} ({g.phong?.TenPhong})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Ngày chuyển (&gt; TuNgay cũ) *</label>
                  <input
                    type="date"
                    {...transferForm.register("ngayChuyen")}
                    className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Chuyển Giường
                </button>
              </form>
            </section>

            {/* ADMISSIONS & DISCHARGE LIST */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Danh sách Đợt nội trú DOT_NOI_TRU ({admissions.length})
                </h2>
                <label className="text-xs flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllAdmissions}
                    onChange={(e) => setShowAllAdmissions(e.target.checked)}
                  />
                  <span>Hiển thị cả đợt đã xuất viện (lịch sử BR-V2-12)</span>
                </label>
              </div>

              <div className="space-y-2 text-xs">
                {admissions.map((adm) => {
                  const isClosed = Boolean(adm.NgayRaVien);
                  const dVal = dischargeDates[adm.MaDotNT] || selectedDate;
                  return (
                    <div
                      key={adm.MaDotNT}
                      className="p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700">{adm.MaDotNT}</span>
                          <span className="font-bold text-slate-900">
                            {adm.benhNhan?.HoTen} ({adm.MaBN})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              isClosed
                                ? "bg-slate-100 text-slate-700"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {isClosed ? `Đã ra viện: ${adm.NgayRaVien}` : "ĐANG ĐIỀU TRỊ"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Nhập viện: <strong>{adm.NgayNhapVien}</strong> · Tình trạng:{" "}
                          {adm.TinhTrangNhapVien} · Liên hệ: {adm.NguoiNhaLienHe}
                        </div>
                        {(adm.phanGiuongs || []).length > 0 && (
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Giường:{" "}
                            {adm.phanGiuongs!
                              .map(
                                (pg) =>
                                  `${pg.MaGiuong} [${pg.TuNgay} → ${pg.DenNgay || "Đang mở"})`,
                              )
                              .join(" | ")}
                          </div>
                        )}
                      </div>

                      {!isClosed && (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={dVal}
                            onChange={(e) =>
                              setDischargeDates((prev) => ({
                                ...prev,
                                [adm.MaDotNT]: e.target.value,
                              }))
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                          />
                          <button
                            type="button"
                            disabled={dischargeMutation.isPending}
                            onClick={() =>
                              dischargeMutation.mutate({
                                maDotNT: adm.MaDotNT,
                                ngayRaVien: dVal,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Xuất viện (BR-V2-02)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
