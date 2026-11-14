"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl shadow-2xl border overflow-hidden transition-all ${
              isSuccess
                ? "bg-[#00685f] text-white border-[#005049]"
                : isError
                  ? "bg-[#ba1a1a] text-white border-[#93000a]"
                  : "bg-[#006398] text-white border-[#004b73]"
            }`}
          >
            <div className="p-3.5 flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSuccess
                    ? "bg-[#89f5e7] text-[#005049]"
                    : isError
                      ? "bg-[#ffdad6] text-[#93000a]"
                      : "bg-[#cce5ff] text-[#004b73]"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-bold text-white truncate">
                    {toast.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase shrink-0 ${
                      isSuccess
                        ? "bg-[#89f5e7] text-[#005049]"
                        : isError
                          ? "bg-[#ffdad6] text-[#93000a]"
                          : "bg-[#cce5ff] text-[#004b73]"
                    }`}
                  >
                    {isSuccess ? "Đã lưu" : isError ? "Lỗi" : "HIS"}
                  </span>
                </div>
                <p className="text-[11.5px] text-white/95 mt-0.5 leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Đóng thông báo"
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Countdown Progress Bar (4.5s) */}
            <div className="h-1 w-full bg-black/20">
              <div
                className={`h-full ${
                  isSuccess
                    ? "bg-[#89f5e7]"
                    : isError
                      ? "bg-[#ffdad6]"
                      : "bg-[#cce5ff]"
                }`}
                style={{
                  animation: "toast-countdown 4.5s linear forwards",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
