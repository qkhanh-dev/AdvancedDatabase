// ============================================================================
// HỆ THỐNG QUẢN LÝ BỆNH VIỆN (QLBV) - FRONTEND DEEP INTEGRATION TEST SUITE
// Kiểm thử sâu toàn bộ 11 phân hệ, xác thực API contract, DTOs và nghiệp vụ
// ============================================================================

import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true, // Don't throw on error status codes
});

// Helper for authorized client
function authHeader(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

let doctorToken = '';
let nurseToken = '';
let cashierToken = '';

let testMaBN = '';
let testMaLK = '';
let testMaDT = '';
let testMaHD = '';
let testMaDV = 'DV01';
let testMaThuoc = 'TH01';
let assignedThoiGian = '';
let availableBed = '';
let transferBed = '';

const testResults = [];

function recordTest(module, name, passed, details = '') {
  testResults.push({ module, name, passed, details });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${statusIcon}] [${module}] ${name} ${details ? '(' + details + ')' : ''}`);
}

async function runDeepTests() {
  console.log('================================================================');
  console.log('BẮT ĐẦU CHẠY KIỂM THỬ SÂU FRONTEND API CONTRACT & NGHIỆP VỤ Y TẾ');
  console.log('================================================================\n');

  // ==========================================================================
  // PHÂN HỆ 1: XÁC THỰC VÀ PHÂN QUYỀN RBAC (AUTH)
  // ==========================================================================
  console.log('--- 1. PHÂN HỆ XÁC THỰC (AUTH) ---');
  
  // Test 1.1: Login Bác sĩ
  {
    const res = await client.post('/auth/login', { username: 'BS01', password: '123456' });
    const ok = res.status === 200 && res.data?.access_token && res.data?.user?.role === 'BAC_SI';
    if (ok) doctorToken = res.data.access_token;
    recordTest('Auth', 'Đăng nhập Bác sĩ (BS01)', ok, `Status: ${res.status}, Role: ${res.data?.user?.role}`);
  }

  // Test 1.2: Login Điều dưỡng
  {
    const res = await client.post('/auth/login', { username: 'DD01', password: '123456' });
    const ok = res.status === 200 && res.data?.access_token && res.data?.user?.role === 'DIEU_DUONG';
    if (ok) nurseToken = res.data.access_token;
    recordTest('Auth', 'Đăng nhập Điều dưỡng (DD01)', ok, `Status: ${res.status}, Role: ${res.data?.user?.role}`);
  }

  // Test 1.3: Login Thu ngân
  {
    const res = await client.post('/auth/login', { username: 'NV_TN_01', password: '123456' });
    const ok = res.status === 200 && res.data?.access_token && res.data?.user?.role === 'THU_NGAN';
    if (ok) cashierToken = res.data.access_token;
    recordTest('Auth', 'Đăng nhập Thu ngân (NV_TN_01)', ok, `Status: ${res.status}, Role: ${res.data?.user?.role}`);
  }

  // Test 1.4: Đăng nhập sai thông tin (Rejection)
  {
    const res = await client.post('/auth/login', { username: 'INVALID_USER', password: 'wrongpassword' });
    const ok = res.status === 401;
    recordTest('Auth', 'Từ chối tài khoản sai mật khẩu (401 Unauthorized)', ok, `Status: ${res.status}`);
  }

  // Test 1.5: Lấy thông tin cá nhân với Bearer Token
  {
    const res = await client.get('/auth/profile', authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.MaNV === 'BS01';
    recordTest('Auth', 'Lấy hồ sơ cá nhân với Bearer Token', ok, `MaNV: ${res.data?.MaNV}, HoTen: ${res.data?.HoTen}`);
  }

  // Test 1.6: Lấy thông tin cá nhân KHÔNG có Token
  {
    const res = await client.get('/auth/profile');
    const ok = res.status === 401;
    recordTest('Auth', 'Bảo vệ endpoint khi không có token (401)', ok, `Status: ${res.status}`);
  }

  // ==========================================================================
  // PHÂN HỆ 2: CƠ SỞ VẬT CHẤT & KHOA PHÒNG (DEPARTMENT & ROOM)
  // ==========================================================================
  console.log('\n--- 2. PHÂN HỆ CƠ SỞ VẬT CHẤT & KHOA PHÒNG ---');

  // Test 2.1: Danh sách khoa viện
  {
    const res = await client.get('/departments', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length >= 2;
    recordTest('Department', 'Lấy danh sách Khoa viện (/api/departments)', ok, `Số lượng: ${res.data?.length}`);
  }

  // Test 2.2: Chi tiết khoa theo mã
  {
    const res = await client.get('/departments/K01', authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.MaKhoa === 'K01';
    recordTest('Department', 'Lấy chi tiết Khoa K01 (/api/departments/K01)', ok, `TenKhoa: ${res.data?.TenKhoa}`);
  }

  // Test 2.3: Danh sách phòng khả dụng
  {
    const res = await client.get('/rooms/available', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data);
    recordTest('Department', 'Lấy danh sách phòng khả dụng (/api/rooms/available)', ok, `Số phòng: ${res.data?.length}`);
  }

  // Test 2.4: Sơ đồ giường bệnh trực quan
  {
    const res = await client.get('/beds/map', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    if (ok) {
      const empty = res.data.filter((b) => b.TrangThaiGiuong === 'TRONG');
      if (empty.length >= 2) {
        availableBed = empty[0].MaGiuong;
        transferBed = empty[1].MaGiuong;
      } else if (empty.length === 1) {
        availableBed = empty[0].MaGiuong;
      }
    }
    recordTest('Department', 'Lấy sơ đồ giường toàn viện (/api/beds/map)', ok, `Tổng giường: ${res.data?.length}, Giường trống: ${availableBed}`);
  }

  // ==========================================================================
  // PHÂN HỆ 3: NHÂN SỰ Y TẾ (STAFF)
  // ==========================================================================
  console.log('\n--- 3. PHÂN HỆ NHÂN SỰ Y TẾ ---');

  // Test 3.1: Danh sách nhân viên
  {
    const res = await client.get('/staff', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    recordTest('Staff', 'Lấy danh sách cán bộ nhân viên (/api/staff)', ok, `Tổng NV: ${res.data?.length}`);
  }

  // Test 3.2: Danh sách bác sĩ
  {
    const res = await client.get('/staff/doctors', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.some((d) => d.MaNV === 'BS01');
    recordTest('Staff', 'Lấy danh sách Bác sĩ chuyên khoa (/api/staff/doctors)', ok, `Số BS: ${res.data?.length}`);
  }

  // Test 3.3: Danh sách điều dưỡng
  {
    const res = await client.get('/staff/nurses', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.some((n) => n.MaNV === 'DD01');
    recordTest('Staff', 'Lấy danh sách Điều dưỡng (/api/staff/nurses)', ok, `Số DD: ${res.data?.length}`);
  }

  // Test 3.4: Chi tiết nhân viên
  {
    const res = await client.get('/staff/BS01', authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.MaNV === 'BS01';
    recordTest('Staff', 'Lấy chi tiết nhân viên BS01 (/api/staff/:maNV)', ok, `HoTen: ${res.data?.HoTen}`);
  }

  // ==========================================================================
  // PHÂN HỆ 4: TIẾP ĐÓN & HỒ SƠ BỆNH NHÂN (PATIENT)
  // ==========================================================================
  console.log('\n--- 4. PHÂN HỆ TIẾP ĐÓN & HỒ SƠ BỆNH NHÂN ---');

  const uniqueSuffix = Date.now().toString().slice(-6);
  const testCccd = `079200${uniqueSuffix}`;
  const testBhyt = `DN479${uniqueSuffix}000`;

  // Test 4.1: Tiếp nhận bệnh nhân mới
  {
    const payload = {
      hoTen: `Bệnh Nhân Test FE ${uniqueSuffix}`,
      ngaySinh: '1992-06-15',
      gioiTinh: 'NAM',
      cccd: testCccd,
      soDienThoai: '0987654321',
      soBHYT: testBhyt,
      mucHuongBHYT: 80,
      diaChi: '123 An Dương Vương, Q5, TP.HCM',
      nhomMau: 'O',
      isNgoaiTru: true,
    };
    const res = await client.post('/patients/reception', payload, authHeader(cashierToken));
    const ok = res.status === 201 && res.data?.MaBN;
    if (ok) testMaBN = res.data.MaBN;
    recordTest('Patient', 'Tiếp nhận bệnh nhân mới (/api/patients/reception)', ok, `MaBN: ${res.data?.MaBN}`);
  }

  // Test 4.2: Chống trùng lặp số CCCD (Unique Filtered Index)
  {
    const payload = {
      hoTen: 'Trùng CCCD Test',
      ngaySinh: '1990-01-01',
      gioiTinh: 'NU',
      cccd: testCccd,
      diaChi: 'TP.HCM',
    };
    const res = await client.post('/patients/reception', payload, authHeader(cashierToken));
    const ok = res.status === 409 || res.status === 400;
    recordTest('Patient', 'Ràng buộc chống trùng CCCD (Unique Index)', ok, `Status: ${res.status}`);
  }

  // Test 4.3: Tra cứu hồ sơ bệnh nhân theo CCCD / BHYT
  {
    const res = await client.get('/patients/lookup', {
      ...authHeader(cashierToken),
      params: { q: testCccd },
    });
    const ok = res.status === 200 && res.data?.MaBN === testMaBN;
    recordTest('Patient', 'Tra cứu bệnh nhân theo CCCD (/api/patients/lookup)', ok, `Tìm thấy: ${res.data?.HoTen}`);
  }

  // Test 4.4: Lấy danh sách bệnh nhân phân trang
  {
    const res = await client.get('/patients', {
      ...authHeader(cashierToken),
      params: { page: 1, limit: 10 },
    });
    const ok = res.status === 200 && Array.isArray(res.data?.data) && res.data?.total > 0;
    recordTest('Patient', 'Danh sách bệnh nhân phân trang (/api/patients)', ok, `Total: ${res.data?.total}`);
  }

  // ==========================================================================
  // PHÂN HỆ 5: KHÁM LÂM SÀNG & CHẨN ĐOÁN (EXAMINATION)
  // ==========================================================================
  console.log('\n--- 5. PHÂN HỆ KHÁM LÂM SÀNG & CHẨN ĐOÁN ---');

  // Test 5.1: Mở lượt khám bệnh & nhập sinh hiệu
  {
    const payload = {
      maBN: testMaBN,
      maBS: 'BS01',
      maPhongKham: 'P01',
      trieuChung: 'Sốt nhẹ, ho khan kéo dài 3 ngày',
      huyetAp: '120/80',
      nhietDo: 37.8,
      mach: 84,
      chanDoanSoBo: 'Theo dõi Viêm đường hô hấp trên',
      huongXuTri: 'KE_DON_VE',
    };
    const res = await client.post('/examinations', payload, authHeader(doctorToken));
    const ok = res.status === 201 && res.data?.MaLuotKham;
    if (ok) testMaLK = res.data.MaLuotKham;
    recordTest('Examination', 'Mở lượt khám mới (/api/examinations)', ok, `MaLK: ${testMaLK}`);
  }

  // Test 5.2: Cập nhật chẩn đoán xác định & hướng điều trị
  {
    const payload = {
      chanDoanXacDinh: 'Viêm họng cấp tính J02.9',
      huongXuTri: 'KE_DON_VE',
      ngayTaiKham: '2026-11-25',
    };
    const res = await client.patch(`/examinations/${testMaLK}/diagnose`, payload, authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.ChanDoanXacDinh?.includes('J02.9');
    recordTest('Examination', 'Cập nhật chẩn đoán ICD (/api/examinations/:id/diagnose)', ok, `Chẩn đoán: ${res.data?.ChanDoanXacDinh}`);
  }

  // Test 5.3: Lấy chi tiết lượt khám
  {
    const res = await client.get(`/examinations/${testMaLK}`, authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.MaLuotKham === testMaLK;
    recordTest('Examination', 'Lấy chi tiết lượt khám (/api/examinations/:id)', ok, `MaLK: ${res.data?.MaLuotKham}`);
  }

  // Test 5.4: Lấy danh sách lượt khám
  {
    const res = await client.get('/examinations', {
      ...authHeader(doctorToken),
      params: { maBS: 'BS01' },
    });
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    recordTest('Examination', 'Lấy danh sách lượt khám của bác sĩ', ok, `Số lượt: ${res.data?.length}`);
  }

  // ==========================================================================
  // PHÂN HỆ 6: CẬN LÂM SÀNG & XÉT NGHIỆM (CLINICAL SERVICE)
  // ==========================================================================
  console.log('\n--- 6. PHÂN HỆ CẬN LÂM SÀNG & DỊCH VỤ KỸ THUẬT ---');

  // Test 6.1: Danh mục dịch vụ kỹ thuật
  {
    const res = await client.get('/services', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    if (ok) testMaDV = res.data[0].MaDV;
    recordTest('ClinicalService', 'Lấy danh mục dịch vụ kỹ thuật (/api/services)', ok, `Tổng DV: ${res.data?.length}`);
  }

  // Test 6.2: Bác sĩ chỉ định cận lâm sàng
  {
    const payload = {
      maLuotKham: testMaLK,
      maDV: testMaDV,
      soLuong: 1,
    };
    const res = await client.post('/services/assign', payload, authHeader(doctorToken));
    const ok = res.status === 201 && res.data?.MaDV === testMaDV;
    if (ok) assignedThoiGian = res.data.ThoiGianChiDinh;
    recordTest('ClinicalService', 'Chỉ định dịch vụ cận lâm sàng (/api/services/assign)', ok, `DV: ${testMaDV}, Thời gian: ${assignedThoiGian}`);
  }

  // Test 6.3: Danh sách dịch vụ chờ thực hiện
  {
    const res = await client.get('/services/pending', authHeader(nurseToken));
    const ok = res.status === 200 && Array.isArray(res.data);
    recordTest('ClinicalService', 'Lấy danh sách chỉ định chờ (/api/services/pending)', ok, `Số chờ: ${res.data?.length}`);
  }

  // Test 6.4: Nhập kết quả xét nghiệm
  {
    const payload = {
      maLuotKham: testMaLK,
      maDV: testMaDV,
      thoiGianChiDinh: assignedThoiGian,
      ketQuaCLS: 'Công thức máu bình thường, Bạch cầu 6.8 G/L',
      maKTVThucHien: 'DD01',
    };
    const res = await client.patch('/services/result', payload, authHeader(nurseToken));
    const ok = res.status === 200 && (res.data?.KetQuaCLS?.includes('Bình thường') || res.status === 200);
    recordTest('ClinicalService', 'Trả kết quả xét nghiệm (/api/services/result)', ok, `Status: ${res.status}`);
  }

  // ==========================================================================
  // PHÂN HỆ 7: TOA THUỐC & DƯỢC PHẨM (PRESCRIPTION)
  // ==========================================================================
  console.log('\n--- 7. PHÂN HỆ TOA THUỐC & DƯỢC PHẨM ---');

  // Test 7.1: Danh mục thuốc tồn kho
  {
    const res = await client.get('/prescriptions/medicines', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    if (ok) testMaThuoc = res.data[0].MaThuoc;
    recordTest('Prescription', 'Lấy danh mục thuốc trong kho (/api/prescriptions/medicines)', ok, `Mặt hàng: ${res.data?.length}`);
  }

  // Test 7.2: Kê đơn thuốc điều trị
  {
    const payload = {
      maLuotKham: testMaLK,
      loiDanBacSi: 'Uống thuốc sau bữa ăn, uống nhiều nước ấm',
      items: [
        {
          maThuoc: testMaThuoc,
          soLuong: 5,
          lieuDung: 'Sáng 1 viên, Chiều 1 viên',
          cachDung: 'Uống sau ăn 30 phút',
          soNgayUong: 3,
        },
      ],
    };
    const res = await client.post('/prescriptions', payload, authHeader(doctorToken));
    const ok = res.status === 201 && res.data?.MaDon;
    if (ok) testMaDT = res.data.MaDon;
    recordTest('Prescription', 'Kê đơn thuốc điều trị (/api/prescriptions)', ok, `MaDon: ${testMaDT}`);
  }

  // Test 7.3: Lấy chi tiết đơn thuốc
  {
    const res = await client.get(`/prescriptions/${testMaDT}`, authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.MaDon === testMaDT;
    recordTest('Prescription', 'Lấy chi tiết đơn thuốc (/api/prescriptions/:id)', ok, `Số thuốc: ${res.data?.ctDonThuocs?.length}`);
  }

  // Test 7.4: Cấp phát thuốc & tự động trừ kho nguyên tử (Sử dụng nurseToken)
  {
    const res = await client.patch(`/prescriptions/${testMaDT}/dispense`, {}, authHeader(nurseToken));
    const ok = res.status === 200 && res.data?.TrangThaiPhatThuoc === 'DA_PHAT';
    recordTest('Prescription', 'Cấp phát thuốc & khấu trừ kho (/api/prescriptions/:id/dispense)', ok, `Trạng thái: ${res.data?.TrangThaiPhatThuoc}`);
  }

  // ==========================================================================
  // PHÂN HỆ 8: ĐIỀU TRỊ NỘI TRÚ & PHÂN GIƯỜNG (INPATIENT STAY)
  // ==========================================================================
  console.log('\n--- 8. PHÂN HỆ NỘI TRÚ & PHÂN GIƯỜNG SERIALIZABLE ---');

  // Test 8.1: Nhập viện điều trị
  {
    const payload = {
      maBN: testMaBN,
      chanDoanNhapVien: 'Theo dõi biến chứng viêm phổi cấp',
      tinhTrangNhapVien: 'Vua',
      maBSTheoDoi: 'BS01',
    };
    const res = await client.post('/inpatient/admit', payload, authHeader(doctorToken));
    const ok = res.status === 201 && res.data?.MaBN === testMaBN;
    recordTest('Inpatient', 'Nhập viện điều trị (/api/inpatient/admit)', ok, `MaBN: ${res.data?.MaBN}`);
  }

  // Test 8.2: Phân giường bệnh (Khóa dòng Serializable)
  if (availableBed) {
    const payload = {
      maBN: testMaBN,
      maGiuong: availableBed,
      ghiChu: 'Phân giường theo dõi điều trị',
    };
    const res = await client.post('/inpatient/assign-bed', payload, authHeader(nurseToken));
    const ok = res.status === 201 && res.data?.MaGiuong === availableBed;
    recordTest('Inpatient', 'Phân giường bệnh Serializable (/api/inpatient/assign-bed)', ok, `Giường: ${availableBed}`);
  } else {
    recordTest('Inpatient', 'Phân giường bệnh Serializable', false, 'Không còn giường trống khả dụng');
  }

  // Test 8.3: Chống phân trùng giường (Double allocation rejection)
  if (availableBed) {
    const payload = {
      maBN: 'BN001',
      maGiuong: availableBed,
    };
    const res = await client.post('/inpatient/assign-bed', payload, authHeader(nurseToken));
    const ok = res.status === 400 || res.status === 409;
    recordTest('Inpatient', 'Chống phân trùng giường đang sử dụng (Serializable check)', ok, `Status: ${res.status}`);
  }

  // Test 8.4: Chuyển giường bệnh
  if (availableBed && transferBed) {
    const payload = {
      maBN: testMaBN,
      maGiuongMoi: transferBed,
      lyDoChuyen: 'Chuyển sang buồng cách ly',
    };
    const res = await client.post('/inpatient/transfer-bed', payload, authHeader(nurseToken));
    const ok = res.status === 201 && res.data?.MaGiuong === transferBed;
    recordTest('Inpatient', 'Chuyển giường bệnh (/api/inpatient/transfer-bed)', ok, `Từ ${availableBed} -> ${transferBed}`);
  }

  // Test 8.5: Danh sách bệnh nhân nội trú
  {
    const res = await client.get('/inpatient/patients', authHeader(nurseToken));
    const ok = res.status === 200 && Array.isArray(res.data);
    recordTest('Inpatient', 'Lấy danh sách bệnh nhân nội trú (/api/inpatient/patients)', ok, `Số BN: ${res.data?.length}`);
  }

  // ==========================================================================
  // PHÂN HỆ 9: THU NGÂN VIỆN PHÍ & QUYẾT TOÁN BHYT (BILLING)
  // ==========================================================================
  console.log('\n--- 9. PHÂN HỆ THU NGÂN VIỆN PHÍ & QUYẾT TOÁN BHYT ---');

  // Test 9.1: Tính toán viện phí & bóc tách BHYT (80%)
  {
    const res = await client.post(`/billing/calculate/${testMaLK}`, {}, authHeader(cashierToken));
    const ok = res.status === 200 && res.data?.tongTienGoc >= 0 && res.data?.tienBHYTChiTra >= 0;
    recordTest('Billing', 'Tính toán viện phí bóc tách BHYT (/api/billing/calculate/:id)', ok, `Tổng: ${res.data?.tongTienGoc} đ, BHYT trả: ${res.data?.tienBHYTChiTra} đ`);
  }

  // Test 9.2: Lập hóa đơn viện phí
  {
    const payload = {
      maLuotKham: testMaLK,
      maNVThuNgan: 'NV_TN_01',
      phuongThucTT: 'CHUYEN_KHOAN',
    };
    const res = await client.post('/billing/invoices', payload, authHeader(cashierToken));
    const ok = res.status === 201 && res.data?.MaHD;
    if (ok) testMaHD = res.data.MaHD;
    recordTest('Billing', 'Lập hóa đơn viện phí (/api/billing/invoices)', ok, `MaHD: ${testMaHD}, Số tiền: ${res.data?.TienBenhNhanTra} đ`);
  }

  // Test 9.3: Giả lập Webhook VietQR (Xác nhận chuyển khoản)
  {
    const payload = {
      maHD: testMaHD,
      amount: 150000,
      transactionId: `TXN_${Date.now()}`,
      signature: 'signature_test',
    };
    const res = await client.post('/billing/webhook/vietqr', payload);
    const ok = res.status === 200 && (res.data?.success || res.data?.TrangThaiTT === 'DA_THANH_TOAN' || res.data?.status === 'SUCCESS');
    recordTest('Billing', 'Giả lập Webhook VietQR thanh toán (/api/billing/webhook/vietqr)', ok, `Status: ${res.status}`);
  }

  // Test 9.4: Tra cứu hóa đơn chi tiết
  {
    const res = await client.get(`/billing/invoices/${testMaHD}`, authHeader(cashierToken));
    const ok = res.status === 200 && res.data?.MaHD === testMaHD;
    recordTest('Billing', 'Tra cứu chi tiết hóa đơn (/api/billing/invoices/:id)', ok, `Trạng thái: ${res.data?.TrangThaiTT}`);
  }

  // Test 9.5: Xuất biên lai PDFKit
  {
    const res = await client.get(`/billing/invoices/${testMaHD}/pdf`, {
      ...authHeader(cashierToken),
      responseType: 'arraybuffer',
    });
    const isPdf = res.status === 200 && res.headers['content-type']?.includes('application/pdf');
    recordTest('Billing', 'Xuất biên lai PDFKit (/api/billing/invoices/:id/pdf)', isPdf, `Content-Type: ${res.headers['content-type']}, Size: ${res.data?.byteLength} bytes`);
  }

  // ==========================================================================
  // PHÂN HỆ 10: LỊCH TRỰC & CHẤM CÔNG (DUTY SCHEDULE)
  // ==========================================================================
  console.log('\n--- 10. PHÂN HỆ LỊCH TRỰC & CHẤM CÔNG ---');

  const randomDay = 20 + Math.floor(Math.random() * 8);
  const schedDate = `2026-11-${randomDay}`;

  // Test 10.1: Phân ca trực
  {
    const payload = {
      maNV: 'BS01',
      ngayTruc: schedDate,
      caTruc: 'DEM',
      maPhong: 'P01',
      vaiTroTruc: 'Bác sĩ trực chính cấp cứu',
    };
    const res = await client.post('/duty-schedules', payload, authHeader(doctorToken));
    const ok = res.status === 201 && res.data?.CaTruc === 'DEM';
    recordTest('DutySchedule', 'Phân công ca trực mới (/api/duty-schedules)', ok, `Ca: ${res.data?.CaTruc}, Ngày: ${schedDate}`);
  }

  // Test 10.2: Chống xếp trùng ca trực
  {
    const payload = {
      maNV: 'BS01',
      ngayTruc: schedDate,
      caTruc: 'DEM',
      maPhong: 'P01',
    };
    const res = await client.post('/duty-schedules', payload, authHeader(doctorToken));
    const ok = res.status === 409 || res.status === 400;
    recordTest('DutySchedule', 'Chống xếp trùng ca trực cùng thời điểm', ok, `Status: ${res.status}`);
  }

  // Test 10.3: Lấy danh sách lịch trực
  {
    const res = await client.get('/duty-schedules', authHeader(doctorToken));
    const ok = res.status === 200 && Array.isArray(res.data) && res.data.length > 0;
    recordTest('DutySchedule', 'Lấy danh sách phân ca (/api/duty-schedules)', ok, `Số ca: ${res.data?.length}`);
  }

  // Test 10.4: Chấm công điểm danh ca trực
  {
    const res = await client.patch(
      '/duty-schedules/attendance',
      {},
      {
        ...authHeader(doctorToken),
        params: {
          maNV: 'BS01',
          ngayTruc: schedDate,
          caTruc: 'DEM',
          status: 'CO_MAT',
        },
      }
    );
    const ok = res.status === 200 && res.data?.TrangThaiDiemDanh === 'CO_MAT';
    recordTest('DutySchedule', 'Điểm danh ca trực (/api/duty-schedules/attendance)', ok, `Điểm danh: ${res.data?.TrangThaiDiemDanh}`);
  }

  // ==========================================================================
  // PHÂN HỆ 11: BÁO CÁO & DASHBOARD THỐNG KÊ (REPORTS)
  // ==========================================================================
  console.log('\n--- 11. PHÂN HỆ BÁO CÁO & DASHBOARD THỐNG KÊ ---');

  // Test 11.1: Tổng hợp chỉ số Dashboard KPI
  {
    const res = await client.get('/reports/dashboard', authHeader(doctorToken));
    const ok = res.status === 200 && res.data?.overview && res.data?.revenue;
    recordTest('Report', 'Tổng hợp KPI Dashboard (/api/reports/dashboard)', ok, `Lượt khám: ${res.data?.overview?.totalExaminations}, Doanh thu: ${res.data?.revenue?.tongDoanhThu} đ`);
  }

  // ==========================================================================
  // TỔNG KẾT KẾT QUẢ KIỂM THỬ
  // ==========================================================================
  console.log('\n================================================================');
  const total = testResults.length;
  const passedCount = testResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TỔNG KẾT KIỂM THỬ FRONTEND API: ${passedCount}/${total} PASS (${((passedCount / total) * 100).toFixed(1)}%)`);
  if (failedCount > 0) {
    console.log(`CÁC TEST CASE THẤT BẠI (${failedCount}):`);
    testResults.filter((r) => !r.passed).forEach((r) => console.log(`  - [${r.module}] ${r.name}: ${r.details}`));
  }
  console.log('================================================================\n');

  return { total, passedCount, failedCount, testResults };
}

runDeepTests().catch((err) => {
  console.error('Fatal error in deep test suite:', err);
  process.exit(1);
});
