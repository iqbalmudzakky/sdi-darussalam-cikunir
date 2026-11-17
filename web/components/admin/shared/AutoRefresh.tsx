"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AutoRefreshProps = {
  seconds: number;
};

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
