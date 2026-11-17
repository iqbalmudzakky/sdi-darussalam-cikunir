"use client";

import { useEffect } from "react";
import { refreshSession } from "@/lib/api/auth";

export function SessionRefresher() {
  useEffect(() => {
    refreshSession().catch((error) => {
      console.error("Failed to refresh session:", error);
    });
  }, []);

  return null;
}
