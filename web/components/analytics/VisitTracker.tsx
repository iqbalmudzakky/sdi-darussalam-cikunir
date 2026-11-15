"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ENDPOINT = "/api/analytics/visits";

/* Detak dikirim selama halaman terlihat, supaya lama kunjungan tetap tercatat walau tab ditutup paksa. */
const PING_INTERVAL_MS = 15_000;

/* Penanda di sessionStorage bahwa tab ini sudah pernah membuka satu halaman. */
const SESSION_KEY = "sdi-kunjungan";

/*
 * Hanya halaman publik yang dicatat. Halaman admin dan login sengaja tidak
 * ikut, supaya kerja admin tidak terhitung sebagai pengunjung.
 */
const TRACKED_PATHS = [/^\/$/, /^\/event(\/|$)/, /^\/pendaftaran(\/|$)/];

type VisitEvent = "start" | "ping" | "end";

function send(body: Record<string, unknown>): void {
  const payload = JSON.stringify(body);

  /* text/plain supaya terkirim sebagai beacon sederhana, tanpa menunggu jawaban. */
  if (
    navigator.sendBeacon?.(
      ENDPOINT,
      new Blob([payload], { type: "text/plain" }),
    )
  ) {
    return;
  }

  void fetch(ENDPOINT, {
    method: "POST",
    body: payload,
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
  }).catch(() => undefined);
}

function createVisitId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  /* Browser lama tanpa randomUUID: UUID v4 dirakit dari byte acak. */
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/*
 * Mencatat kunjungan ke halaman Pengunjung di dashboard admin: satu catatan
 * per halaman dibuka, lalu detak berisi detik halaman benar-benar terlihat.
 * Dipasang sekali di layout akar, dan memulai catatan baru tiap pindah halaman.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!TRACKED_PATHS.some((pattern) => pattern.test(pathname))) return;
    if (navigator.webdriver) return;

    const id = createVisitId();
    let visibleSeconds = 0;
    let visibleSince: number | null =
      document.visibilityState === "visible" ? Date.now() : null;
    let hasEnded = false;

    const totalSeconds = (): number =>
      Math.round(
        visibleSeconds +
          (visibleSince === null ? 0 : (Date.now() - visibleSince) / 1000),
      );

    const report = (event: VisitEvent): void =>
      send({ id, event, seconds: totalSeconds() });

    /*
     * Asal kedatangan hanya berarti untuk halaman pertama: pindah halaman di
     * dalam situs tidak punya asal luar. utm_source dibaca juga, karena
     * aplikasi seperti ChatGPT menempelkannya tanpa mengirim referrer.
     */
    let isFirstPage = true;
    try {
      isFirstPage = !sessionStorage.getItem(SESSION_KEY);
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* sessionStorage diblokir: anggap halaman pertama. */
    }

    send({
      id,
      event: "start",
      path: pathname,
      referrer: isFirstPage ? document.referrer : "",
      utm: isFirstPage
        ? (new URLSearchParams(window.location.search).get("utm_source") ?? "")
        : "",
      width: window.innerWidth,
    });

    const pingTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") report("ping");
    }, PING_INTERVAL_MS);

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === "hidden") {
        if (visibleSince !== null) {
          visibleSeconds += (Date.now() - visibleSince) / 1000;
          visibleSince = null;
        }
        report("end");
      } else if (visibleSince === null) {
        visibleSince = Date.now();
      }
    };

    const end = (): void => {
      if (hasEnded) return;
      hasEnded = true;
      report("end");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", end);

    return () => {
      end();
      window.clearInterval(pingTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", end);
    };
  }, [pathname]);

  return null;
}
