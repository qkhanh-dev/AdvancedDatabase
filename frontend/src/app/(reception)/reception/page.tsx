"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreditCard,
  Search,
  ShieldPlus,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { BenhNhan, GioiTinhEnum, RoleEnum } from "@/types";

const patientSchema = z.object({
  maBN: z.string().max(20).optional(),
  hoTen: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(100),
  ngaySinh: z.string().min(10, "Chọn ngày sinh (YYYY-MM-DD)"),
  gioiTinh: z.nativeEnum(GioiTinhEnum),
  cccd: z.string().trim().min(9, "CCCD từ 9–20 ký tự").max(20),
  sdt: z.string().trim().min(8, "SĐT từ 8–15 ký tự").max(15),
  diaChiDuong: z.string().trim().min(1, "Nhập số nhà / tên đường").max(200),
  diaChiPhuong: z.string().trim().min(1, "Nhập phường / xã").max(100),
  diaChiQuan: z.string().trim().min(1, "Nhập quận / huyện").max(100),
  nhomMau: z.string().trim().min(1, "Chọn nhóm máu").max(10),
});

const insuranceSchema = z
  .object({
    maTheBHYT: z.string().trim().min(5, "Mã thẻ tối thiểu 5 ký tự").max(20),
    mucHuong: z.coerce
      .number()
      .min(0, "Mức hưởng phải >= 0 (BR-V2-06)")
      .max(1, "Mức hưởng phải <= 1 (VD: 0.80, 0.95, 1.0)"),
    ngayBatDau: z.string().min(10, "Chọn ngày bắt đầu"),
    ngayHetHan: z.string().min(10, "Chọn ngày hết hạn"),
  })
  .refine((d) => d.ngayHetHan >= d.ngayBatDau, {
    message: "NgayHetHan phải >= NgayBatDau (BR-V2-06)",
    path: ["ngayHetHan"],
  });

const examSchema = z.object({
  maNV_BacSi: z.string().min(1, "Chọn bác sĩ phụ trách"),
  lyDoKham: z.string().trim().min(2, "Nhập lý do khám").max(255),
  trieuChung: z.string().trim().min(2, "Nhập triệu chứng ban đầu").max(255),
  chanDoanSoBo: z.string().trim().min(2, "Nhập chẩn đoán sơ bộ").max(255),
  maDotNT: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;
type InsuranceFormValues = z.infer<typeof insuranceSchema>;
type ExamFormValues = z.infer<typeof examSchema>;

export default function ReceptionPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<BenhNhan | null>(null);
  const [validAtDate, setValidAtDate] = useState("");

  const { data: patientsListRes } = useQuery({
    queryKey: QUERY_KEYS.patientsList(),
    queryFn: () => hospitalApi.patient.getAll(1, 50),
  });

  const { data: lookupResults } = useQuery({
    queryKey: QUERY_KEYS.patientsLookup(activeQuery),
    queryFn: () => hospitalApi.patient.lookup(activeQuery),
    enabled: activeQuery.trim().length > 0,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: QUERY_KEYS.doctors,
    queryFn: hospitalApi.staff.getDoctors,
  });

  const selectedMaBN = selectedPatient?.MaBN || "";

  const { data: insuranceCards = [] } = useQuery({
    queryKey: [...QUERY_KEYS.insuranceCards(selectedMaBN), validAtDate],
    queryFn: () => hospitalApi.patient.getInsuranceCards(selectedMaBN, validAtDate || undefined),
    enabled: !!selectedMaBN,
  });

  const { data: openAdmissions = [] } = useQuery({
    queryKey: QUERY_KEYS.inpatientAdmissions(true),
    queryFn: () => hospitalApi.inpatient.getAdmissions(true, selectedMaBN),
    enabled: !!selectedMaBN,
  });

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      maBN: "",
      hoTen: "",
      ngaySinh: "1995-05-20",
      gioiTinh: GioiTinhEnum.NAM,
      cccd: "",
      sdt: "",
      diaChiDuong: "",
      diaChiPhuong: "",
      diaChiQuan: "",
      nhomMau: "O",
    },
  });

  const insuranceForm = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceSchema) as any,
    defaultValues: {
      maTheBHYT: "",
      mucHuong: 0.8,
      ngayBatDau: "2026-01-01",
      ngayHetHan: "2026-12-31",
    },
  });

  const examForm = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      maNV_BacSi: "",
      lyDoKham: "",
      trieuChung: "",
      chanDoanSoBo: "Theo dõi ban đầu",
      maDotNT: "",
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (values: PatientFormValues) =>
      hospitalApi.patient.create({
        ...values,
        maBN: values.maBN?.trim() || undefined,
      }),
    onSuccess: async (created) => {
      patientForm.reset();
      setSelectedPatient(created);
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const createInsuranceMutation = useMutation({
    mutationFn: (values: InsuranceFormValues) =>
      hospitalApi.patient.createInsuranceCard(selectedMaBN, values),
    onSuccess: async () => {
      insuranceForm.reset({
        maTheBHYT: "",
        mucHuong: 0.8,
        ngayBatDau: "2026-01-01",
        ngayHetHan: "2026-12-31",
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insuranceCards(selectedMaBN) });
    },
  });

  const createExamMutation = useMutation({
    mutationFn: (values: ExamFormValues) =>
      hospitalApi.examination.create({
        maBN: selectedMaBN,
        maNV_BacSi: values.maNV_BacSi,
        lyDoKham: values.lyDoKham,
        trieuChung: values.trieuChung,
        chanDoanSoBo: values.chanDoanSoBo,
        maDotNT: values.maDotNT?.trim() ? values.maDotNT.trim() : null,
      }),
    onSuccess: async () => {
      examForm.reset({
        maNV_BacSi: doctors[0]?.MaNV || "",
        lyDoKham: "",
        trieuChung: "",
        chanDoanSoBo: "Theo dõi ban đầu",
        maDotNT: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["examinations"] });
      if (activeQuery) {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientsLookup(activeQuery) });
      }
    },
  });

  const displayedPatients =
    activeQuery.trim().length > 0 ? (lookupResults ?? []) : (patientsListRes?.data ?? []);

  return (
    <AuthGuard allowedRoles={[RoleEnum.ADMIN, RoleEnum.TIEP_NHAN, RoleEnum.THU_NGAN]}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-amber-50 text-amber-700 border border-amber-200">
                (reception) · BENH_NHAN · THE_BHYT · LUOT_KHAM · BR-V2-06 / BR-V2-09
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Tiếp đón Bệnh nhân, Thẻ BHYT &amp; Đăng ký Lượt khám
              </h1>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveQuery(searchTerm.trim());
              }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm MaBN, CCCD, SDT, MaTheBHYT..."
                  className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg w-64 focus:outline-none focus:border-teal-600"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                Tra cứu
              </button>
              {activeQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveQuery("");
                  }}
                  className="px-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Xóa lọc
                </button>
              )}
            </form>
          </header>

          <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
            {/* LEFT: CREATE PATIENT FORM */}
            <section className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    Tạo hồ sơ BENH_NHAN (BR-V2-09)
                  </h2>
                  <span className="text-[10px] font-mono text-slate-500">
                    Hồ sơ duy nhất theo BR-V2-09
                  </span>
                </div>

                <form
                  onSubmit={patientForm.handleSubmit((v) => createPatientMutation.mutate(v))}
                  className="space-y-3 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700">Mã BN (tùy chọn)</label>
                      <input
                        {...patientForm.register("maBN")}
                        placeholder="VD: BN10 (để trống tự sinh)"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Họ và tên *</label>
                      <input
                        {...patientForm.register("hoTen")}
                        placeholder="Nguyễn Văn An"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                      />
                      {patientForm.formState.errors.hoTen && (
                        <p className="text-rose-600 text-[11px] mt-0.5">
                          {patientForm.formState.errors.hoTen.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700">Ngày sinh *</label>
                      <input
                        type="date"
                        {...patientForm.register("ngaySinh")}
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Giới tính *</label>
                      <select
                        {...patientForm.register("gioiTinh")}
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value={GioiTinhEnum.NAM}>Nam</option>
                        <option value={GioiTinhEnum.NU}>Nữ</option>
                        <option value={GioiTinhEnum.KHAC}>Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Nhóm máu *</label>
                      <select
                        {...patientForm.register("nhomMau")}
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
                      >
                        {["O", "A", "B", "AB"].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700">CCCD *</label>
                      <input
                        {...patientForm.register("cccd")}
                        placeholder="079095001122"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                      {patientForm.formState.errors.cccd && (
                        <p className="text-rose-600 text-[11px] mt-0.5">
                          {patientForm.formState.errors.cccd.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Số điện thoại *</label>
                      <input
                        {...patientForm.register("sdt")}
                        placeholder="0909123456"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                      />
                      {patientForm.formState.errors.sdt && (
                        <p className="text-rose-600 text-[11px] mt-0.5">
                          {patientForm.formState.errors.sdt.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-semibold text-slate-700">Đường *</label>
                      <input
                        {...patientForm.register("diaChiDuong")}
                        placeholder="273 An Dương Vương"
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Phường/Xã *</label>
                      <input
                        {...patientForm.register("diaChiPhuong")}
                        placeholder="Phường 3"
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700">Quận/Huyện *</label>
                      <input
                        {...patientForm.register("diaChiQuan")}
                        placeholder="Quận 5"
                        className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createPatientMutation.isPending}
                    className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold"
                  >
                    {createPatientMutation.isPending ? "Đang lưu..." : "Lưu Hồ Sơ Bệnh Nhân"}
                  </button>
                </form>
              </div>

              {/* PATIENT DIRECTORY LIST */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Danh sách Bệnh nhân ({displayedPatients.length})
                  </h2>
                  <span className="text-[11px] text-slate-500">Chọn BN để cấp BHYT / khám</span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {displayedPatients.map((p) => {
                    const active = selectedPatient?.MaBN === p.MaBN;
                    return (
                      <button
                        key={p.MaBN}
                        type="button"
                        onClick={() => setSelectedPatient(p)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          active
                            ? "border-teal-500 bg-teal-50/70"
                            : "border-slate-200 hover:border-teal-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {p.HoTen}{" "}
                            <span className="font-mono text-teal-700">({p.MaBN})</span>
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Tuổi: {p.Tuoi ?? "?"} (V_BENH_NHAN)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          CCCD: {p.CCCD} · SĐT: {p.SDT} · {p.DiaChi_Duong}, {p.DiaChi_Phuong},{" "}
                          {p.DiaChi_Quan}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* RIGHT: SELECTED PATIENT -> THE_BHYT & REGISTER LUOT_KHAM */}
            <section className="lg:col-span-7 space-y-5">
              {!selectedPatient ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                  Chọn một bệnh nhân ở cột trái (hoặc tạo mới) để quản lý thẻ <strong>THE_BHYT</strong> và
                  đăng ký <strong>LUOT_KHAM</strong>.
                </div>
              ) : (
                <>
                  {/* PATIENT SUMMARY */}
                  <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono text-teal-700 font-semibold">
                          {selectedPatient.MaBN} · Nhóm máu {selectedPatient.NhomMau}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">
                          {selectedPatient.HoTen} — {selectedPatient.Tuoi ?? "?"} tuổi (dẫn xuất)
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {selectedPatient.GioiTinh} · Sinh {selectedPatient.NgaySinh} ·{" "}
                          {selectedPatient.DiaChi_Duong}, {selectedPatient.DiaChi_Phuong},{" "}
                          {selectedPatient.DiaChi_Quan}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono">
                        Đợt nội trú mở: {openAdmissions.length}
                      </span>
                    </div>
                  </div>

                  {/* THE_BHYT MANAGEMENT */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Quản lý Thẻ BHYT (THE_BHYT · BR-V2-06)
                      </h3>
                      <label className="text-[11px] flex items-center gap-1.5 text-slate-600">
                        <span>Lọc còn hạn tại ngày:</span>
                        <input
                          type="date"
                          value={validAtDate}
                          onChange={(e) => setValidAtDate(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded font-mono text-xs"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {insuranceCards.length === 0 ? (
                        <div className="col-span-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                          Chưa có thẻ BHYT {validAtDate ? `còn hạn tại ${validAtDate}` : ""}.
                        </div>
                      ) : (
                        insuranceCards.map((card) => (
                          <div
                            key={card.MaTheBHYT}
                            className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <span className="font-mono">{card.MaTheBHYT}</span>
                              <span>Mức hưởng: {Number(card.MucHuong) * 100}% ({card.MucHuong})</span>
                            </div>
                            <div className="text-[11px] text-emerald-800 mt-1 font-mono">
                              Hiệu lực: {card.NgayBatDau} → {card.NgayHetHan}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form
                      onSubmit={insuranceForm.handleSubmit((v) =>
                        createInsuranceMutation.mutate(v),
                      )}
                      className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs items-end"
                    >
                      <div>
                        <label className="font-semibold text-slate-700">Mã thẻ BHYT *</label>
                        <input
                          {...insuranceForm.register("maTheBHYT")}
                          placeholder="DN4790009999"
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">Mức hưởng [0..1] *</label>
                        <input
                          type="number"
                          step="0.05"
                          {...insuranceForm.register("mucHuong")}
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">Từ ngày *</label>
                        <input
                          type="date"
                          {...insuranceForm.register("ngayBatDau")}
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700">Đến ngày *</label>
                        <input
                          type="date"
                          {...insuranceForm.register("ngayHetHan")}
                          className="mt-1 w-full px-2.5 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      {(insuranceForm.formState.errors.maTheBHYT ||
                        insuranceForm.formState.errors.mucHuong ||
                        insuranceForm.formState.errors.ngayHetHan) && (
                        <div className="sm:col-span-4 text-[11px] text-rose-600">
                          {insuranceForm.formState.errors.maTheBHYT?.message ||
                            insuranceForm.formState.errors.mucHuong?.message ||
                            insuranceForm.formState.errors.ngayHetHan?.message}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={createInsuranceMutation.isPending}
                        className="sm:col-span-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5"
                      >
                        <ShieldPlus className="w-3.5 h-3.5" />
                        Thêm thẻ THE_BHYT mới
                      </button>
                    </form>
                  </div>

                  {/* CREATE EXAMINATION (LUOT_KHAM) */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      Đăng ký Lượt khám mới (LUOT_KHAM · BR-V2-04)
                    </h3>

                    <form
                      onSubmit={examForm.handleSubmit((v) => createExamMutation.mutate(v))}
                      className="space-y-3 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700">Bác sĩ phụ trách *</label>
                          <select
                            {...examForm.register("maNV_BacSi")}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="">-- Chọn bác sĩ --</option>
                            {doctors.map((bs) => (
                              <option key={bs.MaNV} value={bs.MaNV}>
                                {bs.MaNV} — {bs.nhanVien?.HoTen} ({bs.ChuyenKhoa})
                              </option>
                            ))}
                          </select>
                          {examForm.formState.errors.maNV_BacSi && (
                            <p className="text-rose-600 text-[11px] mt-0.5">
                              {examForm.formState.errors.maNV_BacSi.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700">
                            Đợt nội trú liên kết MaDotNT (FK11, tùy chọn)
                          </label>
                          <select
                            {...examForm.register("maDotNT")}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                          >
                            <option value="">Khám ngoại trú (MaDotNT = null)</option>
                            {openAdmissions.map((d) => (
                              <option key={d.MaDotNT} value={d.MaDotNT}>
                                {d.MaDotNT} (Nhập viện: {d.NgayNhapVien})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="font-semibold text-slate-700">Lý do khám *</label>
                          <input
                            {...examForm.register("lyDoKham")}
                            placeholder="Sốt cao, ho khan"
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700">Triệu chứng *</label>
                          <input
                            {...examForm.register("trieuChung")}
                            placeholder="Sốt 38.5 độ, mệt mỏi"
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700">Chẩn đoán sơ bộ *</label>
                          <input
                            {...examForm.register("chanDoanSoBo")}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={createExamMutation.isPending}
                        className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                      >
                        {createExamMutation.isPending ? "Đang tạo..." : "Đăng ký Lượt Khám (POST /api/examinations)"}
                      </button>
                    </form>
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
