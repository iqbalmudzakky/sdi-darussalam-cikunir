"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AutoRefreshProps = {
  seconds: number;
};

/*
 * Memuat ulang data halaman server secara berkala selama tab terlihat,
 * supaya angka yang terus bergerak tidak perlu disegarkan dengan tangan.
 */
export function AutoRefresh({ seconds }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);

    return () => window.clearInterval(timer);
  }, [router, seconds]);

  return null;
}
