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

const ACCESS_TOKEN_KEY = "access_token";
const USER_SESSION_KEY = "user_session";
const APP_BOOT_ID_KEY = "app_boot_id";
const CURRENT_BOOT_ID = process.env.NEXT_PUBLIC_APP_BOOT_ID || "";

function clearAuthStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(APP_BOOT_ID_KEY);
  // Clear any legacy persistent tokens from localStorage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_SESSION_KEY);
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const storedBootId = sessionStorage.getItem(APP_BOOT_ID_KEY);
  if (CURRENT_BOOT_ID && storedBootId !== CURRENT_BOOT_ID) {
    return null;
  }
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
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
  token: getStoredAccessToken(),
  isAuthenticated: false,
  hydrated: false,
  login: (user, token) => {
    const normalized = normalizeUserSession(user);
    if (typeof window !== "undefined") {
      clearAuthStorage();
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(normalized));
      if (CURRENT_BOOT_ID) {
        sessionStorage.setItem(APP_BOOT_ID_KEY, CURRENT_BOOT_ID);
      }
    }
    set({ user: normalized, token, isAuthenticated: true, hydrated: true });
  },
  logout: () => {
    clearAuthStorage();
    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    // Always purge legacy localStorage tokens so sessions never persist across browser restarts
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_SESSION_KEY);

    const storedBootId = sessionStorage.getItem(APP_BOOT_ID_KEY);
    if (CURRENT_BOOT_ID && storedBootId !== CURRENT_BOOT_ID) {
      clearAuthStorage();
      set({ user: null, token: null, isAuthenticated: false, hydrated: true });
      return;
    }

    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const rawUser = sessionStorage.getItem(USER_SESSION_KEY);
    if (token && rawUser) {
      try {
        const user = normalizeUserSession(JSON.parse(rawUser));
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
        set({ user, token, isAuthenticated: true, hydrated: true });
        return;
      } catch {
        clearAuthStorage();
      }
    }
    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },
}));
