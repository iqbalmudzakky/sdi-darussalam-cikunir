"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/social/youtube";

type HeroMediaProps = {
  photoUrl: string | null;
  videoUrl: string;
};

/**
 * Hero media: a YouTube video when one is configured, otherwise the photo.
 *
 * The player runs with YouTube's own chrome switched off and its pointer
 * events blocked, so the hero cannot be clicked into a related-video grid, a
 * channel page, or fullscreen. What remains are the two controls a muted
 * autoplaying video actually needs — pause and sound — drawn as our own
 * buttons and driven through the iframe API.
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

  useEffect(() => {
    if (!videoId) return;

    // Player hanya mengirim perubahan status setelah kita mendaftar sebagai
    // pendengar; tanpa ini, pengulangan di bawah tidak akan terpicu.
    const listenTimer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: videoId }),
        "*",
      );
    }, 500);

    // Some browsers still refuse the autoplay; asking again once the frame is
    // up costs nothing and recovers those cases.
    const playTimer = setTimeout(() => command("playVideo"), 1000);

    // Mengulang video sendiri, menggantikan parameter loop bawaan yang
    // memunculkan kontrol playlist. Status 0 berarti video selesai.
    function handleMessage(event: MessageEvent) {
      if (!event.origin.includes("youtube")) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data?.event === "onStateChange" && data.info === 0) {
          command("playVideo");
        }
      } catch {
        // Pesan lain dari player; tidak ada yang perlu dilakukan.
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      clearTimeout(listenTimer);
      clearTimeout(playTimer);
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
        // Tanpa loop/playlist: parameter itu membuat player memperlakukan
        // video sebagai playlist, lalu memunculkan panah maju/mundur dan
        // "More videos" begitu video dijeda. Pengulangan ditangani sendiri
        // lewat iframe API di bawah.
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1`}
        title="Video profil SD Islam Darussalam Cikunir"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        // Blocks every click, drag and hover on the player itself, so the
        // video cannot be opened on YouTube or paused into a suggestion grid.
        className="pointer-events-none h-full w-full border-0"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/*
        Saat dijeda, YouTube menampilkan judul video, nama channel, tombol
        tautan, dan "More videos" — tidak ada parameter embed yang bisa
        mematikannya. Lapisan ini menutupinya sampai video diputar lagi.
      */}
      {!isPlaying && (
        <div
          className="absolute inset-0 bg-ink-900/45 backdrop-blur-[3px]"
          aria-hidden="true"
        />
      )}

      <div className="absolute right-3 bottom-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => {
            command(isPlaying ? "pauseVideo" : "playVideo");
            setIsPlaying((prev) => !prev);
          }}
          aria-label={isPlaying ? "Jeda video" : "Putar video"}
          className="cursor-pointer rounded-full bg-ink-900/55 p-2 text-white backdrop-blur-sm transition-colors hover:bg-ink-900/75"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>

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
