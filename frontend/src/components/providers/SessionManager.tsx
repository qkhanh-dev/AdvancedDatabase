"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";

const AUTO_LOGOUT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

export function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated, hydrate, logout } = useAuthStore();

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const performAutoLogout = useCallback(() => {
    if (!useAuthStore.getState().isAuthenticated) return;
    logout();
    queryClient.clear();
    if (pathname !== "/login") {
      useToastStore
        .getState()
        .showToast("info", "Phiên làm việc đã tự động đăng xuất sau 5 phút không hoạt động hoặc rời trang.");
      router.replace("/login");
    }
  }, [logout, pathname, queryClient, router]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(performAutoLogout, AUTO_LOGOUT_TIMEOUT_MS);
  }, [performAutoLogout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      hiddenAtRef.current = null;
      return;
    }

    resetInactivityTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        resetInactivityTimer();
      } else if (document.visibilityState === "visible") {
        const hiddenAt = hiddenAtRef.current;
        hiddenAtRef.current = null;
        if (hiddenAt !== null && Date.now() - hiddenAt >= AUTO_LOGOUT_TIMEOUT_MS) {
          performAutoLogout();
          return;
        }
        resetInactivityTimer();
      }
    };

    let lastActivityTick = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityTick < 1000) return;
      lastActivityTick = now;
      resetInactivityTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handleActivity, { passive: true });
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handleActivity);
      }
    };
  }, [isAuthenticated, performAutoLogout, resetInactivityTimer]);

  return null;
}
