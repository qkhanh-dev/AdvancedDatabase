import { create } from "zustand";
import { RoleEnum, LoaiNVEnum } from "@/types";

export interface UserSession {
  maNV: string;
  hoTen: string;
  role: RoleEnum;
  loaiNV?: LoaiNVEnum;
  maKhoa?: string;
  tenKhoa?: string;
  email?: string | null;
  soDienThoai?: string;
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserSession, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  isAuthenticated: false,
  login: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user_session", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_session");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
