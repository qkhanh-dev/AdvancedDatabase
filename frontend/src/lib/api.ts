import axios from "axios";
import { useToastStore } from "@/store/useToastStore";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 10000,
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

function getSuccessToastMessage(url: string, method: string): string | null {
  if (url.includes("/auth/login")) return null;
  if (url.includes("/patients/reception"))
    return "Đã tiếp nhận và lưu hồ sơ bệnh nhân thành công.";
  if (url.includes("/examinations") && url.includes("/diagnose"))
    return "Đã cập nhật chẩn đoán xác định và hướng xử trí.";
  if (url.includes("/examinations") && method === "post")
    return "Đã mở lượt khám lâm sàng mới.";
  if (url.includes("/prescriptions") && url.includes("/dispense"))
    return "Đã xác nhận phát thuốc từ kho dược.";
  if (url.includes("/prescriptions") && method === "post")
    return "Đã kê đơn thuốc và chuyển xuống Nhà thuốc.";
  if (url.includes("/services/assign"))
    return "Đã chỉ định dịch vụ cận lâm sàng.";
  if (url.includes("/services/result"))
    return "Đã xác nhận và trả kết quả cận lâm sàng.";
  if (url.includes("/inpatient/admit"))
    return "Đã tiếp nhận bệnh nhân nhập viện nội trú.";
  if (url.includes("/inpatient/assign-bed"))
    return "Đã phân bổ giường bệnh nội trú.";
  if (url.includes("/inpatient/transfer-bed"))
    return "Đã xác nhận chuyển giường bệnh.";
  if (url.includes("/billing"))
    return "Đã xác nhận thanh toán viện phí.";
  if (url.includes("/staff"))
    return "Đã cập nhật thông tin nhân sự / lịch trực.";
  return "Đã xác nhận và lưu dữ liệu thành công.";
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
        const errMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể thực hiện thao tác, vui lòng thử lại.";
        useToastStore
          .getState()
          .showToast("error", Array.isArray(errMsg) ? errMsg.join(", ") : String(errMsg));
      }
    }
    return Promise.reject(error);
  }
);
