import { create } from "zustand";
import { RoleEnum } from "@/types";

export interface UserSession {
  maNV: string;
  hoTen: string;
  role: RoleEnum;
  maKhoa?: string;
  tenKhoa?: string;
  soDienThoai?: string;
  SoNamCongTac?: number;
}

function normalizeUserSession(raw: unknown): UserSession {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const maNV = String(obj.maNV ?? obj.MaNV ?? "");
  const hoTen = String(obj.hoTen ?? obj.HoTen ?? (maNV || "Nhân viên"));
  return {
    maNV,
    hoTen,
    role: obj.role as RoleEnum,
    maKhoa: (obj.maKhoa ?? obj.MaKhoa) as string | undefined,
    tenKhoa: obj.tenKhoa as string | undefined,
    soDienThoai: (obj.soDienThoai ?? obj.SoDienThoai) as string | undefined,
    SoNamCongTac: typeof obj.SoNamCongTac === "number" ? obj.SoNamCongTac : undefined,
  };
}

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: UserSession | Record<string, unknown>, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  isAuthenticated: false,
  hydrated: false,
  login: (user, token) => {
    const normalized = normalizeUserSession(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
      localStorage.setItem("user_session", JSON.stringify(normalized));
    }
    set({ user: normalized, token, isAuthenticated: true, hydrated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_session");
    }
    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    const rawUser = localStorage.getItem("user_session");
    if (token && rawUser) {
      try {
        const user = normalizeUserSession(JSON.parse(rawUser));
        localStorage.setItem("user_session", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, hydrated: true });
        return;
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_session");
      }
    }
    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },
}));
