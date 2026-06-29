"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType }

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role="alert">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
