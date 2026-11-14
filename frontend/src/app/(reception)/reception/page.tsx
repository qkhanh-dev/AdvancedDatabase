"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, UserPlus, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import { BenhNhan, Khoa, GioiTinhEnum, LoaiTiepNhanEnum } from "@/types";

export default function ReceptionPage() {
  const [departments, setDepartments] = useState<Khoa[]>([]);
  const [patients, setPatients] = useState<BenhNhan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<BenhNhan | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // Reception Form state
  const [formData, setFormData] = useState({
    hoTen: "",
    ngaySinh: "1990-01-01",
    gioiTinh: GioiTinhEnum.NAM,
    cccd: "",
    soDienThoai: "",
    diaChi: "",
    bhyt: "",
    maKhoa: "K_KHAM",
    lyDoKham: "Đau đầu, chóng mặt",
    loaiTiepNhan: LoaiTiepNhanEnum.DUNG_TUYEN,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingList(true);
      const [deptList, patientRes] = await Promise.all([
        hospitalApi.department.getAll().catch(() => []),
        hospitalApi.patient.getAll(1, 20).catch(() => ({ data: [], total: 0 })),
      ]);
      setDepartments(deptList);
      setPatients(patientRes.data || []);
      if (deptList.length > 0 && !formData.maKhoa) {
        setFormData((prev) => ({ ...prev, maKhoa: deptList[0].MaKhoa }));
      }
    } catch (err: any) {
      console.error("Initial load error:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await hospitalApi.patient.lookup(searchQuery.trim());
      setSearchResult(res);
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || "Không tìm thấy hồ sơ bệnh nhân với thông tin cung cấp.");
    } finally {
      setSearching(false);
    }
  };

  const handleReceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const newPatient = await hospitalApi.patient.reception({
        HoTen: formData.hoTen,
        NgaySinh: formData.ngaySinh,
        GioiTinh: formData.gioiTinh,
        CCCD: formData.cccd.trim() ? formData.cccd.trim() : undefined,
        SoDienThoai: formData.soDienThoai.trim() ? formData.soDienThoai.trim() : undefined,
        DiaChi: formData.diaChi.trim() ? formData.diaChi.trim() : undefined,
        BHYT: formData.bhyt.trim() ? formData.bhyt.trim() : undefined,
        MaKhoa: formData.maKhoa,
        LyDoKham: formData.lyDoKham,
        LoaiTiepNhan: formData.loaiTiepNhan,
      });

      setFeedback({
        type: "success",
        text: `Tiếp nhận thành công bệnh nhân: ${newPatient.HoTen} (Mã BN: ${newPatient.MaBN})`,
      });

      // Clear input fields for next entry
      setFormData({
        hoTen: "",
        ngaySinh: "1990-01-01",
        gioiTinh: GioiTinhEnum.NAM,
        cccd: "",
        soDienThoai: "",
        diaChi: "",
        bhyt: "",
        maKhoa: departments[0]?.MaKhoa || "K_KHAM",
        lyDoKham: "",
        loaiTiepNhan: LoaiTiepNhanEnum.DUNG_TUYEN,
      });

      // Refresh patients list
      const updatedList = await hospitalApi.patient.getAll(1, 20);
      setPatients(updatedList.data || []);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi tiếp nhận bệnh nhân. Vui lòng kiểm tra dữ liệu.",
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
              <Users className="w-6 h-6 text-blue-600" /> Phân Hệ Tiếp Đón & Hồ Sơ Bệnh Nhân
            </h1>
            <p className="text-sm text-slate-500">
              Quản lý thực thể BENH_NHAN, BN_NGOAI_TRU, tra cứu CCCD / BHYT và tiếp nhận khám
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tra cứu & Đăng ký tiếp nhận */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Tra cứu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" /> Tra Cứu Bệnh Nhân (CCCD / BHYT)
              </CardTitle>
              <CardDescription className="text-xs">
                Tìm kiếm chính xác bằng số Căn cước công dân (12 số) hoặc Mã BHYT (15 ký tự)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleLookup} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập 12 số CCCD hoặc 15 ký tự BHYT..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button type="submit" disabled={searching} className="gap-1.5 text-xs">
                  <Search className="w-3.5 h-3.5" />
                  {searching ? "Đang tra cứu..." : "Tìm Kiếm"}
                </Button>
              </form>

              {searchError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-950">
                      {searchResult.HoTen} ({searchResult.MaBN})
                    </span>
                    <Badge variant="success">Đã tìm thấy</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-700">
                    <div><span className="font-medium">Giới tính:</span> {searchResult.GioiTinh}</div>
                    <div><span className="font-medium">Ngày sinh:</span> {new Date(searchResult.NgaySinh).toLocaleDateString("vi-VN")}</div>
                    <div><span className="font-medium">CCCD:</span> {searchResult.CCCD || "Chưa có"}</div>
                    <div><span className="font-medium">BHYT:</span> {searchResult.BHYT || "Không"}</div>
                    <div><span className="font-medium">Điện thoại:</span> {searchResult.SoDienThoai || "N/A"}</div>
                    <div className="col-span-3"><span className="font-medium">Địa chỉ:</span> {searchResult.DiaChi || "N/A"}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Form Tiếp Nhận Bệnh Nhân */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> Tiếp Nhận Bệnh Nhân Mới (Reception)
              </CardTitle>
              <CardDescription className="text-xs">
                Tạo hồ sơ bệnh nhân, đăng ký khám ngoại trú và phân luồng vào khoa khám
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceptionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-700">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.hoTen}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Ngày sinh *</label>
                    <input
                      type="date"
                      required
                      value={formData.ngaySinh}
                      onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Giới tính *</label>
                    <select
                      value={formData.gioiTinh}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value as GioiTinhEnum })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value={GioiTinhEnum.NAM}>Nam</option>
                      <option value={GioiTinhEnum.NU}>Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Số CCCD (12 số)</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={formData.cccd}
                      onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                      placeholder="079200000001"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Mã BHYT (15 ký tự)</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={formData.bhyt}
                      onChange={(e) => setFormData({ ...formData, bhyt: e.target.value })}
                      placeholder="DN4790000000001"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      placeholder="0901234567"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-medium text-slate-700">Địa chỉ cư trú</label>
                    <input
                      type="text"
                      value={formData.diaChi}
                      onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                      placeholder="273 An Dương Vương, Q.5, TP.HCM"
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Khoa tiếp nhận khám *</label>
                    <select
                      value={formData.maKhoa}
                      onChange={(e) => setFormData({ ...formData, maKhoa: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      {departments.map((dept) => (
                        <option key={dept.MaKhoa} value={dept.MaKhoa}>
                          {dept.TenKhoa} ({dept.MaKhoa})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700">Loại tiếp nhận *</label>
                    <select
                      value={formData.loaiTiepNhan}
                      onChange={(e) => setFormData({ ...formData, loaiTiepNhan: e.target.value as LoaiTiepNhanEnum })}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value={LoaiTiepNhanEnum.DUNG_TUYEN}>Đúng tuyến BHYT (80-100%)</option>
                      <option value={LoaiTiepNhanEnum.TRAI_TUYEN}>Trái tuyến</option>
                      <option value={LoaiTiepNhanEnum.CAP_CUU}>Cấp cứu khẩn cấp</option>
                      <option value={LoaiTiepNhanEnum.KHONG_BHYT}>Tự chi trả / Không BHYT</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-medium text-slate-700">Lý do đến khám / Triệu chứng sơ bộ</label>
                    <input
                      type="text"
                      value={formData.lyDoKham}
                      onChange={(e) => setFormData({ ...formData, lyDoKham: e.target.value })}
                      placeholder="Ví dụ: Đau đầu, sốt nhẹ, khám định kỳ..."
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
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

                <Button type="submit" disabled={loading} className="w-full text-xs">
                  {loading ? "Đang xử lý tiếp nhận..." : "Xác Nhận Tiếp Nhận & Cấp Mã Hồ Sơ"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Danh sách bệnh nhân gần đây */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Hồ Sơ Đã Tiếp Nhận</CardTitle>
                <CardDescription className="text-xs">Danh sách bệnh nhân trong hệ thống</CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={loadInitialData}
                disabled={loadingList}
                className="h-8 w-8"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {patients.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    {loadingList ? "Đang tải dữ liệu..." : "Chưa có bệnh nhân nào."}
                  </p>
                ) : (
                  patients.map((p) => (
                    <div
                      key={p.MaBN}
                      className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800">{p.HoTen}</span>
                        <Badge variant="outline" className="text-[10px]">{p.MaBN}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.GioiTinh} • {new Date(p.NgaySinh).toLocaleDateString("vi-VN")}
                      </div>
                      {p.BHYT && (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          BHYT: {p.BHYT}
                        </div>
                      )}
                      {p.CCCD && (
                        <div className="text-[11px] text-slate-600">
                          CCCD: {p.CCCD}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
