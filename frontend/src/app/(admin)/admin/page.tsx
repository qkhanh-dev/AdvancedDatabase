"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  Building2,
  DoorOpen,
  FlaskConical,
  Pill,
  Users,
} from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { hospitalApi } from "@/services/hospitalApi";
import { QUERY_KEYS } from "@/lib/queryKeys";
import {
  GioiTinhEnum,
  LoaiChuyenMonFilter,
  RoleEnum,
  TrangThaiGiuongEnum,
} from "@/types";

const deptSchema = z.object({
  maKhoa: z.string().trim().min(2, "Nhập mã khoa").max(20),
  tenKhoa: z.string().trim().min(2, "Nhập tên khoa").max(100),
  diaDiem: z.string().trim().min(2, "Nhập địa điểm").max(200),
  soDienThoai: z.string().trim().min(8, "Nhập SĐT").max(15),
});

const roomSchema = z.object({
  maPhong: z.string().trim().min(2, "Nhập mã phòng").max(20),
  maKhoa: z.string().min(1, "Chọn khoa"),
  tenPhong: z.string().trim().min(2, "Nhập tên phòng").max(100),
  loaiPhong: z.string().trim().min(2, "Nhập loại phòng").max(100),
  viTri: z.string().trim().min(2, "Nhập vị trí").max(200),
});

const staffSchema = z.object({
  maNV: z.string().trim().min(2, "Nhập MaNV").max(20),
  maKhoa: z.string().min(1, "Chọn khoa"),
  hoTen: z.string().trim().min(2, "Nhập họ tên").max(100),
  ngaySinh: z.string().min(10),
  gioiTinh: z.nativeEnum(GioiTinhEnum),
  cccd: z.string().trim().min(9).max(20),
  diaChi: z.string().trim().min(2).max(200),
  soDienThoai: z.string().trim().min(8).max(15),
  ngayVaoLam: z.string().min(10),
  nhom: z.enum(["BAC_SI", "DIEU_DUONG", "KY_THUAT_VIEN", "TIEP_NHAN", "THU_NGAN", "ADMIN"]),
  chuyenKhoa: z.string().optional(),
  trinhDoHocVan: z.string().optional(),
  soChungChiHanhNghe: z.string().optional(),
  capBac: z.string().optional(),
  chungChiHanhNghe: z.string().optional(),
  chuyenMonXetNghiem: z.string().optional(),
  btdThietBiPhuTrach: z.string().optional(),
});

type DeptFormValues = z.infer<typeof deptSchema>;
type RoomFormValues = z.infer<typeof roomSchema>;
type StaffFormValues = z.infer<typeof staffSchema>;

type AdminTab = "KHOA" | "PHONG" | "GIUONG" | "NHAN_VIEN" | "DANH_MUC";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("KHOA");
  const [staffFilter, setStaffFilter] = useState<LoaiChuyenMonFilter | "">("");

  const { data: departments = [] } = useQuery({
    queryKey: QUERY_KEYS.departments,
    queryFn: hospitalApi.department.getAll,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: QUERY_KEYS.rooms(),
    queryFn: () => hospitalApi.department.getRooms(),
  });

  const { data: beds = [] } = useQuery({
    queryKey: QUERY_KEYS.bedsMap("2026-11-15"),
    queryFn: () => hospitalApi.department.getBedMap("2026-11-15"),
  });

  const { data: staffList = [] } = useQuery({
    queryKey: QUERY_KEYS.staff(staffFilter || undefined),
    queryFn: () =>
      hospitalApi.staff.getAll(staffFilter ? { loaiChuyenMon: staffFilter } : undefined),
  });

  const { data: medicines = [] } = useQuery({
    queryKey: QUERY_KEYS.medicinesList,
    queryFn: hospitalApi.prescription.getMedicines,
  });

  const { data: labTypes = [] } = useQuery({
    queryKey: QUERY_KEYS.labTypesList,
    queryFn: hospitalApi.lab.getTypes,
  });

  const deptForm = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: { maKhoa: "", tenKhoa: "", diaDiem: "", soDienThoai: "" },
  });

  const roomForm = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { maPhong: "", maKhoa: "K01", tenPhong: "", loaiPhong: "NOI_TRU", viTri: "" },
  });

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      maNV: "",
      maKhoa: "K01",
      hoTen: "",
      ngaySinh: "1992-01-15",
      gioiTinh: GioiTinhEnum.NAM,
      cccd: "",
      diaChi: "TP. Hồ Chí Minh",
      soDienThoai: "",
      ngayVaoLam: "2023-01-10",
      nhom: "KY_THUAT_VIEN",
      chuyenKhoa: "Nội tổng hợp",
      trinhDoHocVan: "Bác sĩ CKI",
      soChungChiHanhNghe: "CCHN_BS_NEW",
      capBac: "Điều dưỡng hạng III",
      chungChiHanhNghe: "CCHN_DD_NEW",
      chuyenMonXetNghiem: "Huyết học - Sinh hóa",
      btdThietBiPhuTrach: "Máy phân tích Cobas",
    },
  });

  const watchedNhom = staffForm.watch("nhom");

  const createDeptMutation = useMutation({
    mutationFn: (v: DeptFormValues) => hospitalApi.department.create(v),
    onSuccess: async () => {
      deptForm.reset();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.departments });
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: (v: RoomFormValues) => hospitalApi.department.createRoom(v),
    onSuccess: async () => {
      roomForm.reset();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms() });
    },
  });

  const updateBedMutation = useMutation({
    mutationFn: ({ maGiuong, trangThai }: { maGiuong: string; trangThai: TrangThaiGiuongEnum }) =>
      hospitalApi.department.updateBedStatus(maGiuong, { trangThai }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["beds", "map"] });
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: (v: StaffFormValues) =>
      hospitalApi.staff.create({
        maNV: v.maNV,
        maKhoa: v.maKhoa,
        hoTen: v.hoTen,
        ngaySinh: v.ngaySinh,
        gioiTinh: v.gioiTinh,
        cccd: v.cccd,
        diaChi: v.diaChi,
        soDienThoai: v.soDienThoai,
        ngayVaoLam: v.ngayVaoLam,
        role:
          v.nhom === "ADMIN"
            ? RoleEnum.ADMIN
            : v.nhom === "TIEP_NHAN"
              ? RoleEnum.TIEP_NHAN
              : v.nhom === "THU_NGAN"
                ? RoleEnum.THU_NGAN
                : (v.nhom as RoleEnum),
        ...(v.nhom === "BAC_SI"
          ? {
              bacSi: {
                chuyenKhoa: v.chuyenKhoa || "Đa khoa",
                trinhDoHocVan: v.trinhDoHocVan || "Bác sĩ",
                soChungChiHanhNghe: v.soChungChiHanhNghe || `CCHN_${v.maNV}`,
              },
            }
          : {}),
        ...(v.nhom === "DIEU_DUONG"
          ? {
              dieuDuong: {
                capBac: v.capBac || "Điều dưỡng",
                chungChiHanhNghe: v.chungChiHanhNghe || `CCHN_${v.maNV}`,
              },
            }
          : {}),
        ...(v.nhom === "KY_THUAT_VIEN"
          ? {
              kyThuatVien: {
                chuyenMonXetNghiem: v.chuyenMonXetNghiem || "Xét nghiệm tổng quát",
                btdThietBiPhuTrach: v.btdThietBiPhuTrach || "Thiết bị chuẩn LIS",
              },
            }
          : {}),
      }),
    onSuccess: async () => {
      staffForm.reset();
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "KHOA", label: "Khoa (KHOA)", icon: Building2 },
    { id: "PHONG", label: "Phòng (PHONG)", icon: DoorOpen },
    { id: "GIUONG", label: "Giường (BR-V2-11)", icon: BedDouble },
    { id: "NHAN_VIEN", label: "Nhân sự (d, p) & SoNamCongTac", icon: Users },
    { id: "DANH_MUC", label: "Danh mục Thuốc & Loại XN", icon: Pill },
  ];

  return (
    <AuthGuard allowedRoles={[RoleEnum.ADMIN]}>
      <div className="flex h-screen bg-[#f4f7fb] text-slate-900 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 space-y-3">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200">
                (admin) · CRUD KHOA, PHONG, GIUONG_BENH, NHAN_VIEN (d, p) · BR-V2-01, BR-V2-11
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Quản trị Danh mục Cơ sở Vật chất &amp; Nhân sự Hệ thống v2
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </header>

          <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
            {activeTab === "KHOA" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={deptForm.handleSubmit((v) => createDeptMutation.mutate(v))}
                  className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900">Thêm Khoa mới (POST /api/departments)</h2>
                  <input
                    {...deptForm.register("maKhoa")}
                    placeholder="Mã khoa (VD: K03)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                  <input
                    {...deptForm.register("tenKhoa")}
                    placeholder="Tên khoa (VD: Khoa Nhi)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <input
                    {...deptForm.register("diaDiem")}
                    placeholder="Địa điểm (VD: Tầng 4 - Tòa nhà A)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <input
                    {...deptForm.register("soDienThoai")}
                    placeholder="SĐT nội bộ (VD: 02838383333)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={createDeptMutation.isPending}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    Tạo Khoa Mới
                  </button>
                </form>

                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Danh sách KHOA ({departments.length})
                  </h2>
                  {departments.map((k) => (
                    <div
                      key={k.MaKhoa}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-teal-700">{k.MaKhoa}</span> —{" "}
                        <strong>{k.TenKhoa}</strong>
                        <div className="text-slate-500 mt-0.5">
                          {k.DiaDiem} · SĐT: {k.SoDienThoai}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">
                        {k._count?.nhanViens ?? 0} NV · {k._count?.phongs ?? 0} Phòng
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "PHONG" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={roomForm.handleSubmit((v) => createRoomMutation.mutate(v))}
                  className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900">Thêm Phòng mới (POST /api/rooms)</h2>
                  <input
                    {...roomForm.register("maPhong")}
                    placeholder="Mã phòng (VD: P05)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                  <select
                    {...roomForm.register("maKhoa")}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {departments.map((k) => (
                      <option key={k.MaKhoa} value={k.MaKhoa}>
                        {k.MaKhoa} — {k.TenKhoa}
                      </option>
                    ))}
                  </select>
                  <input
                    {...roomForm.register("tenPhong")}
                    placeholder="Tên phòng"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <input
                    {...roomForm.register("loaiPhong")}
                    placeholder="NOI_TRU / KHAM / XET_NGHIEM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                  <input
                    {...roomForm.register("viTri")}
                    placeholder="Vị trí (Tầng 2 - Khu A)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={createRoomMutation.isPending}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    Tạo Phòng Mới
                  </button>
                </form>

                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2 text-xs">
                  <h2 className="text-sm font-bold text-slate-900 mb-3">
                    Danh sách PHONG ({rooms.length})
                  </h2>
                  {rooms.map((p) => (
                    <div
                      key={p.MaPhong}
                      className="p-3 rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-teal-700">{p.MaPhong}</span> —{" "}
                        <strong>{p.TenPhong}</strong> ({p.LoaiPhong})
                        <div className="text-slate-500 mt-0.5">
                          Khoa: {p.khoa?.TenKhoa || p.MaKhoa} · Vị trí: {p.ViTri}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">
                        {p.giuongBenhs?.length ?? 0} giường
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "GIUONG" && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                <h2 className="text-sm font-bold text-slate-900">
                  Cấu hình Tình trạng Khai thác Giường (BR-V2-11: chỉ nhận SAN_SANG | BAO_TRI |
                  NGUNG_SU_DUNG)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {beds.map((b) => (
                    <div
                      key={b.MaGiuong}
                      className="p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">
                          {b.MaGiuong} · Giường {b.SoGiuong} ({b.LoaiGiuong})
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {b.phong?.TenPhong} · {Number(b.DonGiaNgay).toLocaleString("vi-VN")} ₫/ngày
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {Object.values(TrangThaiGiuongEnum).map((st) => (
                          <button
                            key={st}
                            type="button"
                            disabled={updateBedMutation.isPending}
                            onClick={() =>
                              updateBedMutation.mutate({ maGiuong: b.MaGiuong, trangThai: st })
                            }
                            className={`px-2 py-1 rounded text-[10px] font-mono border ${
                              b.TrangThai === st
                                ? "bg-teal-600 text-white border-teal-600 font-bold"
                                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "NHAN_VIEN" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={staffForm.handleSubmit((v) => createStaffMutation.mutate(v))}
                  className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs h-fit"
                >
                  <h2 className="text-sm font-bold text-slate-900">
                    Thêm Nhân sự (disjoint, partial BR-V2-01)
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      {...staffForm.register("maNV")}
                      placeholder="MaNV (VD: KTV02)"
                      className="px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                    <select
                      {...staffForm.register("maKhoa")}
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {departments.map((k) => (
                        <option key={k.MaKhoa} value={k.MaKhoa}>
                          {k.MaKhoa} — {k.TenKhoa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    {...staffForm.register("hoTen")}
                    placeholder="Họ và tên nhân viên"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      {...staffForm.register("ngaySinh")}
                      className="px-2 py-2 rounded-lg border border-slate-300"
                    />
                    <select
                      {...staffForm.register("gioiTinh")}
                      className="px-2 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value={GioiTinhEnum.NAM}>Nam</option>
                      <option value={GioiTinhEnum.NU}>Nữ</option>
                      <option value={GioiTinhEnum.KHAC}>Khác</option>
                    </select>
                    <input
                      type="date"
                      {...staffForm.register("ngayVaoLam")}
                      className="px-2 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      {...staffForm.register("cccd")}
                      placeholder="CCCD"
                      className="px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                    <input
                      {...staffForm.register("soDienThoai")}
                      placeholder="Số điện thoại"
                      className="px-3 py-2 rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                  <input
                    {...staffForm.register("diaChi")}
                    placeholder="Địa chỉ"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />

                  <div>
                    <label className="font-semibold text-slate-700">
                      Nhóm chuyên môn (tối đa 1 bảng con theo cây d, p):
                    </label>
                    <select
                      {...staffForm.register("nhom")}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    >
                      <option value="BAC_SI">BAC_SI (Bảng con Bác sĩ)</option>
                      <option value="DIEU_DUONG">DIEU_DUONG (Bảng con Điều dưỡng)</option>
                      <option value="KY_THUAT_VIEN">KY_THUAT_VIEN (Bảng con Kỹ thuật viên)</option>
                      <option value="TIEP_NHAN">TIEP_NHAN (Partial - Ngoài 3 bảng con)</option>
                      <option value="THU_NGAN">THU_NGAN (Partial - Ngoài 3 bảng con)</option>
                      <option value="ADMIN">ADMIN (Partial - Quản trị)</option>
                    </select>
                  </div>

                  {watchedNhom === "BAC_SI" && (
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 space-y-2">
                      <input
                        {...staffForm.register("chuyenKhoa")}
                        placeholder="Chuyên khoa"
                        className="w-full px-2.5 py-1.5 rounded border border-teal-300 bg-white"
                      />
                      <input
                        {...staffForm.register("trinhDoHocVan")}
                        placeholder="Trình độ học vấn"
                        className="w-full px-2.5 py-1.5 rounded border border-teal-300 bg-white"
                      />
                      <input
                        {...staffForm.register("soChungChiHanhNghe")}
                        placeholder="Số CCHN"
                        className="w-full px-2.5 py-1.5 rounded border border-teal-300 bg-white font-mono"
                      />
                    </div>
                  )}

                  {watchedNhom === "DIEU_DUONG" && (
                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 space-y-2">
                      <input
                        {...staffForm.register("capBac")}
                        placeholder="Cấp bậc điều dưỡng"
                        className="w-full px-2.5 py-1.5 rounded border border-sky-300 bg-white"
                      />
                      <input
                        {...staffForm.register("chungChiHanhNghe")}
                        placeholder="Chứng chỉ hành nghề (1 CCHN - BR-V2-06)"
                        className="w-full px-2.5 py-1.5 rounded border border-sky-300 bg-white font-mono"
                      />
                    </div>
                  )}

                  {watchedNhom === "KY_THUAT_VIEN" && (
                    <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 space-y-2">
                      <input
                        {...staffForm.register("chuyenMonXetNghiem")}
                        placeholder="Chuyên môn xét nghiệm"
                        className="w-full px-2.5 py-1.5 rounded border border-violet-300 bg-white"
                      />
                      <input
                        {...staffForm.register("btdThietBiPhuTrach")}
                        placeholder="Thiết bị phụ trách"
                        className="w-full px-2.5 py-1.5 rounded border border-violet-300 bg-white"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={createStaffMutation.isPending}
                    className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  >
                    Tạo Nhân Viên (POST /api/staff)
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      Danh sách Nhân sự ({staffList.length})
                    </h2>
                    <select
                      value={staffFilter}
                      onChange={(e) => setStaffFilter(e.target.value as LoaiChuyenMonFilter | "")}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                    >
                      <option value="">Tất cả nhóm (d, p)</option>
                      <option value="BAC_SI">BAC_SI</option>
                      <option value="DIEU_DUONG">DIEU_DUONG</option>
                      <option value="KY_THUAT_VIEN">KY_THUAT_VIEN</option>
                      <option value="KHAC">KHAC (Partial)</option>
                    </select>
                  </div>

                  <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                    {staffList.map((nv) => (
                      <div
                        key={nv.MaNV}
                        className="p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-teal-700">{nv.MaNV}</span> —{" "}
                          <strong>{nv.HoTen}</strong> ({nv.khoa?.TenKhoa || nv.MaKhoa})
                          <div className="text-slate-500 mt-0.5">
                            CCCD: {nv.CCCD} · SĐT: {nv.SoDienThoai} · Vào làm: {nv.NgayVaoLam}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Thâm niên: {nv.SoNamCongTac ?? 0} năm
                          </span>
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                            {nv.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "DANH_MUC" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Pill className="w-4 h-4 text-indigo-600" />
                    Danh mục Thuốc THUOC (Bảng giá chuẩn v2 · {medicines.length})
                  </h2>
                  {medicines.map((m) => (
                    <div
                      key={m.MaThuoc}
                      className="p-3 rounded-lg border border-slate-200 flex justify-between"
                    >
                      <div>
                        <strong className="font-mono text-indigo-700">{m.MaThuoc}</strong> —{" "}
                        <strong>{m.TenThuoc}</strong> ({m.HoatChat}, {m.HamLuong})
                        <div className="text-slate-500 mt-0.5">{m.HuongDanSD}</div>
                      </div>
                      <span className="font-mono font-bold">
                        {Number(m.DonGia).toLocaleString("vi-VN")} ₫/{m.DonViTinh}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <FlaskConical className="w-4 h-4 text-violet-600" />
                    Danh mục Loại xét nghiệm LOAI_XET_NGHIEM ({labTypes.length})
                  </h2>
                  {labTypes.map((lt) => (
                    <div
                      key={lt.MaLoaiXN}
                      className="p-3 rounded-lg border border-slate-200 flex justify-between"
                    >
                      <div>
                        <strong className="font-mono text-violet-700">{lt.MaLoaiXN}</strong> —{" "}
                        <strong>{lt.TenXN}</strong>
                        <div className="text-slate-500 mt-0.5">
                          Bình thường: {lt.ChiTieuBinhThuong}
                        </div>
                      </div>
                      <span className="font-mono font-bold">
                        {Number(lt.DonGia).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
