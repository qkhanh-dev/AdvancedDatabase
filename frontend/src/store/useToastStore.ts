import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (type: ToastType, message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_TITLES: Record<ToastType, string> = {
  success: "Xác nhận thành công",
  error: "Thao tác thất bại",
  info: "Thông báo hệ thống",
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (type, message, title) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-3),
        {
          id,
          type,
          title: title || DEFAULT_TITLES[type],
          message,
        },
      ],
    }));

    if (typeof window !== "undefined") {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 4500);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
