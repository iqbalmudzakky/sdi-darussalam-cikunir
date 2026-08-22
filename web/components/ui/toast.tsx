"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cva } from "class-variance-authority";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TIMEOUT = 3000;

function ToastProvider(props: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider timeout={DEFAULT_TIMEOUT} {...props} />;
}

const toastViewportVariants = cva([
  /*
   * Mobile:
   * gunakan left + right dengan width auto
   * agar toast selalu memiliki jarak aman
   * dari kedua sisi layar.
   */
  "fixed bottom-4 left-4 right-4 z-100",
  "flex w-auto flex-col gap-2",
  "outline-none",

  /*
   * Desktop:
   * kembali ke posisi kanan bawah seperti
   * desain awal.
   */
  "sm:left-auto sm:right-4",
  "sm:w-full sm:max-w-sm",
]);

const toastRootVariants = cva([
  "relative min-w-0 overflow-hidden",
  "rounded-2xl border bg-white",
  "p-4 pr-10 shadow-lg",

  /*
   * Mobile:
   * toast masuk sedikit dari bawah.
   */
  "data-starting-style:translate-y-3",
  "data-starting-style:opacity-0",

  /*
   * Desktop:
   * pertahankan karakter animasi awal
   * yang masuk dari kanan.
   */
  "sm:data-starting-style:translate-x-8",
  "sm:data-starting-style:translate-y-0",

  "data-ending-style:translate-y-2",
  "data-ending-style:opacity-0",

  "sm:data-ending-style:translate-x-8",
  "sm:data-ending-style:translate-y-0",

  "transition-all duration-300 ease-out",
]);

const toastCloseVariants = cva([
  "absolute right-3 top-3",
  "rounded-lg p-1",
  "outline-none",

  "text-gray-400",

  /*
   * Desktop hover existing.
   */
  "hover:bg-gray-100 hover:text-gray-600",

  /*
   * Mobile equivalent.
   */
  "active:scale-95",
  "active:bg-gray-100",
  "active:text-gray-600",

  "transition-[transform,background-color,color]",
  "duration-200",
]);

function ToastProgressBar({ timeout, type }: { timeout: number; type: string | undefined }) {
  const duration = Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT;

  const [percent, setPercent] = React.useState(100);

  React.useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;

      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);

      setPercent(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [duration]);

  return (
    <div
      className={cn("absolute inset-x-0 bottom-0 h-1", type === "error" ? "bg-red-500" : "bg-emerald-600")}
      style={{
        width: `${percent}%`,
        transition: "width 80ms linear",
      }}
    />
  );
}

function Toaster() {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className={toastViewportVariants()}>
        {toasts.map((toast) => (
          <ToastPrimitive.Root key={toast.id} toast={toast} swipeDirection={["right", "down"]} className={toastRootVariants()}>
            {/* Toast Icon */}
            <div className="flex min-w-0 gap-3">
              <div className="shrink-0 pt-0.5">{toast.type === "error" ? <XCircle className="h-5 w-5 text-red-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}</div>

              {/* Toast Content */}
              <div className="min-w-0 flex-1">
                {toast.title && <ToastPrimitive.Title className="break-words text-sm font-semibold leading-snug text-gray-900">{toast.title}</ToastPrimitive.Title>}

                {toast.description && <ToastPrimitive.Description className="mt-1 break-words text-sm leading-relaxed text-gray-500 [overflow-wrap:anywhere]">{toast.description}</ToastPrimitive.Description>}
              </div>
            </div>

            {/* Close Button */}
            <ToastPrimitive.Close className={toastCloseVariants()} aria-label="Tutup notifikasi">
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </ToastPrimitive.Close>

            {/* Progress Bar */}
            {toast.timeout !== 0 && <ToastProgressBar timeout={toast.timeout ?? DEFAULT_TIMEOUT} type={toast.type} />}
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

const useToastManager = ToastPrimitive.useToastManager;

export { ToastProvider, Toaster, useToastManager };
