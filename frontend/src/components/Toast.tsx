"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

type ShowToast = (message: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback<ShowToast>((message, kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, kind }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              toast.kind === "error" ? "bg-danger" : "bg-ink"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
