"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bed,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ArrowRightLeft,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import { GiuongBenh, Khoa, BacSi, TrangThaiGiuongEnum } from "@/types";

export default function InpatientPage() {
  const [beds, setBeds] = useState<GiuongBenh[]>([]);
  const [inpatientList, setInpatientList] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Khoa[]>([]);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admit Form
  const [admitForm, setAdmitForm] = useState({
    maBN: "",
    khoaDieuTri: "K_NOI",
    bacSiDieuTri: "BS01",
    chanDoanVaoVien: "Theo dõi viêm phổi cấp, cần theo dõi nội trú",
  });

  // Assign Bed Form
  const [assignForm, setAssignForm] = useState({
    maBN: "",
    maGiuong: "",
  });

  // Transfer Bed Form
  const [transferForm, setTransferForm] = useState({
    maBN: "",
    giuongCu: "",
    giuongMoi: "",
    lyDoChuyen: "Chuyển phòng cách ly theo dõi đặc biệt",
  });

  useEffect(() => {
    loadInpatientData();
  }, []);

  const loadInpatientData = async () => {
    try {
      setLoading(true);
      const [bedMap, inpList, depts, docs] = await Promise.all([
        hospitalApi.department.getBedMap().catch(() => []),
        hospitalApi.inpatient.getPatients().catch(() => []),
        hospitalApi.department.getAll().catch(() => []),
        hospitalApi.staff.getDoctors().catch(() => []),
      ]);

      setBeds(bedMap);
      setInpatientList(inpList);
      setDepartments(depts);
      setDoctors(docs);

      const emptyBed = bedMap.find((b) => b.TrangThai === TrangThaiGiuongEnum.TRONG);
      if (emptyBed && !assignForm.maGiuong) {
        setAssignForm((prev) => ({ ...prev, maGiuong: emptyBed.MaGiuong }));
      }
      if (docs.length > 0 && !admitForm.bacSiDieuTri) {
        setAdmitForm((prev) => ({ ...prev, bacSiDieuTri: docs[0].MaNV }));
      }
    } catch (err: any) {
      console.error("Inpatient load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitForm.maBN.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.inpatient.admit({
        MaBN: admitForm.maBN.trim(),
        KhoaDieuTri: admitForm.khoaDieuTri,
        BacSiDieuTri: admitForm.bacSiDieuTri,
        ChanDoanVaoVien: admitForm.chanDoanVaoVien,
      });
      setFeedback({
        type: "success",
        text: `Nhập viện thành công cho bệnh nhân ${res.MaBN}! Sẵn sàng phân giường.`,
      });
      setAssignForm((prev) => ({ ...prev, maBN: res.MaBN }));
      await loadInpatientData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi nhập viện.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.maBN.trim() || !assignForm.maGiuong) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.inpatient.assignBed({
        MaBN: assignForm.maBN.trim(),
        MaGiuong: assignForm.maGiuong,
      });
      setFeedback({
        type: "success",
        text: `Đã phân giường ${res.MaGiuong} cho bệnh nhân ${res.MaBN} thành công (Serializable Isolation)!`,
      });
      await loadInpatientData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi phân giường (giường có thể đang được người khác dùng).",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.maBN.trim() || !transferForm.giuongCu || !transferForm.giuongMoi) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await hospitalApi.inpatient.transferBed({
        MaBN: transferForm.maBN.trim(),
        GiuongCu: transferForm.giuongCu,
        GiuongMoi: transferForm.giuongMoi,
        LyDoChuyen: transferForm.lyDoChuyen,
      });
      setFeedback({
        type: "success",
        text: `Chuyển giường thành công từ ${transferForm.giuongCu} sang ${res.MaGiuong} cho bệnh nhân ${res.MaBN}!`,
      });
      await loadInpatientData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi chuyển giường.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBed = (bed: GiuongBenh) => {
    if (bed.TrangThai === TrangThaiGiuongEnum.TRONG) {
      setAssignForm((prev) => ({ ...prev, maGiuong: bed.MaGiuong }));
      setTransferForm((prev) => ({ ...prev, giuongMoi: bed.MaGiuong }));
    } else {
      setTransferForm((prev) => ({ ...prev, giuongCu: bed.MaGiuong }));
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
              <Bed className="w-6 h-6 text-amber-600" /> Sơ Đồ Giường Bệnh & Quản Trị Nội Trú
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý BN_NOI_TRU, GIUONG_BENH, PHAN_GIUONG và cơ chế khóa dòng Serializable chống phân trùng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">TRỐNG</Badge>
          <Badge variant="destructive">ĐANG DÙNG</Badge>
          <Badge variant="warning">BẢO TRÌ</Badge>
          <Button variant="outline" size="sm" onClick={loadInpatientData} disabled={loading} className="gap-2 ml-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </Button>
        </div>
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

      {/* Bed Map Visual Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-amber-600" /> Bản Đồ Giường Bệnh Trực Quan
              </CardTitle>
              <CardDescription className="text-xs">
                Bấm vào giường bất kỳ để chọn phân giường hoặc chọn chuyển giường
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{inpatientList.length} BN Nội Trú</Badge>
              <Badge variant="secondary">{beds.length} Giường Toàn Viện</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {beds.map((bed) => {
              const isOccupied = bed.TrangThai === TrangThaiGiuongEnum.DANG_SU_DUNG;
              const isAvailable = bed.TrangThai === TrangThaiGiuongEnum.TRONG;

              return (
                <div
                  key={bed.MaGiuong}
                  onClick={() => handleSelectBed(bed)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isAvailable
                      ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-500 hover:shadow-sm"
                      : isOccupied
                      ? "bg-rose-50/50 border-rose-200 hover:border-rose-400"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800">{bed.MaGiuong}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          isAvailable
                            ? "bg-emerald-100 text-emerald-800"
                            : isOccupied
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {bed.TrangThai}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Phòng: {bed.MaPhong}</div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-600 font-medium">
                    {isAvailable ? "Click chọn cấp" : isOccupied ? "Đang có bệnh nhân" : "Đang bảo trì"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Forms Section: Admit, Assign, Transfer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form 1: Tiếp nhận nhập viện */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> 1. Tiếp Nhận Nhập Viện
            </CardTitle>
            <CardDescription className="text-xs">Chuyển bệnh nhân sang BN_NOI_TRU</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Mã Bệnh Nhân *</label>
                <input
                  type="text"
                  required
                  value={admitForm.maBN}
                  onChange={(e) => setAdmitForm({ ...admitForm, maBN: e.target.value })}
                  placeholder="Ví dụ: BN202611140001"
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Khoa điều trị nội trú *</label>
                <select
                  value={admitForm.khoaDieuTri}
                  onChange={(e) => setAdmitForm({ ...admitForm, khoaDieuTri: e.target.value })}
                  className="mt-1 w-full px-2 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.MaKhoa} value={d.MaKhoa}>
                      {d.TenKhoa} ({d.MaKhoa})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700">Bác sĩ điều trị chính *</label>
                <select
                  value={admitForm.bacSiDieuTri}
                  onChange={(e) => setAdmitForm({ ...admitForm, bacSiDieuTri: e.target.value })}
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
                <label className="font-medium text-slate-700">Chẩn đoán lúc vào viện</label>
                <input
                  type="text"
                  value={admitForm.chanDoanVaoVien}
                  onChange={(e) => setAdmitForm({ ...admitForm, chanDoanVaoVien: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs bg-blue-600 hover:bg-blue-700">
                Xác Nhận Nhập Viện
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 2: Phân Giường Mới */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bed className="w-4 h-4 text-emerald-600" /> 2. Phân Giường Bệnh
            </CardTitle>
            <CardDescription className="text-xs">Cấp giường trống (chống phân trùng)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignBed} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Mã Bệnh Nhân nội trú *</label>
                <input
                  type="text"
                  required
                  value={assignForm.maBN}
                  onChange={(e) => setAssignForm({ ...assignForm, maBN: e.target.value })}
                  placeholder="Ví dụ: BN202611140001"
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700">Chọn giường trống *</label>
                <select
                  value={assignForm.maGiuong}
                  onChange={(e) => setAssignForm({ ...assignForm, maGiuong: e.target.value })}
                  className="mt-1 w-full px-2 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">-- Chọn giường --</option>
                  {beds
                    .filter((b) => b.TrangThai === TrangThaiGiuongEnum.TRONG)
                    .map((b) => (
                      <option key={b.MaGiuong} value={b.MaGiuong}>
                        {b.MaGiuong} (Phòng: {b.MaPhong})
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-2.5 bg-slate-50 border rounded text-[11px] text-slate-500">
                Cơ chế tự động chuyển trạng thái giường sang <b>DANG_SU_DUNG</b> và ghi nhận thời gian bắt đầu nằm.
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs bg-emerald-600 hover:bg-emerald-700">
                Cấp Giường Bệnh Này
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Form 3: Chuyển Giường */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" /> 3. Chuyển Giường Bệnh
            </CardTitle>
            <CardDescription className="text-xs">Giải phóng giường cũ, cấp giường mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransferBed} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700">Mã Bệnh Nhân *</label>
                <input
                  type="text"
                  required
                  value={transferForm.maBN}
                  onChange={(e) => setTransferForm({ ...transferForm, maBN: e.target.value })}
                  placeholder="Ví dụ: BN202611140001"
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700">Giường cũ *</label>
                  <input
                    type="text"
                    required
                    value={transferForm.giuongCu}
                    onChange={(e) => setTransferForm({ ...transferForm, giuongCu: e.target.value })}
                    placeholder="G101_01"
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700">Giường mới *</label>
                  <input
                    type="text"
                    required
                    value={transferForm.giuongMoi}
                    onChange={(e) => setTransferForm({ ...transferForm, giuongMoi: e.target.value })}
                    placeholder="G102_02"
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700">Lý do chuyển giường</label>
                <input
                  type="text"
                  value={transferForm.lyDoChuyen}
                  onChange={(e) => setTransferForm({ ...transferForm, lyDoChuyen: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs bg-purple-600 hover:bg-purple-700">
                Thực Hiện Chuyển Giường
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
