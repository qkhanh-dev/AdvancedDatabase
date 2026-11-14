"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BedDouble,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FlaskConical,
  HeartPulse,
  History,
  LayoutDashboard,
  LogOut as _UnusedLogOut,
  Pill,
  Plus,
  RefreshCw,
  Save,
  Search,
  Stethoscope,
  Thermometer,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { hospitalApi } from "@/services/hospitalApi";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BacSi,
  BenhNhan,
  DichVu,
  HuongXuTriEnum,
  LuotKham,
  Phong,
  RoleEnum,
  Thuoc,
} from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: RoleEnum[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "TỔNG QUAN",
    items: [
      {
        label: "Bảng điều khiển",
        href: "/",
        icon: LayoutDashboard,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
          RoleEnum.NV_HANH_CHINH,
          RoleEnum.THU_NGAN,
          RoleEnum.DUOC_SI,
        ],
      },
    ],
  },
  {
    group: "TIẾP ĐÓN & LÂM SÀNG",
    items: [
      {
        label: "Tiếp đón & Hồ sơ BN",
        href: "/reception",
        icon: UserPlus,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.NV_HANH_CHINH],
      },
      {
        label: "Khám lâm sàng & Kê đơn",
        href: "/clinical",
        icon: Stethoscope,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.BAC_SI],
      },
      {
        label: "Cận lâm sàng & XN",
        href: "/laboratory",
        icon: FlaskConical,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
        ],
      },
    ],
  },
  {
    group: "ĐIỀU TRỊ & HẬU CẦN",
    items: [
      {
        label: "Nội trú & Sơ đồ giường",
        href: "/inpatient",
        icon: BedDouble,
        roles: [
          RoleEnum.ADMIN,
          RoleEnum.QUAN_TRI,
          RoleEnum.BAC_SI,
          RoleEnum.DIEU_DUONG,
        ],
      },
      {
        label: "Kho dược & Phát thuốc",
        href: "/pharmacy",
        icon: Pill,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.DUOC_SI],
      },
      {
        label: "Khoa & Phòng",
        href: "/departments",
        icon: Building2,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI],
      },
    ],
  },
  {
    group: "TÀI CHÍNH & VẬN HÀNH",
    items: [
      {
        label: "Thu ngân & Viện phí BHYT",
        href: "/billing",
        icon: CreditCard,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI, RoleEnum.THU_NGAN],
      },
      {
        label: "Quản trị & Lịch trực",
        href: "/staff",
        icon: Users,
        roles: [RoleEnum.ADMIN, RoleEnum.QUAN_TRI],
      },
    ],
  },
];

const HUONG_XU_TRI_OPTIONS: {
  value: HuongXuTriEnum;
  title: string;
  desc: string;
}[] = [
  {
    value: HuongXuTriEnum.KE_DON_VE,
    title: "Kê đơn ngoại trú",
    desc: "Điều trị tại nhà & hẹn khám",
  },
  {
    value: HuongXuTriEnum.NHAP_VIEN,
    title: "Chỉ định nhập viện",
    desc: "Chuyển khoa nội trú",
  },
  {
    value: HuongXuTriEnum.CHUYEN_VIEN,
    title: "Chuyển viện trên",
    desc: "Lập phiếu chuyển tuyến",
  },
];

const HUONG_XU_TRI_LABELS: Record<HuongXuTriEnum, string> = {
  [HuongXuTriEnum.KE_DON_VE]: "Kê đơn về",
  [HuongXuTriEnum.NHAP_VIEN]: "Nhập viện",
  [HuongXuTriEnum.CHUYEN_VIEN]: "Chuyển viện",
};

const _ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị hệ thống",
  QUAN_TRI: "Quản trị viên",
  BAC_SI: "Bác sĩ Lâm sàng",
  DIEU_DUONG: "Điều dưỡng",
  NV_HANH_CHINH: "NV Hành chính",
  THU_NGAN: "Thu ngân",
  DUOC_SI: "Dược sĩ",
};

interface DraftPrescriptionItem {
  maThuoc: string;
  tenThuoc: string;
  donViTinh: string;
  donGia: number;
  soLuong: number;
  lieuDung: string;
  cachDung: string;
  soNgayUong: number;
}

type QueueFilter = "ALL" | "MINE" | "PENDING";
type ClinicalTab = "diagnosis" | "prescription" | "cls";

function formatVnd(amount: number | string | undefined | null): string {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return "0 đ";
  return `${n.toLocaleString("vi-VN")} đ`;
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

function getInitials(name?: string | null): string {
  if (!name) return "BN";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ClinicalPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [examinations, setExaminations] = useState<LuotKham[]>([]);
  const [selectedExam, setSelectedExam] = useState<LuotKham | null>(null);
  const [doctors, setDoctors] = useState<BacSi[]>([]);
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [patients, setPatients] = useState<BenhNhan[]>([]);
  const [medicines, setMedicines] = useState<Thuoc[]>([]);
  const [services, setServices] = useState<DichVu[]>([]);

  const [queueFilter, setQueueFilter] = useState<QueueFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ClinicalTab>("diagnosis");
  const [showNewForm, setShowNewForm] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [newExam, setNewExam] = useState({
    maBN: "",
    maBS: "",
    maPhongKham: "P01",
    trieuChung: "",
    huyetAp: "120/80",
    nhietDo: 36.8,
    mach: 78,
    chanDoanSoBo: "",
    huongXuTri: HuongXuTriEnum.KE_DON_VE,
    ngayTaiKham: "",
  });

  const [diagForm, setDiagForm] = useState({
    chanDoanXacDinh: "",
    huongXuTri: HuongXuTriEnum.KE_DON_VE,
    ngayTaiKham: "",
  });

  const [draftItems, setDraftItems] = useState<DraftPrescriptionItem[]>([]);
  const [medInput, setMedInput] = useState({
    maThuoc: "",
    soLuong: 10,
    lieuDung: "Sáng 1v, Tối 1v",
    cachDung: "Uống sau ăn",
    soNgayUong: 5,
  });
  const [loiDanBacSi, setLoiDanBacSi] = useState(
    "Uống nhiều nước ấm, dùng thuốc đúng giờ, tái khám ngay nếu triệu chứng nặng hơn."
  );

  const [clsInput, setClsInput] = useState({
    maDV: "",
    soLuong: 1,
  });

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, router]);

  const showNotice = useCallback((type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  }, []);

  const syncDiagnosisForm = useCallback((exam: LuotKham | null) => {
    if (!exam) return;
    setDiagForm({
      chanDoanXacDinh: exam.ChanDoanXacDinh || exam.ChanDoanSoBo || "",
      huongXuTri: exam.HuongXuTri || HuongXuTriEnum.KE_DON_VE,
      ngayTaiKham: exam.NgayTaiKham ? exam.NgayTaiKham.slice(0, 10) : "",
    });
  }, []);

  const selectExamination = useCallback(
    async (exam: LuotKham) => {
      setSelectedExam(exam);
      syncDiagnosisForm(exam);
      setDraftItems([]);
      setDetailLoading(true);
      try {
        const full = await hospitalApi.examination.getById(exam.MaLuotKham);
        setSelectedExam(full);
        syncDiagnosisForm(full);
      } catch {
        // fallback to summary
      } finally {
        setDetailLoading(false);
      }
    },
    [syncDiagnosisForm]
  );

  const loadWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, docRes, roomRes, patRes, medRes, svcRes] =
        await Promise.allSettled([
          hospitalApi.examination.getAll(),
          hospitalApi.staff.getDoctors(),
          hospitalApi.department.getAvailableRooms(),
          hospitalApi.patient.getAll(),
          hospitalApi.prescription.getAllMedicines(),
          hospitalApi.clinicalService.getAllServices(),
        ]);

      const loadedExams =
        examRes.status === "fulfilled" ? examRes.value : [];
      const loadedDocs = docRes.status === "fulfilled" ? docRes.value : [];
      const loadedRooms =
        roomRes.status === "fulfilled"
          ? roomRes.value.filter((r) => r.LoaiPhong === "KHAM")
          : [];
      const loadedPatients =
        patRes.status === "fulfilled" ? patRes.value.data : [];
      const loadedMeds = medRes.status === "fulfilled" ? medRes.value : [];
      const loadedSvcs = svcRes.status === "fulfilled" ? svcRes.value : [];

      setExaminations(loadedExams);
      setDoctors(loadedDocs);
      setRooms(loadedRooms);
      setPatients(loadedPatients);
      setMedicines(loadedMeds);
      setServices(loadedSvcs);

      setNewExam((prev) => ({
        ...prev,
        maBS:
          prev.maBS ||
          (user?.role === RoleEnum.BAC_SI && user?.maNV
            ? user.maNV
            : loadedDocs[0]?.MaNV || ""),
        maPhongKham: prev.maPhongKham || loadedRooms[0]?.MaPhong || "P01",
        maBN: prev.maBN || loadedPatients[0]?.MaBN || "",
      }));

      if (loadedMeds.length > 0 && !medInput.maThuoc) {
        const firstAvail =
          loadedMeds.find((m) => m.SoLuongTon > 0) || loadedMeds[0];
        setMedInput((prev) => ({ ...prev, maThuoc: firstAvail.MaThuoc }));
      }
      if (loadedSvcs.length > 0 && !clsInput.maDV) {
        setClsInput((prev) => ({ ...prev, maDV: loadedSvcs[0].MaDV }));
      }

      if (loadedExams.length > 0) {
        const currentId = selectedExam?.MaLuotKham;
        const match =
          loadedExams.find((e) => e.MaLuotKham === currentId) || loadedExams[0];
        await selectExamination(match);
      } else {
        setSelectedExam(null);
      }
    } catch {
      showNotice("error", "Không thể tải dữ liệu phân hệ Khám lâm sàng.");
    } finally {
      setLoading(false);
    }
  }, [
    clsInput.maDV,
    medInput.maThuoc,
    selectExamination,
    selectedExam?.MaLuotKham,
    showNotice,
    user?.maNV,
    user?.role,
  ]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      void loadWorkspaceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated]);

  const visibleNavGroupsLength = 0;
  void visibleNavGroupsLength;

  const myCount = useMemo(
    () =>
      user?.maNV
        ? examinations.filter((e) => e.MaBS === user.maNV).length
        : examinations.length,
    [examinations, user?.maNV]
  );

  const pendingCount = useMemo(
    () => examinations.filter((e) => !e.ChanDoanXacDinh).length,
    [examinations]
  );

  const completedCount = examinations.length - pendingCount;

  const filteredQueue = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return examinations.filter((exam) => {
      if (queueFilter === "MINE" && user?.maNV && exam.MaBS !== user.maNV) {
        return false;
      }
      if (queueFilter === "PENDING" && exam.ChanDoanXacDinh) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        exam.MaLuotKham,
        exam.MaBN,
        exam.benhNhan?.HoTen,
        exam.benhNhan?.CCCD,
        exam.benhNhan?.SoBHYT,
        exam.ChanDoanSoBo,
        exam.ChanDoanXacDinh,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [examinations, queueFilter, searchQuery, user?.maNV]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.maBN.trim() || !newExam.maBS.trim() || !newExam.trieuChung.trim()) {
      showNotice("error", "Vui lòng nhập đủ Mã bệnh nhân, Bác sĩ và Triệu chứng.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await hospitalApi.examination.create({
        maBN: newExam.maBN.trim(),
        maBS: newExam.maBS.trim(),
        maPhongKham: newExam.maPhongKham || "P01",
        trieuChung: newExam.trieuChung.trim(),
        huyetAp: newExam.huyetAp.trim() || "120/80",
        nhietDo: Number(newExam.nhietDo) || 36.8,
        mach: Number(newExam.mach) || 78,
        chanDoanSoBo: newExam.chanDoanSoBo.trim() || "Theo dõi lâm sàng",
        huongXuTri: newExam.huongXuTri,
        ngayTaiKham: newExam.ngayTaiKham || undefined,
      });
      showNotice("success", `Đã mở lượt khám mới: ${created.MaLuotKham}`);
      setShowNewForm(false);
      setNewExam((prev) => ({
        ...prev,
        trieuChung: "",
        chanDoanSoBo: "",
        ngayTaiKham: "",
      }));
      const list = await hospitalApi.examination.getAll();
      setExaminations(list);
      const target =
        list.find((item) => item.MaLuotKham === created.MaLuotKham) || created;
      await selectExamination(target);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Lỗi khi tạo lượt khám mới.";
      showNotice("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDiagnosis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedExam) return;
    if (!diagForm.chanDoanXacDinh.trim()) {
      showNotice("error", "Vui lòng nhập Chẩn đoán xác định trước khi lưu.");
      return;
    }
    setSubmitting(true);
    try {
      await hospitalApi.examination.updateDiagnosis(selectedExam.MaLuotKham, {
        chanDoanXacDinh: diagForm.chanDoanXacDinh.trim(),
        huongXuTri: diagForm.huongXuTri,
        ngayTaiKham: diagForm.ngayTaiKham || undefined,
      });
      showNotice("success", "Đã cập nhật chẩn đoán và hướng xử trí.");
      const [list, fresh] = await Promise.all([
        hospitalApi.examination.getAll(),
        hospitalApi.examination.getById(selectedExam.MaLuotKham),
      ]);
      setExaminations(list);
      setSelectedExam(fresh);
      syncDiagnosisForm(fresh);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể lưu kết luận khám.";
      showNotice("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMedicineRow = () => {
    const med = medicines.find((m) => m.MaThuoc === medInput.maThuoc);
    if (!med) {
      showNotice("error", "Vui lòng chọn thuốc hợp lệ.");
      return;
    }
    if (medInput.soLuong <= 0) {
      showNotice("error", "Số lượng thuốc phải lớn hơn 0.");
      return;
    }
    if (medInput.soLuong > med.SoLuongTon) {
      showNotice(
        "error",
        `Thuốc ${med.TenThuoc} chỉ còn ${med.SoLuongTon} ${med.DonViTinh} trong kho.`
      );
      return;
    }
    setDraftItems((prev) => {
      const exists = prev.find((item) => item.maThuoc === med.MaThuoc);
      if (exists) {
        return prev.map((item) =>
          item.maThuoc === med.MaThuoc
            ? {
                ...item,
                soLuong: item.soLuong + medInput.soLuong,
                lieuDung: medInput.lieuDung,
                cachDung: medInput.cachDung,
                soNgayUong: medInput.soNgayUong,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          maThuoc: med.MaThuoc,
          tenThuoc: med.TenThuoc,
          donViTinh: med.DonViTinh,
          donGia: Number(med.DonGiaHienHanh ?? med.DonGia ?? 0),
          soLuong: medInput.soLuong,
          lieuDung: medInput.lieuDung,
          cachDung: medInput.cachDung,
          soNgayUong: medInput.soNgayUong,
        },
      ];
    });
  };

  const handleRemoveDraftItem = (maThuoc: string) => {
    setDraftItems((prev) => prev.filter((item) => item.maThuoc !== maThuoc));
  };

  const handleSubmitPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    if (draftItems.length === 0) {
      showNotice("error", "Vui lòng thêm ít nhất 1 loại thuốc vào đơn.");
      return;
    }
    setSubmitting(true);
    try {
      await hospitalApi.prescription.create({
        maLuotKham: selectedExam.MaLuotKham,
        loiDanBacSi: loiDanBacSi.trim() || undefined,
        items: draftItems.map((item) => ({
          maThuoc: item.maThuoc,
          soLuong: item.soLuong,
          lieuDung: item.lieuDung,
          cachDung: item.cachDung,
          soNgayUong: item.soNgayUong,
        })),
      });
      showNotice("success", "Đã kê đơn thuốc và chuyển xuống Nhà thuốc.");
      setDraftItems([]);
      const fresh = await hospitalApi.examination.getById(selectedExam.MaLuotKham);
      setSelectedExam(fresh);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể kê đơn thuốc.";
      showNotice("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCls = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    if (!clsInput.maDV) {
      showNotice("error", "Vui lòng chọn dịch vụ cận lâm sàng.");
      return;
    }
    setSubmitting(true);
    try {
      await hospitalApi.clinicalService.assign({
        maLuotKham: selectedExam.MaLuotKham,
        maDV: clsInput.maDV,
        soLuong: Number(clsInput.soLuong) || 1,
      });
      showNotice("success", "Đã chỉ định dịch vụ cận lâm sàng.");
      const fresh = await hospitalApi.examination.getById(selectedExam.MaLuotKham);
      setSelectedExam(fresh);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể chỉ định dịch vụ CLS.";
      showNotice("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const draftTotal = useMemo(
    () =>
      draftItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0),
    [draftItems]
  );

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dfe9f5] text-[#3d4947] text-sm">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  const existingDon = selectedExam?.donThuoc;
  const existingCt = existingDon?.ctDonThuocs || existingDon?.ChiTiet || [];
  const existingCls = selectedExam?.suDungDvs || [];
  const clsDoneCount = existingCls.filter((c) => Boolean(c.KetQuaCLS)).length;

  return (
    <div className="bg-[#dfe9f5] text-[#0b1c30] antialiased h-screen w-screen overflow-hidden flex">
      {/* Shared Left Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#bcc9c6]/40 z-30 flex items-center justify-between px-4 shrink-0 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[#6d7a77] shrink-0 text-xs">
              <Link href="/" className="hover:text-[#00685f] font-medium">
                HIS
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#0b1c30] font-semibold">
                Khám lâm sàng &amp; Kê đơn
              </span>
            </div>

            <div className="relative max-w-sm w-full hidden sm:block">
              <Search className="w-3.5 h-3.5 text-[#6d7a77] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm BN (Mã, CCCD, BHYT)..."
                className="w-full h-8 pl-8 pr-12 rounded-lg bg-[#eff4ff] border border-[#bcc9c6]/50 text-[12px] text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[9px] font-mono text-[#3d4947] border border-[#bcc9c6]/40">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#cce5ff] text-[#00476e] text-[11px] font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {selectedExam?.MaPhongKham || rooms[0]?.MaPhong || "P01"} - Khám
                Ngoại trú
              </span>
            </div>
            <div className="h-4 w-[1px] bg-[#bcc9c6]/50 hidden md:block" />
            <button
              type="button"
              onClick={() => void loadWorkspaceData()}
              disabled={loading}
              title="Làm mới"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <div className="relative">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#3d4947] hover:bg-[#e5eeff]"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
            </div>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#00685f] text-white text-[10px] font-bold flex items-center justify-center">
                {getInitials(user?.hoTen || user?.maNV)}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[11px] font-semibold text-[#0b1c30] leading-tight">
                  {user?.hoTen || user?.maNV}
                </span>
                <span className="text-[9.5px] font-mono text-[#00685f] font-semibold">
                  {selectedExam?.phongKham?.SoPhong ||
                    selectedExam?.MaPhongKham ||
                    "PK-01"}{" "}
                  • Ca Trực
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col p-3 gap-2.5 overflow-hidden min-h-0 bg-[#dfe9f5]">
          {/* Doctor Shift Banner */}
          <div className="w-full bg-white rounded-xl shadow-xs px-3.5 py-2 flex items-center justify-between gap-2 shrink-0 border border-[#bcc9c6]/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-[#008378] text-[#f4fffc] flex items-center justify-center shadow-xs shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-[13px] text-[#0b1c30] font-bold shrink-0">
                  {selectedExam?.bacSi?.nhanVien?.HoTen ||
                    user?.hoTen ||
                    "Bác sĩ trực"}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#005049] font-mono text-[10px] font-semibold">
                  {selectedExam?.phongKham?.SoPhong ||
                    selectedExam?.MaPhongKham ||
                    "P01"}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#00476e] text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse" />
                  Khám Lâm Sàng Ngoại Trú
                </span>
                <span className="text-[#6d7a77] text-[11px] truncate hidden xl:inline">
                  | Quyền: Khám lâm sàng, Chỉ định CLS &amp; Kê đơn ngoại trú
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-[10px] uppercase text-[#6d7a77] font-semibold">
                  Tiến độ:
                </span>
                <span className="text-[#00685f] text-[13px] font-bold font-mono">
                  {completedCount} / {examinations.length}{" "}
                  <span className="text-[10px] text-[#6d7a77] font-normal font-sans">
                    BN
                  </span>
                </span>
              </div>
              <div className="h-4 w-px bg-[#d3e4fe]" />
              <button
                type="button"
                onClick={() => setQueueFilter("ALL")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>Tất cả ca khám</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`flex items-center justify-between px-3.5 py-2 rounded-lg border text-xs font-medium shrink-0 ${
                feedback.type === "success"
                  ? "bg-[#89f5e7]/40 border-[#00685f]/30 text-[#005049]"
                  : "bg-[#ffdad6] border-[#ba1a1a]/30 text-[#93000a]"
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-0.5 hover:opacity-70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 12-Col Clinical Grid */}
          <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
            {/* Left Column: Examination Queue */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
              {/* Queue Header + Filter + Search */}
              <div className="bg-white rounded-xl shadow-xs p-2.5 flex flex-col gap-2 shrink-0 border border-[#bcc9c6]/30">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-[#00685f]" />
                    <span className="text-[13px] text-[#0b1c30] font-bold">
                      Danh Sách Khám
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewForm((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[11px] font-semibold shadow-xs transition-all"
                  >
                    {showNewForm ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>Đóng</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Mở Lượt Mới</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3 Filter Tabs with Counters */}
                <div className="grid grid-cols-3 gap-1 bg-[#e5eeff] p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setQueueFilter("ALL")}
                    className={`py-1 px-1 rounded-md font-semibold text-center transition-colors ${
                      queueFilter === "ALL"
                        ? "bg-white text-[#0b1c30] shadow-xs"
                        : "text-[#3d4947] hover:text-[#0b1c30]"
                    }`}
                  >
                    Tất cả{" "}
                    <span className="ml-0.5 px-1 py-0.5 rounded bg-[#d3e4fe] text-[9.5px] font-mono">
                      {examinations.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueFilter("MINE")}
                    className={`py-1 px-1 rounded-md font-semibold text-center transition-colors ${
                      queueFilter === "MINE"
                        ? "bg-white text-[#0b1c30] shadow-xs"
                        : "text-[#3d4947] hover:text-[#0b1c30]"
                    }`}
                  >
                    Của tôi{" "}
                    <span className="ml-0.5 px-1 py-0.5 rounded bg-[#89f5e7] text-[#005049] text-[9.5px] font-mono">
                      {myCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueFilter("PENDING")}
                    className={`py-1 px-1 rounded-md font-semibold text-center transition-colors ${
                      queueFilter === "PENDING"
                        ? "bg-white text-[#0b1c30] shadow-xs"
                        : "text-[#3d4947] hover:text-[#0b1c30]"
                    }`}
                  >
                    Chờ KL{" "}
                    <span className="ml-0.5 px-1 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[9.5px] font-mono">
                      {pendingCount}
                    </span>
                  </button>
                </div>

                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-[#6d7a77] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm Mã BN, họ tên, CCCD..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg bg-[#eff4ff] text-[11px] text-[#0b1c30] placeholder:text-[#6d7a77] focus:outline-none focus:bg-white border border-transparent focus:border-[#00685f]"
                  />
                </div>
              </div>

              {/* Collapsible New Encounter Form */}
              {showNewForm && (
                <form
                  onSubmit={handleCreateExam}
                  className="bg-white rounded-xl shadow-md p-2.5 flex flex-col gap-2 shrink-0 border border-[#00685f]/30 text-[11px]"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#e5eeff]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#00685f] text-white font-mono text-[9.5px] font-semibold">
                        KHỞI TẠO
                      </span>
                      <span className="font-bold text-[#00685f]">
                        Lượt khám lâm sàng mới
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="text-[#6d7a77] hover:text-[#ba1a1a]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9.5px] text-[#6d7a77] block mb-0.5">
                        Mã BN *
                      </label>
                      <input
                        list="clinical-patient-list"
                        value={newExam.maBN}
                        onChange={(e) =>
                          setNewExam((p) => ({ ...p, maBN: e.target.value }))
                        }
                        placeholder="VD: BN001"
                        className="w-full px-2 py-1 rounded bg-[#eff4ff] border border-[#bcc9c6]/40 font-mono"
                        required
                      />
                      <datalist id="clinical-patient-list">
                        {patients.map((pt) => (
                          <option key={pt.MaBN} value={pt.MaBN}>
                            {pt.HoTen}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[9.5px] text-[#6d7a77] block mb-0.5">
                        Phòng khám *
                      </label>
                      <select
                        value={newExam.maPhongKham}
                        onChange={(e) =>
                          setNewExam((p) => ({
                            ...p,
                            maPhongKham: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 rounded bg-[#eff4ff] border border-[#bcc9c6]/40"
                      >
                        {rooms.length > 0 ? (
                          rooms.map((r) => (
                            <option key={r.MaPhong} value={r.MaPhong}>
                              {r.MaPhong} - {r.SoPhong}
                            </option>
                          ))
                        ) : (
                          <option value="P01">P01 - Phòng Khám</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] text-[#6d7a77] block mb-0.5">
                      Bác sĩ phụ trách *
                    </label>
                    <select
                      value={newExam.maBS}
                      onChange={(e) =>
                        setNewExam((p) => ({ ...p, maBS: e.target.value }))
                      }
                      className="w-full px-2 py-1 rounded bg-[#eff4ff] border border-[#bcc9c6]/40"
                      required
                    >
                      {doctors.map((d) => (
                        <option key={d.MaNV} value={d.MaNV}>
                          {d.MaNV} - {d.nhanVien?.HoTen || "Bác sĩ"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="bg-[#eff4ff] p-1 rounded text-center">
                      <span className="text-[9px] text-[#6d7a77] block">HA</span>
                      <input
                        type="text"
                        value={newExam.huyetAp}
                        onChange={(e) =>
                          setNewExam((p) => ({ ...p, huyetAp: e.target.value }))
                        }
                        className="w-full text-center font-bold bg-transparent font-mono focus:outline-none"
                      />
                    </div>
                    <div className="bg-[#eff4ff] p-1 rounded text-center">
                      <span className="text-[9px] text-[#6d7a77] block">
                        Nhiệt độ
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={newExam.nhietDo}
                        onChange={(e) =>
                          setNewExam((p) => ({
                            ...p,
                            nhietDo: Number(e.target.value),
                          }))
                        }
                        className="w-full text-center font-bold text-[#ba1a1a] bg-transparent font-mono focus:outline-none"
                      />
                    </div>
                    <div className="bg-[#eff4ff] p-1 rounded text-center">
                      <span className="text-[9px] text-[#6d7a77] block">
                        Mạch
                      </span>
                      <input
                        type="number"
                        value={newExam.mach}
                        onChange={(e) =>
                          setNewExam((p) => ({
                            ...p,
                            mach: Number(e.target.value),
                          }))
                        }
                        className="w-full text-center font-bold bg-transparent font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newExam.trieuChung}
                    onChange={(e) =>
                      setNewExam((p) => ({ ...p, trieuChung: e.target.value }))
                    }
                    placeholder="Triệu chứng lâm sàng..."
                    className="w-full px-2 py-1 rounded bg-[#eff4ff] border border-[#bcc9c6]/40 resize-none focus:outline-none"
                    required
                  />

                  <input
                    type="text"
                    value={newExam.chanDoanSoBo}
                    onChange={(e) =>
                      setNewExam((p) => ({
                        ...p,
                        chanDoanSoBo: e.target.value,
                      }))
                    }
                    placeholder="Chẩn đoán sơ bộ..."
                    className="w-full px-2 py-1 rounded bg-[#eff4ff] border border-[#bcc9c6]/40 focus:outline-none"
                  />

                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="h-9 px-3.5 rounded-lg bg-[#e5eeff] text-[#3d4947] text-[12px] font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-9 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitting ? "Đang lưu..." : "Lưu lượt khám"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Scrollable Queue List */}
              <div className="flex-1 bg-white rounded-xl shadow-xs p-2.5 flex flex-col min-h-0 border border-[#bcc9c6]/30 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 shrink-0">
                  <span className="uppercase tracking-wider text-[#6d7a77] text-[10px] font-semibold">
                    Hàng đợi khám hôm nay
                  </span>
                  <span className="font-mono text-[#6d7a77] text-[10px]">
                    {filteredQueue.length} lượt
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0">
                  {loading && examinations.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6d7a77]">
                      Đang tải hàng đợi khám...
                    </div>
                  ) : filteredQueue.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6d7a77]">
                      Không có lượt khám phù hợp.
                    </div>
                  ) : (
                    filteredQueue.map((exam) => {
                      const isSelected =
                        selectedExam?.MaLuotKham === exam.MaLuotKham;
                      const isHospitalize =
                        exam.HuongXuTri === HuongXuTriEnum.NHAP_VIEN;
                      const isTransfer =
                        exam.HuongXuTri === HuongXuTriEnum.CHUYEN_VIEN;

                      return (
                        <button
                          key={exam.MaLuotKham}
                          type="button"
                          onClick={() => void selectExamination(exam)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#eff4ff] border-l-4 border-[#00685f] shadow-xs"
                              : "bg-white hover:bg-[#eff4ff]/60 border border-[#e5eeff]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono font-bold text-[11px] ${
                                  isSelected
                                    ? "text-[#00685f]"
                                    : "text-[#3d4947]"
                                }`}
                              >
                                {exam.MaLuotKham}
                              </span>
                              <span className="text-[10px] font-mono text-[#6d7a77]">
                                {formatTime(exam.ThoiGianKham)}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold ${
                                isHospitalize
                                  ? "bg-[#ffdad6] text-[#93000a]"
                                  : isTransfer
                                    ? "bg-[#cce5ff] text-[#001d31]"
                                    : "bg-[#89f5e7] text-[#005049]"
                              }`}
                            >
                              {HUONG_XU_TRI_LABELS[exam.HuongXuTri] ||
                                exam.HuongXuTri}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-col">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#0b1c30] text-[12.5px] font-bold truncate">
                                {exam.benhNhan?.HoTen || exam.MaBN}
                              </span>
                              <span className="font-mono text-[#006398] font-semibold text-[10.5px] shrink-0">
                                #{exam.MaBN}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10.5px] text-[#3d4947] mt-0.5">
                              <span>{exam.MaPhongKham}</span>
                              <span>•</span>
                              <span className="text-[#006860] font-medium">
                                {exam.benhNhan?.SoBHYT ? "BHYT" : "Viện phí"}
                              </span>
                              <span>•</span>
                              <span>
                                {exam.benhNhan?.GioiTinh || "—"}
                              </span>
                            </div>

                            <div className="mt-1.5 bg-white/90 rounded px-1.5 py-0.5 text-[10.5px] text-[#3d4947] flex items-center justify-between border border-[#e5eeff]">
                              <span className="truncate">
                                <strong className="text-[#0b1c30]">CĐ:</strong>{" "}
                                {exam.ChanDoanXacDinh ||
                                  exam.ChanDoanSoBo ||
                                  exam.TrieuChung}
                              </span>
                              {isSelected && (
                                <ChevronRight className="w-3.5 h-3.5 text-[#00685f] shrink-0" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Selected Patient + 3-Tab Clinical Workspace */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
              {!selectedExam ? (
                <div className="flex-1 bg-white rounded-xl border border-[#bcc9c6]/30 flex flex-col items-center justify-center p-10 text-center">
                  <Stethoscope className="w-10 h-10 text-[#6d7a77] mb-3" />
                  <h3 className="text-sm font-bold text-[#0b1c30]">
                    Chưa chọn lượt khám
                  </h3>
                  <p className="text-xs text-[#3d4947] mt-1">
                    Chọn một bệnh nhân từ danh sách bên trái hoặc bấm &ldquo;+
                    Mở Lượt Mới&rdquo; để bắt đầu.
                  </p>
                </div>
              ) : (
                <>
                  {/* Patient Header + 4 Vitals */}
                  <div className="bg-white rounded-xl shadow-xs px-3.5 py-2.5 shrink-0 border border-[#bcc9c6]/30 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-[#cce5ff] flex items-center justify-center text-[#00476e] font-bold text-sm">
                            {getInitials(
                              selectedExam.benhNhan?.HoTen || selectedExam.MaBN
                            )}
                          </div>
                          {selectedExam.benhNhan?.NhomMau && (
                            <span className="absolute -bottom-1 -right-1 px-1 bg-[#ba1a1a] text-white rounded font-mono text-[9px] font-bold leading-tight">
                              {selectedExam.benhNhan.NhomMau}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-[#0b1c30] text-[15px] font-bold uppercase truncate">
                              {selectedExam.benhNhan?.HoTen ||
                                `BỆNH NHÂN ${selectedExam.MaBN}`}
                            </h1>
                            <span className="font-mono bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#3d4947] text-[10px] font-semibold">
                              #{selectedExam.MaBN}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#cce5ff] text-[#001d31] text-[10px] font-semibold">
                              {selectedExam.benhNhan?.SoBHYT
                                ? `BHYT: ${selectedExam.benhNhan.SoBHYT}`
                                : "Không BHYT"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-[#3d4947]">
                            <span>
                              {selectedExam.benhNhan?.GioiTinh || "—"} •{" "}
                              {formatDate(selectedExam.benhNhan?.NgaySinh)}
                            </span>
                            <span>•</span>
                            <span>
                              Phòng:{" "}
                              <strong className="font-mono">
                                {selectedExam.MaPhongKham}
                              </strong>
                            </span>
                            <span>•</span>
                            <span className="text-[#6d7a77]">
                              Tiếp nhận: {formatTime(selectedExam.ThoiGianKham)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {detailLoading && (
                          <span className="text-[10.5px] text-[#6d7a77]">
                            Đang đồng bộ...
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                            selectedExam.ChanDoanXacDinh
                              ? "bg-[#89f5e7] text-[#005049]"
                              : "bg-[#ffdad6] text-[#93000a]"
                          }`}
                        >
                          {selectedExam.ChanDoanXacDinh
                            ? "Đã kết luận"
                            : "Đang chờ kết luận"}
                        </span>
                      </div>
                    </div>

                    {/* 4 Compact Vitals */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-[#e5eeff]">
                      <div className="bg-[#eff4ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#6d7a77] font-semibold uppercase flex items-center gap-1">
                            <HeartPulse className="w-3 h-3 text-[#00685f]" />
                            HUYẾT ÁP
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[#00685f]">
                            {selectedExam.HuyetAp || "—"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6d7a77]">mmHg</span>
                      </div>

                      <div className="bg-[#eff4ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#6d7a77] font-semibold uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3 text-[#006860]" />
                            MẠCH
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[#006860]">
                            {selectedExam.Mach ?? "—"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6d7a77]">ck/p</span>
                      </div>

                      <div className="bg-[#eff4ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#6d7a77] font-semibold uppercase flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-[#ba1a1a]" />
                            NHIỆT ĐỘ
                          </span>
                          <span className="font-mono text-[13px] font-bold text-[#ba1a1a]">
                            {selectedExam.NhietDo ?? "—"}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#ba1a1a] font-medium">
                          °C
                        </span>
                      </div>

                      <div className="bg-[#eff4ff] px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] text-[#6d7a77] font-semibold uppercase">
                            XỬ TRÍ
                          </span>
                          <span className="text-[12px] font-bold text-[#006398] truncate">
                            {HUONG_XU_TRI_LABELS[selectedExam.HuongXuTri] ||
                              selectedExam.HuongXuTri}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-[#006860] font-semibold shrink-0">
                          {selectedExam.MaLuotKham}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Tab Panel */}
                  <div className="flex-1 bg-white rounded-xl shadow-xs p-3 flex flex-col min-h-0 border border-[#bcc9c6]/30 overflow-hidden">
                    {/* Pill Tab Switcher */}
                    <div className="flex items-center justify-between gap-2 pb-2 shrink-0 border-b border-[#e5eeff]">
                      <div className="flex items-center gap-1 bg-[#e5eeff] p-0.5 rounded-lg overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setActiveTab("diagnosis")}
                          className={`px-3 py-1 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            activeTab === "diagnosis"
                              ? "bg-[#00685f] text-white shadow-xs"
                              : "text-[#3d4947] hover:text-[#0b1c30]"
                          }`}
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>1. Chẩn Đoán &amp; Xử Trí</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("prescription")}
                          className={`px-3 py-1 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            activeTab === "prescription"
                              ? "bg-[#00685f] text-white shadow-xs"
                              : "text-[#3d4947] hover:text-[#0b1c30]"
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5" />
                          <span>
                            2. Kê Đơn Thuốc (
                            {existingDon ? existingCt.length : draftItems.length}
                            )
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("cls")}
                          className={`px-3 py-1 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                            activeTab === "cls"
                              ? "bg-[#00685f] text-white shadow-xs"
                              : "text-[#3d4947] hover:text-[#0b1c30]"
                          }`}
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>
                            3. Cận Lâm Sàng ({clsDoneCount}/{existingCls.length})
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-y-auto min-h-0 py-2.5 pr-1">
                      {/* TAB 1: DIAGNOSIS */}
                      {activeTab === "diagnosis" && (
                        <form
                          id="clinical-diagnosis-form"
                          onSubmit={handleUpdateDiagnosis}
                          className="flex flex-col gap-2.5 text-xs"
                        >
                          <div className="bg-[#eff4ff] p-2.5 rounded-lg flex flex-col gap-1.5">
                            <span className="uppercase tracking-wider text-[#6d7a77] text-[10px] font-semibold">
                              Ghi nhận thăm khám lâm sàng (
                              {formatTime(selectedExam.ThoiGianKham)})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11.5px]">
                              <div className="p-2 rounded bg-white">
                                <span className="text-[#6d7a77] block text-[10px] font-semibold mb-0.5">
                                  Triệu chứng cơ năng:
                                </span>
                                <p className="text-[#0b1c30] leading-snug">
                                  {selectedExam.TrieuChung || "Chưa ghi nhận"}
                                </p>
                              </div>
                              <div className="p-2 rounded bg-white">
                                <span className="text-[#6d7a77] block text-[10px] font-semibold mb-0.5">
                                  Chẩn đoán sơ bộ ban đầu:
                                </span>
                                <p className="text-[#0b1c30] leading-snug">
                                  {selectedExam.ChanDoanSoBo || "Chưa ghi nhận"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[#6d7a77] font-semibold text-[11px]">
                              Chẩn đoán xác định (Mã ICD-10 &amp; Tên bệnh){" "}
                              <span className="text-[#ba1a1a]">*</span>
                            </label>
                            <input
                              type="text"
                              value={diagForm.chanDoanXacDinh}
                              onChange={(e) =>
                                setDiagForm((p) => ({
                                  ...p,
                                  chanDoanXacDinh: e.target.value,
                                }))
                              }
                              placeholder="VD: J02.9 - Viêm họng cấp tính"
                              className="w-full h-9 px-3 rounded-lg bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30] border border-transparent focus:border-[#00685f] focus:bg-white focus:outline-none"
                              required
                            />
                          </div>

                          {/* 3 Clickable Treatment Cards */}
                          <div className="flex flex-col gap-1.5">
                            <label className="uppercase tracking-wider text-[#6d7a77] text-[10px] font-semibold">
                              Hướng xử trí lâm sàng xác định
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {HUONG_XU_TRI_OPTIONS.map((opt) => {
                                const selected =
                                  diagForm.huongXuTri === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      setDiagForm((p) => ({
                                        ...p,
                                        huongXuTri: opt.value,
                                      }))
                                    }
                                    className={`p-2.5 rounded-lg flex items-center gap-2 text-left transition-all ${
                                      selected
                                        ? "bg-[#eff4ff] border border-[#00685f]/50 shadow-xs"
                                        : "bg-white border border-[#e5eeff] hover:bg-[#eff4ff]/50 opacity-80"
                                    }`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                        selected
                                          ? "bg-[#00685f] text-white"
                                          : "bg-[#d3e4fe]"
                                      }`}
                                    >
                                      {selected && (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-[#0b1c30] text-[12px] font-bold block leading-tight">
                                        {opt.title}
                                      </span>
                                      <span className="text-[10px] text-[#6d7a77] block">
                                        {opt.desc}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[#6d7a77] font-semibold text-[10.5px]">
                                Ngày hẹn tái khám
                              </label>
                              <div className="relative">
                                <Calendar className="w-3.5 h-3.5 text-[#6d7a77] absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="date"
                                  value={diagForm.ngayTaiKham}
                                  onChange={(e) =>
                                    setDiagForm((p) => ({
                                      ...p,
                                      ngayTaiKham: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-[#eff4ff] text-[11.5px] font-medium text-[#0b1c30] focus:outline-none focus:bg-white border border-transparent focus:border-[#00685f]"
                                />
                              </div>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* TAB 2: PRESCRIPTION */}
                      {activeTab === "prescription" && (
                        <div className="flex flex-col gap-2.5 text-[11.5px]">
                          {existingDon ? (
                            <>
                              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#89f5e7]/35 border border-[#00685f]/25">
                                <div>
                                  <div className="font-bold text-[#005049]">
                                    Đơn thuốc đã phát hành:{" "}
                                    <span className="font-mono">
                                      {existingDon.MaDon}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] text-[#00685f]">
                                    Trạng thái:{" "}
                                    <strong>
                                      {existingDon.TrangThaiPhatThuoc}
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-x-auto rounded-lg border border-[#e5eeff]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-[#eff4ff] text-[#6d7a77] uppercase text-[9.5px]">
                                    <tr>
                                      <th className="py-1.5 px-2">Tên Thuốc</th>
                                      <th className="py-1.5 px-2 text-center">
                                        SL
                                      </th>
                                      <th className="py-1.5 px-2">
                                        Liều &amp; Cách dùng
                                      </th>
                                      <th className="py-1.5 px-2 text-right">
                                        Đơn giá
                                      </th>
                                      <th className="py-1.5 px-2 text-right">
                                        Thành tiền
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#e5eeff]">
                                    {existingCt.map((ct) => {
                                      const thuocObj = ct.thuoc || ct.Thuoc;
                                      const price = Number(ct.DonGiaBan || 0);
                                      return (
                                        <tr
                                          key={`${ct.MaDon}-${ct.MaThuoc}`}
                                          className="hover:bg-[#eff4ff]/40"
                                        >
                                          <td className="py-1.5 px-2 font-semibold text-[#0b1c30]">
                                            {thuocObj?.TenThuoc || ct.MaThuoc}
                                          </td>
                                          <td className="py-1.5 px-2 text-center font-bold font-mono">
                                            {ct.SoLuong}
                                          </td>
                                          <td className="py-1.5 px-2 text-[#3d4947]">
                                            {ct.LieuDung || "—"} •{" "}
                                            {ct.CachDung || "—"} (
                                            {ct.SoNgayUong} ngày)
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono text-[#6d7a77]">
                                            {formatVnd(price)}
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono font-bold text-[#0b1c30]">
                                            {formatVnd(price * ct.SoLuong)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <form
                              onSubmit={handleSubmitPrescription}
                              className="flex flex-col gap-2.5"
                            >
                              <div className="p-2.5 rounded-lg bg-[#eff4ff] grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                <div className="md:col-span-5">
                                  <label className="text-[10px] text-[#6d7a77] block mb-0.5">
                                    Thuốc trong kho
                                  </label>
                                  <select
                                    value={medInput.maThuoc}
                                    onChange={(e) =>
                                      setMedInput((p) => ({
                                        ...p,
                                        maThuoc: e.target.value,
                                      }))
                                    }
                                    className="w-full h-8 px-2 rounded bg-white border border-[#bcc9c6]/40 text-[11px]"
                                  >
                                    {medicines.map((m) => (
                                      <option key={m.MaThuoc} value={m.MaThuoc}>
                                        {m.TenThuoc} (Tồn: {m.SoLuongTon} •{" "}
                                        {formatVnd(m.DonGiaHienHanh)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] text-[#6d7a77] block mb-0.5">
                                    SL
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={medInput.soLuong}
                                    onChange={(e) =>
                                      setMedInput((p) => ({
                                        ...p,
                                        soLuong: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full h-8 px-2 rounded bg-white border border-[#bcc9c6]/40 font-mono"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="text-[10px] text-[#6d7a77] block mb-0.5">
                                    Số ngày
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={medInput.soNgayUong}
                                    onChange={(e) =>
                                      setMedInput((p) => ({
                                        ...p,
                                        soNgayUong: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full h-8 px-2 rounded bg-white border border-[#bcc9c6]/40 font-mono"
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <button
                                    type="button"
                                    onClick={handleAddMedicineRow}
                                    className="w-full h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[12px] shadow-xs"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Thêm Thuốc</span>
                                  </button>
                                </div>
                                <div className="md:col-span-6">
                                  <input
                                    type="text"
                                    value={medInput.lieuDung}
                                    onChange={(e) =>
                                      setMedInput((p) => ({
                                        ...p,
                                        lieuDung: e.target.value,
                                      }))
                                    }
                                    placeholder="Liều dùng..."
                                    className="w-full h-7.5 px-2 rounded bg-white border border-[#bcc9c6]/40 text-[11px]"
                                  />
                                </div>
                                <div className="md:col-span-6">
                                  <input
                                    type="text"
                                    value={medInput.cachDung}
                                    onChange={(e) =>
                                      setMedInput((p) => ({
                                        ...p,
                                        cachDung: e.target.value,
                                      }))
                                    }
                                    placeholder="Cách dùng..."
                                    className="w-full h-7.5 px-2 rounded bg-white border border-[#bcc9c6]/40 text-[11px]"
                                  />
                                </div>
                              </div>

                              <div className="overflow-x-auto rounded-lg border border-[#e5eeff]">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-[#eff4ff] text-[#6d7a77] uppercase text-[9.5px]">
                                    <tr>
                                      <th className="py-1.5 px-2">Thuốc</th>
                                      <th className="py-1.5 px-2 text-center">
                                        SL
                                      </th>
                                      <th className="py-1.5 px-2">Cách dùng</th>
                                      <th className="py-1.5 px-2 text-right">
                                        Thành tiền
                                      </th>
                                      <th className="py-1.5 px-1 text-center">
                                        Xóa
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#e5eeff]">
                                    {draftItems.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="py-4 text-center text-[#6d7a77]"
                                        >
                                          Chưa có thuốc trong đơn nháp.
                                        </td>
                                      </tr>
                                    ) : (
                                      draftItems.map((item) => (
                                        <tr key={item.maThuoc}>
                                          <td className="py-1.5 px-2 font-semibold text-[#0b1c30]">
                                            {item.tenThuoc}
                                          </td>
                                          <td className="py-1.5 px-2 text-center font-mono font-bold">
                                            {item.soLuong} {item.donViTinh}
                                          </td>
                                          <td className="py-1.5 px-2 text-[#3d4947]">
                                            {item.lieuDung} • {item.cachDung} (
                                            {item.soNgayUong} ngày)
                                          </td>
                                          <td className="py-1.5 px-2 text-right font-mono font-bold">
                                            {formatVnd(
                                              item.donGia * item.soLuong
                                            )}
                                          </td>
                                          <td className="py-1.5 px-1 text-center">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveDraftItem(
                                                  item.maThuoc
                                                )
                                              }
                                              className="text-[#6d7a77] hover:text-[#ba1a1a]"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                <div className="md:col-span-7 bg-[#eff4ff] p-2 rounded-lg">
                                  <span className="font-semibold text-[#6d7a77] block mb-0.5 text-[10px]">
                                    Lời dặn BS:
                                  </span>
                                  <textarea
                                    rows={2}
                                    value={loiDanBacSi}
                                    onChange={(e) =>
                                      setLoiDanBacSi(e.target.value)
                                    }
                                    className="w-full bg-white rounded p-1.5 text-[11px] border border-[#bcc9c6]/40 resize-none focus:outline-none"
                                  />
                                </div>
                                <div className="md:col-span-5 bg-white p-2 rounded-lg border border-[#e5eeff] flex flex-col justify-between">
                                  <div className="flex justify-between font-bold text-[#00685f] text-[12px]">
                                    <span>Tổng dự kiến:</span>
                                    <span className="font-mono">
                                      {formatVnd(draftTotal)}
                                    </span>
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={
                                      submitting || draftItems.length === 0
                                    }
                                    className="mt-2 h-10 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-bold text-[13px] shadow-sm disabled:opacity-50"
                                  >
                                    {submitting ? "Đang gửi..." : "Gửi Dược"}
                                  </button>
                                </div>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      {/* TAB 3: CLS */}
                      {activeTab === "cls" && (
                        <div className="flex flex-col gap-2.5 text-[11px]">
                          <form
                            onSubmit={handleAssignCls}
                            className="p-2.5 rounded-lg bg-[#eff4ff] grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
                          >
                            <div className="md:col-span-7">
                              <label className="text-[10px] text-[#6d7a77] block mb-0.5">
                                Chọn dịch vụ Cận lâm sàng
                              </label>
                              <select
                                value={clsInput.maDV}
                                onChange={(e) =>
                                  setClsInput((p) => ({
                                    ...p,
                                    maDV: e.target.value,
                                  }))
                                }
                                className="w-full h-8 px-2 rounded bg-white border border-[#bcc9c6]/40"
                              >
                                {services.map((s) => (
                                  <option key={s.MaDV} value={s.MaDV}>
                                    {s.TenDV} ({s.LoaiDichVu}) •{" "}
                                    {formatVnd(s.DonGiaHienHanh)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[10px] text-[#6d7a77] block mb-0.5">
                                SL
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={clsInput.soLuong}
                                onChange={(e) =>
                                  setClsInput((p) => ({
                                    ...p,
                                    soLuong: Number(e.target.value),
                                  }))
                                }
                                className="w-full h-8 px-2 rounded bg-white border border-[#bcc9c6]/40 font-mono"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[12px] shadow-xs disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                                <span>+ Thêm Chỉ Định</span>
                              </button>
                            </div>
                          </form>

                          <div className="flex flex-col gap-2">
                            {existingCls.length === 0 ? (
                              <div className="p-5 text-center text-[#6d7a77] bg-[#eff4ff]/50 rounded-lg">
                                Chưa có chỉ định cận lâm sàng nào cho lượt khám
                                này.
                              </div>
                            ) : (
                              existingCls.map((cls, idx) => (
                                <div
                                  key={`${cls.MaLuotKham}-${cls.MaDV}-${idx}`}
                                  className="bg-[#eff4ff] p-2.5 rounded-lg flex flex-col gap-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="px-1.5 py-0.5 rounded bg-[#d3e4fe] text-[9px] font-semibold">
                                        {cls.dichVu?.LoaiDichVu || "CLS"}
                                      </span>
                                      <span className="font-bold text-[#0b1c30] truncate">
                                        {cls.dichVu?.TenDV || cls.MaDV}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                        cls.KetQuaCLS
                                          ? "bg-[#89f5e7] text-[#005049]"
                                          : "bg-[#ffdad6] text-[#93000a]"
                                      }`}
                                    >
                                      {cls.KetQuaCLS ? "Đã có KQ" : "Chờ kết quả"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10.5px] text-[#3d4947]">
                                    <span>
                                      SL: {cls.SoLuong} • Đơn giá:{" "}
                                      <strong className="font-mono">
                                        {formatVnd(cls.DonGiaDV)}
                                      </strong>
                                    </span>
                                    <span>
                                      {cls.KetQuaCLS
                                        ? `KQ: ${cls.KetQuaCLS}`
                                        : formatTime(cls.ThoiGianChiDinh)}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Digital Signature & Save Action Bar */}
                    <div className="pt-2 border-t border-[#e5eeff] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6d7a77]">
                        <span className="w-2 h-2 rounded-full bg-[#00685f] shrink-0" />
                        <span>
                          Chữ ký số BS:{" "}
                          <strong className="text-[#0b1c30]">
                            {user?.hoTen || user?.maNV}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleUpdateDiagnosis()}
                          disabled={submitting}
                          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-bold shadow-sm transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          <span>
                            {submitting ? "Đang lưu..." : "Lưu Kết Luận"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
