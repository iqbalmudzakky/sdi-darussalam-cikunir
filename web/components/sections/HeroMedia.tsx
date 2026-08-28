"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/social/youtube";
import { cn } from "@/lib/utils";

type HeroMediaProps = {
  photoUrl: string | null;
  videoUrl: string;
};

/**
 * Hero media: a YouTube video when one is configured, otherwise the photo.
 *
 * The player runs with YouTube's own chrome switched off and its pointer
 * events blocked, so the hero cannot be clicked into a related-video grid, a
 * channel page, or fullscreen. Tapping anywhere on the video toggles playback
 * instead, the way a hero video is expected to behave; only the sound button
 * sits on top of that.
 *
 * YouTube always renders 16:9, while the hero frame follows the photo it
 * replaces, so the player is scaled to cover the frame and the overflow is
 * cropped — the same result `object-cover` gives an image. Fitting it inside
 * instead is what left black bars above and below.
 *
 * Muted start is not a preference: browsers refuse to autoplay audio, and an
 * unmuted attempt is simply blocked, leaving a still frame.
 */
export function HeroMedia({ photoUrl, videoUrl }: HeroMediaProps) {
  const videoId = videoUrl ? extractYouTubeVideoId(videoUrl) : null;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  /**
   * Talks to the player through the iframe API's postMessage interface, which
   * avoids pulling in YouTube's script for two commands.
   */
  function command(func: string, args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*",
    );
  }

  // Some browsers still refuse the autoplay; asking again once the frame is up
  // costs nothing and recovers those cases.
  useEffect(() => {
    if (!videoId) return;

    const timer = setTimeout(() => command("playVideo"), 1000);
    return () => clearTimeout(timer);
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
    <div className="relative h-full w-full overflow-hidden bg-brand-100">
      {/*
        Dibuat jauh lebih besar dari bingkainya lalu dipusatkan, sehingga sisi
        yang berlebih terpotong keluar alih-alih menyisakan bilah hitam.
        min-w/min-h memakai satuan relatif terhadap bingkai (cqw/cqh tidak
        dipakai agar tetap bekerja tanpa container query).
      */}
      <iframe
        ref={iframeRef}
        // enablejsapi lets the buttons below drive the player; playlist+loop
        // is YouTube's documented way of looping a single video. vq is a hint
        // only — YouTube still adapts to the viewer's connection.
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1&vq=hd1080`}
        title="Video profil SD Islam Darussalam Cikunir"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        // Blocks every click, drag and hover on the player itself, so the
        // video cannot be opened on YouTube or paused into a suggestion grid.
        // The overlay below picks those clicks up instead.
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style={{
          // Player tetap 16:9, lalu dipaksa menutupi bingkai dari kedua sisi:
          // aspect-ratio menjaga bentuknya, sementara min-width/min-height
          // 100% memastikan tidak ada sisi yang lebih kecil dari bingkainya.
          // Sisi yang meluber dipotong oleh overflow-hidden di pembungkus —
          // hasil yang sama seperti object-cover pada gambar.
          aspectRatio: "16 / 9",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
        }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Klik di mana pun pada video untuk jeda / lanjut. */}
      <button
        type="button"
        onClick={() => {
          command(isPlaying ? "pauseVideo" : "playVideo");
          setIsPlaying((prev) => !prev);
        }}
        aria-label={isPlaying ? "Jeda video" : "Putar video"}
        className="group absolute inset-0 h-full w-full cursor-pointer"
      >
        {/*
          Ikon hanya muncul saat dijeda atau saat kursor di atas video, supaya
          tidak menutupi gambar ketika sedang diputar.
        */}
        <span
          className={cn(
            "flex h-full w-full items-center justify-center transition-opacity duration-200",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          )}
        >
          <span className="rounded-full bg-ink-900/55 p-3 text-white backdrop-blur-sm">
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </span>
        </span>
      </button>

      <div className="absolute right-3 bottom-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            command(isMuted ? "unMute" : "mute");
            setIsMuted((prev) => !prev);
          }}
          aria-label={isMuted ? "Nyalakan suara" : "Bisukan video"}
          className="cursor-pointer rounded-full bg-ink-900/55 p-2 text-white backdrop-blur-sm transition-colors hover:bg-ink-900/75"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
