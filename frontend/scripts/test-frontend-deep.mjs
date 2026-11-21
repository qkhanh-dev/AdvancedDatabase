// ============================================================================
// HỆ THỐNG QUẢN LÝ BỆNH VIỆN (QLBV) v2.0 - FRONTEND DEEP TEST SUITE
// Kiểm thử toàn diện: (1) Static v2 compliance, (2) Live Next.js SSR routes (:3000),
// (3) Live API v2 integration & BR-V2-01..13 (:3001)
// ============================================================================

import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const FE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  validateStatus: () => true,
});

const feClient = axios.create({
  baseURL: FE_URL,
  timeout: 12000,
  validateStatus: () => true,
});

const results = [];

function record(group, name, passed, details = "") {
  results.push({ group, name, passed, details });
  console.log(`[${passed ? "PASS" : "FAIL"}] [${group}] ${name}${details ? ` (${details})` : ""}`);
}

function collectSourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function runTests() {
  const srcRoot = path.resolve(process.cwd(), "src");
  const files = collectSourceFiles(srcRoot);
  const allCode = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");

  // --------------------------------------------------------------------------
  // 1. KIỂM TRA TĨNH ĐỒNG BỘ v2 TRÊN TOÀN BỘ frontend/src/
  // --------------------------------------------------------------------------
  const forbiddenV1Tokens = [
    "NV_HANH_CHINH",
    "DUOC_SI",
    "QUAN_TRI",
    "DANG_SU_DUNG",
    "SoLuongTon",
    "LICH_TRUC",
    "BN_NGOAI_TRU",
    "/patients/reception",
    "/services/assign",
    "/services/result",
    "/webhook/vietqr",
    "/duty-schedules",
    "/prescriptions/",
  ];

  // Filter /prescriptions/:id/dispense specifically rather than valid /prescriptions
  const badV1 = forbiddenV1Tokens.filter((tok) => {
    if (tok === "/prescriptions/") return allCode.includes("/dispense");
    return allCode.includes(tok);
  });

  record(
    "Static-v2",
    "Không còn token/endpoint v1 cũ trong frontend/src",
    badV1.length === 0,
    badV1.length ? `Tìm thấy: ${badV1.join(", ")}` : `${files.length} files sạch v1`,
  );

  const requiredV2Tokens = [
    "KY_THUAT_VIEN",
    "TIEP_NHAN",
    "SAN_SANG",
    "NGUNG_SU_DUNG",
    "THE_BHYT",
    "PHIEU_XET_NGHIEM",
    "VIEN_PHI",
    "DOT_NOI_TRU",
    "PHAN_GIUONG",
    "SoNamCongTac",
    "Tuoi",
    "TongTienThuoc",
    "TongTienDichVu",
    "TruBHYT",
    "ThucThu",
    "ruleCode",
    "useForm",
    "zodResolver",
    "AuthGuard",
  ];
  const missingV2 = requiredV2Tokens.filter((tok) => !allCode.includes(tok));
  record(
    "Static-v2",
    "Đầy đủ định danh, derived fields, Zod/RHF và AuthGuard v2",
    missingV2.length === 0,
    missingV2.length ? `Thiếu: ${missingV2.join(", ")}` : "19/19 kiểm tra đạt",
  );

  // --------------------------------------------------------------------------
  // 2. LIVE NEXT.JS ROUTES CHECK (PORT 3000)
  // --------------------------------------------------------------------------
  const v2Routes = [
    "/",
    "/login",
    "/reception",
    "/clinical",
    "/laboratory",
    "/inpatient",
    "/cashier",
    "/admin",
  ];

  for (const route of v2Routes) {
    const res = await feClient.get(route);
    record("Live-FE", `GET ${FE_URL}${route} trả HTTP 200`, res.status === 200, `Status: ${res.status}`);
  }

  const pharmacyRes = await feClient.get("/pharmacy");
  record(
    "Live-FE",
    "Route /pharmacy v1 đã bị loại bỏ (404)",
    pharmacyRes.status === 404,
    `Status: ${pharmacyRes.status}`,
  );

  // --------------------------------------------------------------------------
  // 3. LIVE API v2 FLOW CHECK (6 ROLES + BR-V2-01..13)
  // --------------------------------------------------------------------------
  const rolesToLogin = [
    ["ADMIN01", "ADMIN"],
    ["BS01", "BAC_SI"],
    ["DD01", "DIEU_DUONG"],
    ["KTV01", "KY_THUAT_VIEN"],
    ["TT01", "TIEP_NHAN"],
    ["NV_TN_01", "THU_NGAN"],
  ];

  const tokens = {};
  for (const [username, expectedRole] of rolesToLogin) {
    const res = await apiClient.post("/auth/login", { username, password: "123456" });
    const ok =
      res.status === 200 &&
      res.data?.user?.role === expectedRole &&
      typeof res.data?.user?.hoTen === "string" &&
      typeof res.data?.user?.HoTen === "string" &&
      typeof res.data?.user?.SoNamCongTac === "number";
    if (ok) tokens[expectedRole] = res.data.access_token;
    record("API-Auth", `Login ${username} (${expectedRole}) kèm hoTen & SoNamCongTac`, ok);
  }

  const adminAuth = { headers: { Authorization: `Bearer ${tokens.ADMIN}` } };
  const recAuth = { headers: { Authorization: `Bearer ${tokens.TIEP_NHAN}` } };
  const docAuth = { headers: { Authorization: `Bearer ${tokens.BAC_SI}` } };
  const ktvAuth = { headers: { Authorization: `Bearer ${tokens.KY_THUAT_VIEN}` } };
  const cashAuth = { headers: { Authorization: `Bearer ${tokens.THU_NGAN}` } };
  const nurseAuth = { headers: { Authorization: `Bearer ${tokens.DIEU_DUONG}` } };

  const suffix = Date.now().toString().slice(-5);
  const maBN = `FEBN_${suffix}`;
  const maCard = `FEBHYT_${suffix}`;
  const maLK = `FELK_${suffix}`;
  const maDT = `FEDT_${suffix}`;
  const maPXN = `FEPXN_${suffix}`;
  const maHD = `FEHD_${suffix}`;
  const maDot = `FEDOT_${suffix}`;

  // Create patient + derived Tuoi
  const ptRes = await apiClient.post(
    "/patients",
    {
      maBN,
      hoTen: "Nguyễn Văn Frontend V2",
      ngaySinh: "1996-05-12",
      gioiTinh: "NAM",
      cccd: `079096${suffix}0`,
      sdt: `0909${suffix}0`,
      diaChiDuong: "273 An Dương Vương",
      diaChiPhuong: "Phường 3",
      diaChiQuan: "Quận 5",
      nhomMau: "O",
    },
    recAuth,
  );
  record(
    "API-Reception",
    "Tạo BENH_NHAN v2 tách địa chỉ + trả Tuoi dẫn xuất",
    ptRes.status === 201 && typeof ptRes.data?.Tuoi === "number",
    `MaBN=${ptRes.data?.MaBN}, Tuoi=${ptRes.data?.Tuoi}`,
  );

  // Add BHYT card [0..1]
  const cardRes = await apiClient.post(
    `/patients/${maBN}/insurance-cards`,
    {
      maTheBHYT: maCard,
      mucHuong: 0.8,
      ngayBatDau: "2026-01-01",
      ngayHetHan: "2026-12-31",
    },
    recAuth,
  );
  record("API-Reception", "Thêm THE_BHYT mức hưởng 0.8", cardRes.status === 201);

  // Open exam
  const examRes = await apiClient.post(
    "/examinations",
    {
      maLuotKham: maLK,
      maBN,
      maNV_BacSi: "BS01",
      ngayGioKham: "2026-11-15T09:00:00.000Z",
      lyDoKham: "Kiểm tra FE v2",
      trieuChung: "Sốt nhẹ",
      chanDoanSoBo: "Theo dõi",
    },
    recAuth,
  );
  record("API-Clinical", "Mở LUOT_KHAM", examRes.status === 201);

  // Create prescription (snapshot DonGiaKe & TongTienThuoc)
  const rxRes = await apiClient.post(
    "/prescriptions",
    {
      maDonThuoc: maDT,
      maLuotKham: maLK,
      loiDanCuaBacSi: "Uống đúng giờ",
      items: [{ maThuoc: "TH01", soLuong: 10, lieuDung: "2 viên/ngày" }],
    },
    docAuth,
  );
  record(
    "API-Clinical",
    "Kê DON_THUOC snapshot DonGiaKe & TongTienThuoc",
    rxRes.status === 201 && Number(rxRes.data?.TongTienThuoc) > 0,
  );

  // Lab 2-step workflow (BR-V2-07)
  const labCreateRes = await apiClient.post(
    "/lab-requests",
    { maPhieuXN: maPXN, maLuotKham: maLK, maLoaiXN: "XN01" },
    docAuth,
  );
  const labStartRes = await apiClient.patch(
    `/lab-requests/${maPXN}/start`,
    { ngayGioXN: "2026-11-15T09:15:00.000Z" },
    ktvAuth,
  );
  const labCompleteRes = await apiClient.patch(
    `/lab-requests/${maPXN}/complete`,
    {
      ngayGioXN: "2026-11-15T09:15:00.000Z",
      ngayGioTraKQ: "2026-11-15T09:45:00.000Z",
      ketQua: "WBC 7.2 G/L",
      danhGia: "Bình thường",
    },
    ktvAuth,
  );
  record(
    "API-Lab",
    "Quy trình 2 bước PHIEU_XET_NGHIEM (start -> complete) cho KY_THUAT_VIEN",
    labCreateRes.status === 201 && labStartRes.status === 200 && labCompleteRes.status === 200,
  );

  // Billing create + pay + lock check (BR-V2-08)
  const invRes = await apiClient.post(
    "/billing/invoices",
    {
      maHoaDon: maHD,
      maLuotKham: maLK,
      ngayLap: "2026-11-15",
      hinhThucThanhToan: "TIEN_MAT",
      maTheBHYT: maCard,
    },
    cashAuth,
  );
  const payRes = await apiClient.patch(
    `/billing/invoices/${maHD}/pay`,
    { hinhThucThanhToan: "CHUYEN_KHOAN" },
    cashAuth,
  );
  const lockedEdit = await apiClient.patch(
    `/prescriptions/${maDT}`,
    { loiDanCuaBacSi: "Sửa sau TT" },
    docAuth,
  );
  record(
    "API-Billing",
    "Lập VIEN_PHI, chốt DA_THANH_TOAN và khóa sửa đơn (409 BR-V2-08)",
    invRes.status === 201 &&
      payRes.status === 200 &&
      lockedEdit.status === 409 &&
      lockedEdit.data?.ruleCode === "BR-V2-08",
  );

  // Inpatient admission + bed map date + allocation + discharge (BR-V2-02, 03, 11, 12)
  const testInpatientDate = "2026-12-20";
  const testDischargeDate = "2026-12-21";
  const admitRes = await apiClient.post(
    "/inpatient/admissions",
    {
      maDotNT: maDot,
      maBN,
      ngayNhapVien: testInpatientDate,
      nguoiNhaLienHe: "Người nhà Test",
      tinhTrangNhapVien: "Theo dõi nội trú",
    },
    docAuth,
  );
  const bedMapRes = await apiClient.get(`/beds/map?date=${testInpatientDate}`, nurseAuth);
  const freeBed = (bedMapRes.data || []).find(
    (b) => b.TrangThai === "SAN_SANG" && !b.dangCoNguoiNam,
  );
  let allocOk = false;
  if (freeBed) {
    const allocRes = await apiClient.post(
      "/inpatient/bed-allocations",
      { maDotNT: maDot, maGiuong: freeBed.MaGiuong, tuNgay: testInpatientDate },
      nurseAuth,
    );
    allocOk = allocRes.status === 201;
  }
  const dischargeRes = await apiClient.patch(
    `/inpatient/admissions/${maDot}/discharge`,
    { ngayRaVien: testDischargeDate },
    docAuth,
  );
  record(
    "API-Inpatient",
    "Nhập viện, sơ đồ giường theo ngày, phân giường và xuất viện đóng phân giường",
    admitRes.status === 201 && allocOk && dischargeRes.status === 200,
  );

  // Dashboard report
  const dashRes = await apiClient.get("/reports/dashboard?date=2026-11-15", adminAuth);
  record(
    "API-Report",
    "GET /api/reports/dashboard?date=2026-11-15",
    dashRes.status === 200 && typeof dashRes.data?.congSuatGiuong?.tyLeLapDay === "number",
  );

  const failed = results.filter((r) => !r.passed);
  console.log(`\nTỔNG KẾT FRONTEND DEEP TEST v2: ${results.length - failed.length}/${results.length} PASS`);
  if (failed.length > 0) {
    console.error("DANH SÁCH FAIL:", failed);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test crash:", err);
  process.exit(1);
});
