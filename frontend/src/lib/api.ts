import axios from "axios";
import { useToastStore } from "@/store/useToastStore";
import { ApiErrorResponse } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function extractApiError(error: unknown): {
  statusCode?: number;
  ruleCode?: string;
  message: string;
} {
  const err = error as {
    response?: { status?: number; data?: Partial<ApiErrorResponse> };
    message?: string;
  };
  const data = err?.response?.data;
  const rawMsg = data?.message ?? err?.message ?? "Không thể thực hiện thao tác, vui lòng thử lại.";
  const msg = Array.isArray(rawMsg) ? rawMsg.join(", ") : String(rawMsg);
  return {
    statusCode: data?.statusCode ?? err?.response?.status,
    ruleCode: data?.ruleCode,
    message: msg,
  };
}

function getSuccessToastMessage(url: string, method: string): string | null {
  if (url.includes("/auth/login")) return null;
  if (url.includes("/insurance-cards") && method === "post")
    return "Đã thêm thẻ BHYT mới cho bệnh nhân.";
  if (url.includes("/patients") && method === "post")
    return "Đã tạo hồ sơ bệnh nhân mới.";
  if (url.includes("/examinations") && method === "post")
    return "Đã đăng ký lượt khám mới.";
  if (url.includes("/examinations") && method === "patch")
    return "Đã cập nhật thông tin lượt khám.";
  if (url.includes("/prescriptions") && method === "post")
    return "Đã kê đơn thuốc mới (snapshot DonGiaKe).";
  if (url.includes("/prescriptions") && method === "patch")
    return "Đã cập nhật đơn thuốc trước thanh toán.";
  if (url.includes("/prescriptions") && method === "delete")
    return "Đã hủy đơn thuốc.";
  if (url.includes("/lab-requests") && url.includes("/start"))
    return "Đã tiếp nhận mẫu và bắt đầu thực hiện xét nghiệm.";
  if (url.includes("/lab-requests") && url.includes("/complete"))
    return "Đã trả kết quả xét nghiệm thành công.";
  if (url.includes("/lab-requests") && method === "post")
    return "Đã tạo phiếu chỉ định xét nghiệm.";
  if (url.includes("/lab-requests") && method === "delete")
    return "Đã hủy phiếu xét nghiệm.";
  if (url.includes("/inpatient/admissions") && url.includes("/discharge"))
    return "Đã xác nhận xuất viện và đóng phân giường đang mở.";
  if (url.includes("/inpatient/admissions") && method === "post")
    return "Đã mở đợt điều trị nội trú mới.";
  if (url.includes("/inpatient/bed-allocations") && method === "post")
    return "Đã phân bổ giường bệnh nội trú.";
  if (url.includes("/inpatient/transfer-bed") && method === "post")
    return "Đã xác nhận chuyển giường bệnh.";
  if (url.includes("/billing/invoices") && url.includes("/pay"))
    return "Đã chốt thanh toán viện phí (DA_THANH_TOAN).";
  if (url.includes("/billing/invoices") && method === "post")
    return "Đã lập hóa đơn viện phí mới.";
  if (url.includes("/departments")) return "Đã cập nhật danh mục Khoa.";
  if (url.includes("/rooms")) return "Đã cập nhật danh mục Phòng.";
  if (url.includes("/beds")) return "Đã cập nhật trạng thái khai thác giường bệnh.";
  if (url.includes("/staff")) return "Đã thêm hồ sơ nhân viên y tế.";
  return "Đã lưu dữ liệu thành công.";
}

api.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      const method = (response.config.method || "get").toLowerCase();
      if (["post", "patch", "put", "delete"].includes(method)) {
        const msg = getSuccessToastMessage(response.config.url || "", method);
        if (msg) {
          useToastStore.getState().showToast("success", msg);
        }
      }
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      const method = (error?.config?.method || "get").toLowerCase();
      const url = error?.config?.url || "";
      if (["post", "patch", "put", "delete"].includes(method) && !url.includes("/auth/login")) {
        const parsed = extractApiError(error);
        const prefix = parsed.ruleCode ? `[${parsed.ruleCode}] ` : "";
        useToastStore.getState().showToast("error", `${prefix}${parsed.message}`);
      }
    }
    return Promise.reject(error);
  },
);
