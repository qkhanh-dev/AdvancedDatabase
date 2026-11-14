import { create } from "zustand";

export type UserRole = "ADMIN" | "BAC_SI" | "DIEU_DUONG" | "NV_HANH_CHINH";

export interface UserSession {
  maNV: string;
  hoTen: string;
  vaiTro: UserRole;
  maKhoa?: string;
  email?: string;
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
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
