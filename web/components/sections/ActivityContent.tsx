"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { cva } from "class-variance-authority";
import { Play } from "lucide-react";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/social/youtube";
import type { ActivityItem } from "@/types/Activity";
import type { AchievementItem } from "@/types/Achievement";

type ActivityContentProps = {
  activities: ActivityItem[];
  achievements: AchievementItem[];
};

const activityCardVariants = cva(
  [
    "group relative overflow-hidden rounded-3xl",
    "aspect-video",
    "transition-[transform,box-shadow] duration-300 ease-out",

    // Desktop hover
    "md:hover:-translate-y-2 md:hover:shadow-2xl",
  ],
  {
    variants: {
      active: {
        true: "-translate-y-2 shadow-2xl",
        false: "translate-y-0 shadow-md",
      },
    },
  },
);

const activityFallbackVariants = cva([
  "absolute inset-0 flex items-center justify-center",
  "bg-linear-to-br from-emerald-200 to-teal-200",
]);

const activityImageVariants = cva(
  [
    "absolute inset-0 h-full w-full object-cover",
    "transition-transform duration-500 ease-out",
    "md:group-hover:scale-105",
  ],
  {
    variants: {
      active: {
        true: "scale-105",
        false: "scale-100",
      },
    },
  },
);

const activityEmojiVariants = cva(
  [
    "text-5xl transition-transform duration-300 ease-out",
    "sm:text-6xl",
    "md:group-hover:scale-110",
  ],
  {
    variants: {
      active: {
        true: "scale-110",
        false: "scale-100",
      },
    },
  },
);

const activityPlayButtonVariants = cva(
  [
    "flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg",
    "transition-transform duration-300 ease-out",
    "sm:h-16 sm:w-16",
    "md:group-hover:scale-110",
  ],
  {
    variants: {
      active: {
        true: "scale-110",
        false: "scale-100",
      },
    },
  },
);

const activityOverlayVariants = cva(
  [
    "absolute inset-0 bg-linear-to-t to-transparent",
    "transition-all duration-300 ease-out",
    "md:from-black/70 md:via-black/10",
    "md:group-hover:from-black/90 md:group-hover:via-black/50",
  ],
  {
    variants: {
      active: {
        true: "from-black/90 via-black/50",
        false: "from-black/70 via-black/10",
      },
    },
  },
);

const activityBadgeVariants = cva([
  "absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1",
  "text-xs font-semibold text-white shadow-sm",
  "sm:right-4 sm:top-4 sm:px-3 sm:text-sm",
]);

const activityDescriptionVariants = cva(
  [
    "mt-1.5 line-clamp-3 wrap-break-word overflow-hidden",
    "text-center text-sm leading-relaxed text-white/90",
    "transition-[max-height,opacity,transform] duration-300 ease-out",
    "md:max-h-0 md:translate-y-2 md:opacity-0",
    "md:group-hover:max-h-28 md:group-hover:translate-y-0 md:group-hover:opacity-100",
  ],
  {
    variants: {
      active: {
        true: "max-h-28 translate-y-0 opacity-100",
        false: "max-h-0 translate-y-2 opacity-0",
      },
    },
  },
);

export default function ActivityContent({
  activities,
  achievements,
}: ActivityContentProps) {
  /*
   * Refs ini HANYA menyimpan card Activity.
   *
   * Bagian Prestasi Kami tidak ikut masuk
   * ke dalam sistem center-hover.
   */
  const activityRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const animationFrameRef = useRef<number | null>(null);

  /*
   * Hanya satu Activity yang boleh aktif otomatis
   * karena berada di tengah viewport mobile.
   */
  const [centerActiveId, setCenterActiveId] = useState<string | null>(null);

  /*
   * Activity yang sedang ditahan dengan jari.
   *
   * Manual hold mempunyai prioritas lebih tinggi
   * daripada auto-hover berdasarkan posisi center.
   */
  const [pressedActivityId, setPressedActivityId] = useState<string | null>(
    null,
  );

  const [isMobile, setIsMobile] = useState(false);

  /*
   * Timer untuk membedakan long-press
   * dengan sentuhan biasa saat scrolling.
   */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchStartPositionRef = useRef({
    x: 0,
    y: 0,
  });

  /*
   * Deteksi mobile berdasarkan breakpoint md Tailwind.
   *
   * Mobile:
   * < 768px
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportMode = () => {
      const mobile = mediaQuery.matches;

      setIsMobile(mobile);

      /*
       * Ketika berpindah ke desktop,
       * bersihkan state khusus mobile.
       */
      if (!mobile) {
        setCenterActiveId(null);
        setPressedActivityId(null);
      }
    };

    updateViewportMode();

    mediaQuery.addEventListener("change", updateViewportMode);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  /*
   * Mendeteksi SATU Activity yang berada
   * paling dekat dengan tengah viewport mobile.
   */
  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const updateCenterActivity = () => {
      const viewportHeight = window.innerHeight;
      const viewportCenterY = viewportHeight / 2;

      /*
       * Zona tengah dibuat cukup ketat agar
       * tidak terasa ambigu.
       */
      const centerTolerance = Math.min(72, viewportHeight * 0.09);

      let closestActivityId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      activities.forEach((activity) => {
        const element = activityRefs.current[activity.id];

        if (!element) return;

        const rect = element.getBoundingClientRect();

        /*
         * Abaikan Activity yang sudah benar-benar
         * berada di luar viewport.
         */
        const isVisible = rect.bottom > 0 && rect.top < viewportHeight;

        if (!isVisible) return;

        const activityCenterY = rect.top + rect.height / 2;

        const distanceFromCenter = Math.abs(activityCenterY - viewportCenterY);

        /*
         * Cari hanya SATU Activity yang
         * paling dekat dengan center.
         */
        if (distanceFromCenter < closestDistance) {
          closestDistance = distanceFromCenter;
          closestActivityId = activity.id;
        }
      });

      /*
       * Activity terdekat baru benar-benar
       * diaktifkan kalau masih berada dalam
       * center tolerance.
       */
      if (closestActivityId && closestDistance <= centerTolerance) {
        setCenterActiveId((current) =>
          current === closestActivityId ? current : closestActivityId,
        );
      } else {
        setCenterActiveId((current) => (current === null ? current : null));
      }

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current =
        window.requestAnimationFrame(updateCenterActivity);
    };

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    /*
     * Hitung kondisi awal saat component dimuat.
     */
    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);

      window.removeEventListener("resize", requestUpdate);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activities, isMobile]);

  /*
   * Bersihkan timer long-press.
   */
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  /*
   * User mulai menyentuh sebuah Activity.
   *
   * Tidak langsung dianggap sebagai hold karena
   * mungkin user sebenarnya akan melakukan scroll.
   */
  const handleTouchStart = (
    activityId: string,
    event: TouchEvent<HTMLDivElement>,
  ) => {
    if (!isMobile) return;

    const touch = event.touches[0];

    touchStartPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    clearLongPressTimer();

    /*
     * Setelah 180ms tanpa pergerakan berarti,
     * sentuhan dianggap sebagai tahan jari.
     */
    longPressTimerRef.current = setTimeout(() => {
      setPressedActivityId(activityId);

      longPressTimerRef.current = null;
    }, 180);
  };

  /*
   * Kalau jari bergerak cukup jauh,
   * berarti kemungkinan user sedang scrolling.
   *
   * Long-press dibatalkan.
   */
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const touch = event.touches[0];

    const deltaX = Math.abs(touch.clientX - touchStartPositionRef.current.x);

    const deltaY = Math.abs(touch.clientY - touchStartPositionRef.current.y);

    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer();
      setPressedActivityId(null);
    }
  };

  /*
   * User melepaskan jari.
   *
   * Manual-hover selesai.
   *
   * Setelah itu sistem kembali mengikuti Activity
   * yang memang berada di tengah layar.
   */
  const handleTouchEnd = () => {
    clearLongPressTimer();
    setPressedActivityId(null);
  };

  const handleTouchCancel = () => {
    clearLongPressTimer();
    setPressedActivityId(null);
  };

  return (
    <>
      {/* =========================
          Activity Cards
          ========================= */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
        {activities.map((activity) => {
          /*
           * PRIORITAS MOBILE:
           *
           * 1. Kalau ada Activity yang sedang ditahan,
           *    HANYA Activity itu yang hover.
           *
           * 2. Kalau tidak ada yang ditahan,
           *    Activity di tengah viewport yang hover.
           */
          const isMobileActive = isMobile
            ? pressedActivityId !== null
              ? pressedActivityId === activity.id
              : centerActiveId === activity.id
            : false;

          const videoId = activity.youtube_url
            ? extractYouTubeVideoId(activity.youtube_url)
            : null;
          const thumbnailUrl = videoId ? getYouTubeThumbnailUrl(videoId) : null;
          const imageUrl = thumbnailUrl ?? activity.photo_url;

          const cardInner = (
            <>
              {/* Activity Image / Thumbnail / Fallback */}
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={activity.title}
                  className={activityImageVariants({ active: isMobileActive })}
                />
              ) : (
                <div className={activityFallbackVariants()}>
                  <span
                    className={activityEmojiVariants({
                      active: isMobileActive,
                    })}
                  >
                    {activity.emoji}
                  </span>
                </div>
              )}

              {/* Play Button, hanya untuk video YouTube */}
              {videoId && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={activityPlayButtonVariants({
                      active: isMobileActive,
                    })}
                  >
                    <Play className="h-6 w-6 translate-x-0.5 fill-emerald-600 text-emerald-600 sm:h-7 sm:w-7" />
                  </div>
                </div>
              )}

              {/* Image Overlay */}
              <div
                className={activityOverlayVariants({ active: isMobileActive })}
              />

              {/* Activity Badge */}
              {activity.badge && (
                <div className={activityBadgeVariants()}>{activity.badge}</div>
              )}

              {/* Activity Title + Description */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="wrap-break-word text-center text-base font-bold text-white sm:text-lg">
                  {activity.title}
                </h3>

                {activity.description && (
                  <p
                    className={activityDescriptionVariants({
                      active: isMobileActive,
                    })}
                  >
                    {activity.description}
                  </p>
                )}
              </div>
            </>
          );

          return (
            <div
              key={activity.id}
              ref={(element) => {
                activityRefs.current[activity.id] = element;
              }}
              className={activityCardVariants({ active: isMobileActive })}
              onTouchStart={(event) => handleTouchStart(activity.id, event)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              {videoId && activity.youtube_url ? (
                <a
                  href={activity.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 block"
                  aria-label={`Tonton video ${activity.title} di YouTube`}
                >
                  {cardInner}
                </a>
              ) : (
                cardInner
              )}
            </div>
          );
        })}
      </div>

      {/* =========================
          Achievement Section
          ========================= */}
      {achievements.length > 0 && (
        <div className="mt-12 rounded-3xl bg-linear-to-r from-emerald-500 to-teal-600 p-6 text-white sm:mt-14 sm:p-8 lg:mt-16 lg:p-12">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-8 text-2xl font-bold sm:text-3xl lg:mb-10">
              Prestasi Kami
            </h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="px-4 py-3">
                  <div className="mb-3 text-4xl font-bold sm:text-5xl">
                    {achievement.emoji}
                  </div>

                  <p className="mb-2 text-xl font-bold sm:text-2xl">
                    {achievement.title}
                  </p>

                  <p className="text-sm leading-relaxed text-emerald-100 sm:text-base">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
