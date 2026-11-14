"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Hospital,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hospitalApi } from "@/services/hospitalApi";
import {
  DashboardSummaryResponse,
  Khoa,
  NhanVien,
  LichTruc,
  CaTrucEnum,
  TrangThaiDiemDanhEnum,
} from "@/types";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(null);
  const [departments, setDepartments] = useState<Khoa[]>([]);
  const [staffList, setStaffList] = useState<NhanVien[]>([]);
  const [schedules, setSchedules] = useState<LichTruc[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Duty Schedule Form
  const [scheduleForm, setScheduleForm] = useState({
    maNV: "BS01",
    maKhoa: "K_KHAM",
    ngayTruc: new Date().toISOString().split("T")[0],
    caTruc: CaTrucEnum.SANG,
    ghiChu: "Trực thường quy",
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [dash, depts, staff, scheds] = await Promise.all([
        hospitalApi.report.getDashboardSummary().catch(() => null),
        hospitalApi.department.getAll().catch(() => []),
        hospitalApi.staff.getAll().catch(() => []),
        hospitalApi.dutySchedule.getSchedules().catch(() => []),
      ]);

      setDashboard(dash);
      setDepartments(depts);
      setStaffList(staff);
      setSchedules(scheds);

      if (staff.length > 0 && !scheduleForm.maNV) {
        setScheduleForm((prev) => ({ ...prev, maNV: staff[0].MaNV }));
      }
      if (depts.length > 0 && !scheduleForm.maKhoa) {
        setScheduleForm((prev) => ({ ...prev, maKhoa: depts[0].MaKhoa }));
      }
    } catch (err: any) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const created = await hospitalApi.dutySchedule.create({
        MaNV: scheduleForm.maNV,
        MaKhoa: scheduleForm.maKhoa,
        NgayTruc: scheduleForm.ngayTruc,
        CaTruc: scheduleForm.caTruc,
        GhiChu: scheduleForm.ghiChu,
      });
      setFeedback({
        type: "success",
        text: `Đã phân lịch trực ca ${created.CaTruc} ngày ${new Date(created.NgayTruc).toLocaleDateString("vi-VN")} cho cán bộ ${created.MaNV}!`,
      });
      const updatedScheds = await hospitalApi.dutySchedule.getSchedules();
      setSchedules(updatedScheds);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi xếp lịch trực (có thể bị trùng ca trực).",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = async (sched: LichTruc, status: TrangThaiDiemDanhEnum) => {
    setLoading(true);
    setFeedback(null);
    try {
      const dateStr = new Date(sched.NgayTruc).toISOString().split("T")[0];
      await hospitalApi.dutySchedule.updateAttendance(sched.MaNV, dateStr, sched.CaTruc, status);
      setFeedback({
        type: "success",
        text: `Cập nhật điểm danh ${status} thành công cho ${sched.MaNV}!`,
      });
      const updatedScheds = await hospitalApi.dutySchedule.getSchedules();
      setSchedules(updatedScheds);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Lỗi cập nhật điểm danh ca trực.",
      });
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
              <Hospital className="w-6 h-6 text-slate-700" /> Quản Trị Hệ Thống & Báo Cáo
            </h1>
            <p className="text-sm text-slate-500">
              Dành cho Quản trị viên • Dashboard KPI, phân công lịch trực, quản lý cán bộ y tế và khoa phòng
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadAllAdminData} disabled={loading} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Cập nhật dữ liệu
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

      {/* KPI Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Tổng Doanh Thu</CardDescription>
            <CardTitle className="text-lg font-bold text-blue-600">
              {dashboard ? Number(dashboard.totalRevenue).toLocaleString() + " đ" : "0 đ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400">Tích lũy toàn hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Doanh Thu Hôm Nay</CardDescription>
            <CardTitle className="text-lg font-bold text-emerald-600">
              {dashboard ? Number(dashboard.todayRevenue).toLocaleString() + " đ" : "0 đ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400">Ghi nhận từ hóa đơn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Tổng Lượt Khám</CardDescription>
            <CardTitle className="text-lg font-bold text-indigo-600">
              {dashboard ? dashboard.totalExaminations : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400">Ngoại trú & nội trú</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Đang Điều Trị Nội Trú</CardDescription>
            <CardTitle className="text-lg font-bold text-amber-600">
              {dashboard ? dashboard.activeInpatients : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400">Bệnh nhân lưu viện</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Công Suất Giường</CardDescription>
            <CardTitle className="text-lg font-bold text-rose-600">
              {dashboard ? `${dashboard.bedOccupancy}%` : "0%"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-slate-400">Tỷ lệ chiếm dụng giường</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phân Công Lịch Trực */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Phân Công Lịch Trực
              </CardTitle>
              <CardDescription className="text-xs">
                Xếp ca trực (SÁNG, CHIỀU, TỐI, ĐÊM) - kiểm tra chống trùng giờ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700">Cán bộ y tế *</label>
                  <select
                    value={scheduleForm.maNV}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, maNV: e.target.value })}
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {staffList.map((s) => (
                      <option key={s.MaNV} value={s.MaNV}>
                        {s.HoTen} ({s.MaNV} - {s.LoaiNV})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700">Khoa trực *</label>
                  <select
                    value={scheduleForm.maKhoa}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, maKhoa: e.target.value })}
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.MaKhoa} value={d.MaKhoa}>
                        {d.TenKhoa} ({d.MaKhoa})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700">Ngày trực *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.ngayTruc}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, ngayTruc: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700">Ca trực *</label>
                  <select
                    value={scheduleForm.caTruc}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, caTruc: e.target.value as CaTrucEnum })}
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={CaTrucEnum.SANG}>Ca Sáng (07:00 - 12:00)</option>
                    <option value={CaTrucEnum.CHIEU}>Ca Chiều (12:00 - 17:00)</option>
                    <option value={CaTrucEnum.TOI}>Ca Tối (17:00 - 22:00)</option>
                    <option value={CaTrucEnum.DEM}>Ca Đêm (22:00 - 07:00)</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700">Ghi chú</label>
                  <input
                    type="text"
                    value={scheduleForm.ghiChu}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, ghiChu: e.target.value })}
                    className="mt-1 w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                  />
                </div>

                <Button type="submit" size="lg" disabled={loading} className="w-full text-[13px] font-bold bg-blue-600 hover:bg-blue-700">
                  Lưu Phân Công Ca Trực
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách Lịch Trực & Chấm Công */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" /> Bảng Phân Ca & Chấm Công
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Điểm danh trực tuyến cho nhân sự đang vào ca
                  </CardDescription>
                </div>
                <Badge variant="secondary">{schedules.length} lượt trực</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {schedules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Chưa có lịch trực nào được xếp.</p>
                ) : (
                  schedules.map((sc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{sc.MaNV}</span>
                          <Badge variant="outline" className="text-[10px]">Ca {sc.CaTruc}</Badge>
                          <span className="text-slate-500 text-[11px]">
                            Ngày: {new Date(sc.NgayTruc).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Khoa: {sc.MaKhoa} {sc.GhiChu && `• ${sc.GhiChu}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            sc.TrangThaiDiemDanh === TrangThaiDiemDanhEnum.CO_MAT
                              ? "success"
                              : sc.TrangThaiDiemDanh === TrangThaiDiemDanhEnum.VANG
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {sc.TrangThaiDiemDanh}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAttendance(sc, TrangThaiDiemDanhEnum.CO_MAT)}
                          className="text-[10px] h-7 px-2 text-emerald-700 hover:bg-emerald-50"
                        >
                          Có mặt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAttendance(sc, TrangThaiDiemDanhEnum.VANG)}
                          className="text-[10px] h-7 px-2 text-rose-700 hover:bg-rose-50"
                        >
                          Vắng
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danh mục Khoa & Nhân sự */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-600" /> Danh Sách Khoa Phòng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[160px] overflow-y-auto text-xs">
                  {departments.map((d) => (
                    <div key={d.MaKhoa} className="p-1.5 rounded bg-slate-50 flex justify-between">
                      <span className="font-medium text-slate-700">{d.TenKhoa}</span>
                      <span className="text-[10px] text-slate-400">{d.MaKhoa}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" /> Nhân Sự Cán Bộ Y Tế
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[160px] overflow-y-auto text-xs">
                  {staffList.map((s) => (
                    <div key={s.MaNV} className="p-1.5 rounded bg-slate-50 flex justify-between">
                      <span className="font-medium text-slate-700">{s.HoTen}</span>
                      <span className="text-[10px] text-slate-500">{s.LoaiNV}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
