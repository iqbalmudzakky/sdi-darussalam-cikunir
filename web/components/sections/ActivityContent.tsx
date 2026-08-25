"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from "@/lib/social/youtube";
import type { ActivityItem } from "@/types/Activity";
import type { AchievementItem } from "@/types/Achievement";
import { useReveal } from "@/hooks/useReveal";
import VideoDialog from "@/components/sections/VideoDialog";

type ActivityContentProps = {
  activities: ActivityItem[];
  achievements: AchievementItem[];
};

type PlayingVideo = {
  videoId: string;
  title: string;
  description?: string | null;
};

/*
 * Label seperti "Populer" atau "Baru" ditulis bebas
 * dari halaman admin.
 *
 * Beberapa label yang sering dipakai diberi warna
 * tersendiri supaya benar-benar menonjol di atas foto;
 * sisanya memakai warna aksen sebagai default.
 */
function badgeToneClass(badge: string): string {
  const normalized = badge.trim().toLowerCase();

  if (normalized === "baru" || normalized === "new") {
    return "bg-brand-600 text-white";
  }

  if (
    normalized === "populer" ||
    normalized === "popular" ||
    normalized === "favorit"
  ) {
    return "bg-accent-600 text-white";
  }

  return "bg-ink-900 text-white";
}

function ActivityCard({
  activity,
  index,
  onPlay,
}: {
  activity: ActivityItem;
  index: number;
  onPlay: (video: PlayingVideo) => void;
}) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  const videoId = activity.youtube_url
    ? extractYouTubeVideoId(activity.youtube_url)
    : null;

  const thumbnailUrl = videoId ? getYouTubeThumbnailUrl(videoId) : null;
  const imageUrl = thumbnailUrl ?? activity.photo_url;

  const media = (
    <div className="group relative aspect-4/3 overflow-hidden bg-brand-100">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={activity.title}
          className="
            absolute inset-0 h-full w-full object-cover
            transition-transform duration-700 ease-out
            lg:group-hover:scale-105
          "
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-200">
          <span className="font-display text-3xl text-brand-600">
            {activity.title.charAt(0)}
          </span>
        </div>
      )}

      {/*
        Di layar sentuh, tablet ikut di dalamnya, keterangan
        selalu tampil, jadi lapisan gelapnya langsung
        dibuat pekat.

        Mulai lg barulah ia mengikuti hover.
      */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-t from-ink-900/90 via-ink-900/45 to-transparent
          transition-[background-color,opacity] duration-300 ease-out

          lg:from-ink-900/80 lg:via-ink-900/10
          lg:group-hover:from-ink-900/90 lg:group-hover:via-ink-900/45
        "
      />

      {/* Tanda video, hanya kalau memang ada tautan YouTube */}
      {videoId && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="
              flex h-14 w-14 items-center justify-center
              rounded-full bg-white/95
              transition-transform duration-300 ease-out
              lg:group-hover:scale-110
            "
          >
            <Play className="h-5 w-5 translate-x-px fill-brand-700 text-brand-700" />
          </span>
        </div>
      )}

      {activity.badge && (
        <span
          className={`
            absolute top-3 left-3 z-10
            px-3 py-1.5
            text-[11px] font-semibold tracking-[0.08em] uppercase
            shadow-sm
            ${badgeToneClass(activity.badge)}
          `}
        >
          {activity.badge}
        </span>
      )}

      {/* Judul + deskripsi di atas foto */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-lg leading-snug font-semibold wrap-break-word text-white">
          {activity.title}
        </h3>

        {activity.description && (
          <p
            className="
              mt-1.5 line-clamp-3 overflow-hidden wrap-break-word
              text-sm leading-relaxed text-white/90

              lg:max-h-0 lg:translate-y-2 lg:opacity-0
              lg:transition-[max-height,opacity,transform]
              lg:duration-300 lg:ease-out

              lg:group-hover:max-h-28
              lg:group-hover:translate-y-0
              lg:group-hover:opacity-100
            "
          >
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <article
      ref={ref}
      className={`min-w-0 reveal ${isVisible ? "reveal-visible" : ""}`}
      style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      {videoId ? (
        <button
          type="button"
          onClick={() =>
            onPlay({
              videoId,
              title: activity.title,
              description: activity.description,
            })
          }
          aria-label={`Putar video ${activity.title}`}
          className="block w-full cursor-pointer text-left"
        >
          {media}
        </button>
      ) : (
        media
      )}
    </article>
  );
}

export default function ActivityContent({
  activities,
  achievements,
}: ActivityContentProps) {
  const [playingVideo, setPlayingVideo] = useState<PlayingVideo | null>(null);

  return (
    <>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:gap-7">
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={index}
            onPlay={setPlayingVideo}
          />
        ))}
      </div>

      {/*
        Satu dialog dipakai bersama semua kartu, supaya
        halaman tidak menyiapkan satu iframe per kegiatan.
      */}
      <VideoDialog
        videoId={playingVideo?.videoId ?? null}
        title={playingVideo?.title ?? ""}
        description={playingVideo?.description}
        onClose={() => setPlayingVideo(null)}
      />

      {/* Prestasi */}
      {achievements.length > 0 && (
        <div className="mt-20 border-t border-brand-200 pt-12 sm:mt-24">
          <h3 className="font-display text-2xl font-semibold text-ink-900">
            Prestasi Kami
          </h3>

          <dl className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="min-w-0">
                <dt className="font-display text-lg font-semibold wrap-break-word text-ink-900">
                  {achievement.title}
                </dt>

                <dd className="mt-2 text-sm leading-relaxed wrap-break-word text-ink-700">
                  {achievement.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  );
}
