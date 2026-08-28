"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/social/youtube";
import { cn } from "@/lib/utils";

type HeroMediaProps = {
  photoUrl: string | null;
  videoUrl: string;
};

/** Berapa lama tombol suara tampil berlabel sebelum menyusut jadi ikon. */
const SOUND_LABEL_DURATION_MS = 5000;

/*
 * Sengaja tanpa tombol jeda: YouTube selalu menampilkan judul, channel, dan
 * "More videos" begitu video berhenti, dan itu tidak bisa dimatikan lewat
 * parameter embed. Video yang tidak bisa dihentikan tidak pernah sampai ke
 * sana. Suara jadi satu-satunya kontrol, karena autoplay wajib tanpa suara.
 */
export function HeroMedia({ photoUrl, videoUrl }: HeroMediaProps) {
  const videoId = videoUrl ? extractYouTubeVideoId(videoUrl) : null;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showSoundLabel, setShowSoundLabel] = useState(true);

  /* Lewat postMessage, supaya tidak perlu memuat skrip YouTube. */
  function command(func: string, args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }

  useEffect(() => {
    if (!videoId) return;

    /* Player baru mengirim status setelah kita mendaftar sebagai pendengar. */
    const listenTimer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: videoId }),
        "*",
      );
    }, 500);

    /* Sebagian browser menolak autoplay pertama; coba sekali lagi. */
    const playTimer = setTimeout(() => command("playVideo"), 1000);

    const labelTimer = setTimeout(
      () => setShowSoundLabel(false),
      SOUND_LABEL_DURATION_MS,
    );

    /*
     * Diulang manual. Parameter loop bawaan membuat player menganggapnya
     * playlist lalu memunculkan panah maju/mundur. Status 0 = video selesai.
     */
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("youtube")) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data?.event === "onStateChange" && data.info === 0) {
          command("playVideo");
        }
      } catch {
        /* Pesan lain dari player. */
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      clearTimeout(listenTimer);
      clearTimeout(playTimer);
      clearTimeout(labelTimer);
      window.removeEventListener("message", handleMessage);
    };
  }, [videoId]);

  if (!videoId) {
    return photoUrl ? (
      <img
        src={photoUrl}
        alt="Gedung SD Islam Darussalam Cikunir"
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center px-6 text-center">
        <p className="text-sm text-brand-700">
          Foto gedung sekolah belum diunggah
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-brand-100">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1`}
        title="Video profil SD Islam Darussalam Cikunir"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        /* Memblokir klik ke player supaya tidak bisa dibuka di YouTube. */
        className="pointer-events-none h-full w-full border-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={() => {
          command(isMuted ? "unMute" : "mute");
          setIsMuted((prev) => !prev);
          setShowSoundLabel(false);
        }}
        aria-label={isMuted ? "Nyalakan suara video" : "Bisukan video"}
        className={cn(
          "absolute right-3 bottom-3 flex cursor-pointer items-center gap-2",
          "rounded-full bg-ink-900/55 text-white backdrop-blur-sm",
          "transition-all duration-300 hover:bg-ink-900/75",
          showSoundLabel && isMuted ? "px-3.5 py-2" : "p-2",
        )}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 shrink-0" />
        ) : (
          <Volume2 className="h-4 w-4 shrink-0" />
        )}

        {/* Menyusut lewat max-width supaya transisinya mulus. */}
        <span
          className={cn(
            "overflow-hidden text-xs font-medium whitespace-nowrap transition-all duration-300",
            showSoundLabel && isMuted ? "max-w-32 opacity-100" : "max-w-0 opacity-0",
          )}
        >
          Nyalakan suara
        </span>
      </button>
    </div>
  );
}
