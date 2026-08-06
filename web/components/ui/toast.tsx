"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { cva } from "class-variance-authority";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const DEFAULT_TIMEOUT = 3000;

function ToastProvider(
  props: React.ComponentProps<typeof ToastPrimitive.Provider>,
) {
  return <ToastPrimitive.Provider timeout={DEFAULT_TIMEOUT} {...props} />;
}

const toastViewportVariants = cva([
  "fixed bottom-4 right-4 z-100",
  "flex w-full max-w-sm flex-col gap-2",
  "outline-none",
]);

const toastRootVariants = cva([
  "relative overflow-hidden rounded-2xl border bg-white p-4 pr-9 shadow-lg",
  "data-starting-style:translate-x-8 data-starting-style:opacity-0",
  "data-ending-style:opacity-0",
  "transition-all duration-300",
]);

const toastCloseVariants = cva([
  "absolute top-3 right-3 rounded-lg p-0.5 outline-none",
  "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
]);

function ToastProgressBar({
  timeout,
  type,
}: {
  timeout: number;
  type: string | undefined;
}) {
  const duration =
    Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT;
  const [percent, setPercent] = React.useState(100);

  React.useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setPercent(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 h-1",
        type === "error" ? "bg-red-500" : "bg-emerald-600",
      )}
      style={{ width: `${percent}%`, transition: "width 80ms linear" }}
    />
  );
}

function Toaster() {
  const { toasts } = ToastPrimitive.useToastManager();

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className={toastViewportVariants()}>
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            toast={toast}
            swipeDirection={["right", "down"]}
            className={toastRootVariants()}
          >
            <div className="flex gap-3">
              {toast.type === "error" ? (
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div className="space-y-0.5">
                {toast.title && (
                  <ToastPrimitive.Title className="text-sm font-semibold text-gray-900">
                    {toast.title}
                  </ToastPrimitive.Title>
                )}
                {toast.description && (
                  <ToastPrimitive.Description className="text-sm text-gray-500">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>
            </div>
            <ToastPrimitive.Close className={toastCloseVariants()}>
              <X className="w-3.5 h-3.5" />
              <span className="sr-only">Tutup</span>
            </ToastPrimitive.Close>
            {toast.timeout !== 0 && (
              <ToastProgressBar
                timeout={toast.timeout ?? DEFAULT_TIMEOUT}
                type={toast.type}
              />
            )}
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

const useToastManager = ToastPrimitive.useToastManager;

export { ToastProvider, Toaster, useToastManager };
