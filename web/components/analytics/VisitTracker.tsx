"use client";

import { useCallback, useEffect, useRef } from "react";
import { recordVisit, recordVisitDuration } from "@/lib/api/analytics";

let hasRecordedVisit = false;

export function VisitTracker() {
  const openedAtRef = useRef(0);
  const visitIdRef = useRef<string | null>(null);
  const hasSentDurationRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  const startVisit = useCallback(async () => {
    try {
      visitIdRef.current = await recordVisit(controllerRef.current!.signal);
    } catch (error) {
      console.error("Failed to record visit:", error);
    }
  }, []);

  const sendDuration = useCallback(() => {
    if (hasSentDurationRef.current || !visitIdRef.current) return;
    hasSentDurationRef.current = true;

    recordVisitDuration(visitIdRef.current, Date.now() - openedAtRef.current);
  }, []);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden") sendDuration();
  }, [sendDuration]);

  useEffect(() => {
    if (hasRecordedVisit) return;
    hasRecordedVisit = true;

    openedAtRef.current = Date.now();
    controllerRef.current = new AbortController();

    startVisit();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", sendDuration);

    return () => {
      controllerRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", sendDuration);
    };
  }, [startVisit, sendDuration, handleVisibilityChange]);

  return null;
}
