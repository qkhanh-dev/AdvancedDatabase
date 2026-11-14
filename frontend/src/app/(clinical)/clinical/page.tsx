"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  Activity,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import {
  LuotKham,
  Thuoc,
  DichVu,
  BacSi,
  TrangThaiKhamEnum,
} from "@/types";

export default function ClinicalPage() {
  const [examinations, setExaminations] = useState<LuotKham[]>([]);
  const [selectedExam, setSelectedExam] = useState<LuotKham | null>(null);
  const [medicines, setMedicines] = useState<Thuoc[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Examination Form
  const [newExamForm, setNewExamForm] = useState({
    maBN: "",
    maBS: "BS01",
    maPhong: "P101",
    trieuChung: "Đau đầu, sốt nhẹ",
    huyetAp: "120/80",
    mach: 75,
    nhietDo: 36.8,
  });

  // Diagnosis Form
  const [diagForm, setDiagForm] = useState({
    chanDoan: "Viêm họng cấp",
    maICD: "J02.9",
    trangThai: TrangThaiKhamEnum.HOAN_THANH,
    huongDieuTri: "Nghỉ ngơi, dùng thuốc theo đơn và tái khám sau 5 ngày",
    huyetAp: "120/80",
    mach: 75,
    nhietDo: 36.8,
  });

  // Prescribe Form
  const [prescForm, setPrescForm] = useState({
    maThuoc: "",
    soLuong: 10,
    cachDung: "Uống 1 viên sau ăn, ngày 2 lần sáng/chiều",
    ghiChu: "Uống nhiều nước ấm",
  });

  // Assign Service Form
  const [serviceForm, setServiceForm] = useState({
    maDV: "",
    ghiChu: "Kiểm tra công thức máu toàn phần",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [examList, medList, srvList, docList] = await Promise.all([
        hospitalApi.examination.getAll().catch(() => []),
        hospitalApi.prescription.getAllMedicines().catch(() => []),
        hospitalApi.clinicalService.getAllServices().catch(() => []),
        hospitalApi.staff.getDoctors().catch(() => []),
      ]);

      setExaminations(examList);
      setMedicines(medList);
      setServices(srvList);
      setDoctors(docList);

      if (medList.length > 0 && !prescForm.maThuoc) {
        setPrescForm((prev) => ({ ...prev, maThuoc: medList[0].MaThuoc }));
      }
      if (srvList.length > 0 && !serviceForm.maDV) {
        setServiceForm((prev) => ({ ...prev, maDV: srvList[0].MaDV }));
      }
      if (docList.length > 0 && !newExamForm.maBS) {
        setNewExamForm((prev) => ({ ...prev, maBS: docList[0].MaNV }));
      }
      if (examList.length > 0 && !selectedExam) {
        selectExamination(examList[0]);
      }
    } catch (err: any) {
      console.error("Load clinical error:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectExamination = (exam: LuotKham) => {
    setSelectedExam(exam);
    setDiagForm({
      chanDoan: exam.ChanDoan || "Viêm họng cấp",
      maICD: exam.MaICD || "J02.9",
      trangThai: (exam.TrangThai as TrangThaiKhamEnum) || TrangThaiKhamEnum.HOAN_THANH,
      huongDieuTri: exam.HuongDieuTri || "Nghỉ ngơi, dùng thuốc theo đơn",
      huyetAp: exam.HuyetAp || "120/80",
      mach: exam.Mach || 75,
      nhietDo: exam.NhietDo ? Number(exam.NhietDo) : 36.8,
    });
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.maBN.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập Mã Bệnh Nhân (MaBN)" });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const created = await hospitalApi.examination.create({
        MaBN: newExamForm.maBN.trim(),
        MaBS: newExamForm.maBS,
        MaPhong: newExamForm.maPhong,
        TrieuChung: newExamForm.trieuChung,
        HuyetAp: newExamForm.huyetAp,
        Mach: Number(newExamForm.mach),
        NhietDo: Number(newExamForm.nhietDo),
      });
      setFeedback({ type: "success", text: `Đã tạo lượt khám thành công: ${created.MaLK}` });
      await loadAllData();
      selectExamination(created);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.response?.data?.message || "Lỗi tạo lượt khám." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    const examKey = selectedExam.MaLK || selectedExam.MaLuotKham;
    setLoading(true);
    setFeedback(null);
    try {
      const updated = await hospitalApi.examination.updateDiagnosis(examKey, {
        ChanDoan: diagForm.chanDoan,
        MaICD: diagForm.maICD,
        TrangThai: diagForm.trangThai,
        HuongDieuTri: diagForm.huongDieuTri,
        HuyetAp: diagForm.huyetAp,
        Mach: Number(diagForm.mach),
        NhietDo: Number(diagForm.nhietDo),
      });
      setFeedback({ type: "success", text: `Cập nhật chẩn đoán thành công cho lượt khám ${updated.MaLK || updated.MaLuotKham}` });
      setSelectedExam(updated);
      const updatedList = await hospitalApi.examination.getAll();
      setExaminations(updatedList);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.response?.data?.message || "Lỗi cập nhật chẩn đoán." });
    } finally {
      setLoading(false);
    }
  };

  const handlePrescribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) {
      setFeedback({ type: "error", text: "Vui lòng chọn một lượt khám trước khi kê toa." });
      return;
    }
    const examKey = selectedExam.MaLK || selectedExam.MaLuotKham;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.prescription.create({
        MaLK: examKey,
        MaBS: selectedExam.MaBS || newExamForm.maBS || "BS01",
        GhiChu: prescForm.ghiChu,
        ChiTiet: [
          {
            MaThuoc: prescForm.maThuoc,
            SoLuong: Number(prescForm.soLuong),
            CachDung: prescForm.cachDung,
          },
        ],
      });
      setFeedback({ type: "success", text: `Kê đơn thuốc thành công: ${res.MaDT || res.MaDon}` });
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.response?.data?.message || "Lỗi kê đơn thuốc." });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) {
      setFeedback({ type: "error", text: "Vui lòng chọn một lượt khám trước khi chỉ định cận lâm sàng." });
      return;
    }
    const examKey = selectedExam.MaLK || selectedExam.MaLuotKham;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.clinicalService.assign({
        MaLK: examKey,
        MaDV: serviceForm.maDV,
        BacSiChiDinh: selectedExam.MaBS || "BS01",
        GhiChu: serviceForm.ghiChu,
      });
      setFeedback({ type: "success", text: `Chỉ định dịch vụ ${res.MaDV} thành công (Mã SD: ${res.MaSD})` });
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.response?.data?.message || "Lỗi chỉ định cận lâm sàng." });
    } finally {
      setLoading(false);
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
              <Stethoscope className="w-6 h-6 text-emerald-600" /> Phân Hệ Khám Lâm Sàng
            </h1>
            <p className="text-sm text-slate-500">
              Dành cho Bác sĩ điều trị • Khám bệnh, nhập sinh hiệu, chẩn đoán ICD, kê đơn thuốc và chỉ định dịch vụ
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadAllData} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới dữ liệu
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
        {/* Left Column: List examinations & Create New */}
        <div className="space-y-6">
          {/* Card: Tạo lượt khám mới */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" /> Mở Lượt Khám Mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700">Mã Bệnh Nhân (MaBN) *</label>
                  <input
                    type="text"
                    required
                    value={newExamForm.maBN}
                    onChange={(e) => setNewExamForm({ ...newExamForm, maBN: e.target.value })}
                    placeholder="Ví dụ: BN202611140001"
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-slate-700">Bác sĩ khám *</label>
                    <select
                      value={newExamForm.maBS}
                      onChange={(e) => setNewExamForm({ ...newExamForm, maBS: e.target.value })}
                      className="mt-1 w-full px-2 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      {doctors.map((d) => (
                        <option key={d.MaNV} value={d.MaNV}>
                          {d.NhanVien?.HoTen || d.MaNV}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Phòng khám</label>
                    <input
                      type="text"
                      value={newExamForm.maPhong}
                      onChange={(e) => setNewExamForm({ ...newExamForm, maPhong: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700">Triệu chứng ban đầu</label>
                  <input
                    type="text"
                    value={newExamForm.trieuChung}
                    onChange={(e) => setNewExamForm({ ...newExamForm, trieuChung: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-medium text-slate-700">Huyết áp</label>
                    <input
                      type="text"
                      value={newExamForm.huyetAp}
                      onChange={(e) => setNewExamForm({ ...newExamForm, huyetAp: e.target.value })}
                      className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Mạch (bpm)</label>
                    <input
                      type="number"
                      value={newExamForm.mach}
                      onChange={(e) => setNewExamForm({ ...newExamForm, mach: Number(e.target.value) })}
                      className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700">Thân nhiệt (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newExamForm.nhietDo}
                      onChange={(e) => setNewExamForm({ ...newExamForm, nhietDo: Number(e.target.value) })}
                      className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full text-xs bg-emerald-600 hover:bg-emerald-700">
                  Tạo Lượt Khám
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card: Danh sách lượt khám */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Danh Sách Lượt Khám Gần Đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {examinations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Chưa có lượt khám nào.</p>
                ) : (
                  examinations.map((exam) => (
                    <div
                      key={exam.MaLK}
                      onClick={() => selectExamination(exam)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        selectedExam?.MaLK === exam.MaLK
                          ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{exam.MaLK}</span>
                        <Badge variant="outline" className="text-[10px]">{exam.TrangThai}</Badge>
                      </div>
                      <div className="text-slate-600">Mã BN: {exam.MaBN}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Chẩn đoán: {exam.ChanDoan || "Chưa có kết luận"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right Columns: Detailed Examination Actions */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExam ? (
            <>
              {/* Card 1: Khám & Chẩn đoán */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base text-slate-900">
                        Chi Tiết Lượt Khám: {selectedExam.MaLK}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Bệnh nhân: <span className="font-semibold text-slate-700">{selectedExam.MaBN}</span> • Bác sĩ phụ trách: {selectedExam.MaBS}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{selectedExam.TrangThai}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateDiagnosis} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-700">Chẩn đoán bệnh *</label>
                        <input
                          type="text"
                          required
                          value={diagForm.chanDoan}
                          onChange={(e) => setDiagForm({ ...diagForm, chanDoan: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700">Mã bệnh chuẩn ICD-10</label>
                        <input
                          type="text"
                          value={diagForm.maICD}
                          onChange={(e) => setDiagForm({ ...diagForm, maICD: e.target.value })}
                          placeholder="Ví dụ: J02.9, E11.9, I10"
                          className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-700">Trạng thái kết luận khám</label>
                        <select
                          value={diagForm.trangThai}
                          onChange={(e) => setDiagForm({ ...diagForm, trangThai: e.target.value as TrangThaiKhamEnum })}
                          className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          <option value={TrangThaiKhamEnum.DANG_KHAM}>Đang khám (DANG_KHAM)</option>
                          <option value={TrangThaiKhamEnum.HOAN_THANH}>Hoàn thành khám ngoại trú (HOAN_THANH)</option>
                          <option value={TrangThaiKhamEnum.NHAP_VIEN}>Chỉ định nhập viện điều trị (NHAP_VIEN)</option>
                          <option value={TrangThaiKhamEnum.CHUYEN_VIEN}>Chuyển viện tuyến trên (CHUYEN_VIEN)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-slate-700">Hướng điều trị / Dặn dò</label>
                        <input
                          type="text"
                          value={diagForm.huongDieuTri}
                          onChange={(e) => setDiagForm({ ...diagForm, huongDieuTri: e.target.value })}
                          className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="font-medium text-slate-700">Huyết áp</label>
                        <input
                          type="text"
                          value={diagForm.huyetAp}
                          onChange={(e) => setDiagForm({ ...diagForm, huyetAp: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700">Mạch (bpm)</label>
                        <input
                          type="number"
                          value={diagForm.mach}
                          onChange={(e) => setDiagForm({ ...diagForm, mach: Number(e.target.value) })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700">Thân nhiệt (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={diagForm.nhietDo}
                          onChange={(e) => setDiagForm({ ...diagForm, nhietDo: Number(e.target.value) })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full text-xs bg-emerald-600 hover:bg-emerald-700">
                      Cập Nhật Chẩn Đoán & Sinh Hiệu
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Action Cards: Kê Đơn Thuốc & Chỉ Định CLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kê Đơn Thuốc */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Pill className="w-4 h-4 text-rose-600" /> Kê Toa Thuốc
                    </CardTitle>
                    <CardDescription className="text-xs">Tạo DON_THUOC và CT_DON_THUOC</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePrescribe} className="space-y-3 text-xs">
                      <div>
                        <label className="font-medium text-slate-700">Chọn Thuốc trong kho *</label>
                        <select
                          value={prescForm.maThuoc}
                          onChange={(e) => setPrescForm({ ...prescForm, maThuoc: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          {medicines.map((m) => (
                            <option key={m.MaThuoc} value={m.MaThuoc}>
                              {m.TenThuoc} ({m.DonViTinh}) - Tồn: {m.SoLuongTon}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-slate-700">Số lượng kê *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={prescForm.soLuong}
                          onChange={(e) => setPrescForm({ ...prescForm, soLuong: Number(e.target.value) })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-slate-700">Cách dùng</label>
                        <input
                          type="text"
                          value={prescForm.cachDung}
                          onChange={(e) => setPrescForm({ ...prescForm, cachDung: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-slate-700">Lời dặn bác sĩ</label>
                        <input
                          type="text"
                          value={prescForm.ghiChu}
                          onChange={(e) => setPrescForm({ ...prescForm, ghiChu: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full text-xs bg-rose-600 hover:bg-rose-700">
                        Kê Đơn Thuốc Này
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Chỉ Định Cận Lâm Sàng */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600" /> Chỉ Định Cận Lâm Sàng
                    </CardTitle>
                    <CardDescription className="text-xs">Tạo chỉ định SU_DUNG_DV</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAssignService} className="space-y-3 text-xs">
                      <div>
                        <label className="font-medium text-slate-700">Chọn Dịch vụ Kỹ thuật *</label>
                        <select
                          value={serviceForm.maDV}
                          onChange={(e) => setServiceForm({ ...serviceForm, maDV: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          {services.map((s) => (
                            <option key={s.MaDV} value={s.MaDV}>
                              {s.TenDV} - {Number(s.DonGia).toLocaleString()} đ
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-slate-700">Ghi chú lâm sàng cho KTV</label>
                        <input
                          type="text"
                          value={serviceForm.ghiChu}
                          onChange={(e) => setServiceForm({ ...serviceForm, ghiChu: e.target.value })}
                          className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 space-y-1">
                        <div>Bác sĩ chỉ định: <span className="font-semibold">{selectedExam.MaBS || "BS01"}</span></div>
                        <div>Mã lượt khám: <span className="font-semibold">{selectedExam.MaLK}</span></div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full text-xs bg-indigo-600 hover:bg-indigo-700">
                        Xác Nhận Chỉ Định Dịch Vụ
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-8 text-center text-slate-400 text-xs">
              Vui lòng chọn hoặc tạo mới một lượt khám từ danh sách bên trái.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
