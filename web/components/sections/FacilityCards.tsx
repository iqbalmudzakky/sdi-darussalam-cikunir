"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import type { FacilityItem } from "@/types/Facility";

type FacilityCardsProps = {
  facilities: FacilityItem[];
};

const facilityCardVariants = cva([
  "group relative overflow-hidden rounded-2xl",
  "aspect-[4/3] md:aspect-square",
  "shadow-md",
  "transition-[transform,box-shadow] duration-300 ease-out",

  // Desktop hover
  "md:hover:-translate-y-1 md:hover:shadow-xl",
]);

const facilityFallbackVariants = cva(["absolute inset-0 flex items-center justify-center", "bg-linear-to-br from-emerald-500 to-teal-600"]);

export default function FacilityCards({ facilities }: FacilityCardsProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const animationFrameRef = useRef<number | null>(null);

  /*
   * Hanya SATU card yang boleh otomatis aktif
   * karena berada paling dekat dengan tengah layar.
   */
  const [centerActiveId, setCenterActiveId] = useState<string | null>(null);

  /*
   * Card yang sedang benar-benar ditahan
   * oleh jari user.
   *
   * Ketika ini aktif, auto-hover center
   * sementara diabaikan.
   */
  const [pressedFacilityId, setPressedFacilityId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  /*
   * Digunakan untuk membedakan:
   *
   * tap/scroll biasa
   * dengan
   * benar-benar menahan card.
   */
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const touchStartPositionRef = useRef({
    x: 0,
    y: 0,
  });

  /*
   * Deteksi mobile berdasarkan breakpoint md Tailwind.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateViewportMode = () => {
      const mobile = mediaQuery.matches;

      setIsMobile(mobile);

      if (!mobile) {
        setCenterActiveId(null);
        setPressedFacilityId(null);
      }
    };

    updateViewportMode();

    mediaQuery.addEventListener("change", updateViewportMode);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  /*
   * Mobile center detection.
   *
   * Hanya mencari SATU card yang pusatnya
   * paling dekat dengan pusat viewport.
   */
  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const updateCenterCard = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const viewportCenterX = viewportWidth / 2;
      const viewportCenterY = viewportHeight / 2;

      /*
       * Zona center sengaja dibuat lebih sempit
       * dibanding versi sebelumnya.
       *
       * Maksimal sekitar 90px dari titik tengah.
       */
      const centerTolerance = Math.min(90, viewportHeight * 0.12);

      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      facilities.forEach((facility) => {
        const element = cardRefs.current[facility.id];

        if (!element) return;

        const rect = element.getBoundingClientRect();

        const isVisible = rect.bottom > 0 && rect.top < viewportHeight;

        if (!isVisible) return;

        const cardCenterX = rect.left + rect.width / 2;

        const cardCenterY = rect.top + rect.height / 2;

        /*
         * Prioritas utama tetap jarak vertikal,
         * tetapi posisi horizontal juga dihitung
         * supaya hasilnya tetap unik.
         */
        const verticalDistance = Math.abs(cardCenterY - viewportCenterY);

        const horizontalDistance = Math.abs(cardCenterX - viewportCenterX);

        const totalDistance = verticalDistance + horizontalDistance * 0.15;

        if (totalDistance < closestDistance) {
          closestDistance = totalDistance;
          closestId = facility.id;
        }
      });

      /*
       * Walaupun ada card yang paling dekat,
       * dia baru aktif kalau benar-benar berada
       * dekat dengan titik tengah layar.
       */
      if (closestId) {
        const element = cardRefs.current[closestId];

        if (element) {
          const rect = element.getBoundingClientRect();

          const cardCenterY = rect.top + rect.height / 2;

          const verticalDistance = Math.abs(cardCenterY - viewportCenterY);

          if (verticalDistance <= centerTolerance) {
            setCenterActiveId((current) => (current === closestId ? current : closestId));
          } else {
            setCenterActiveId(null);
          }
        }
      } else {
        setCenterActiveId(null);
      }

      animationFrameRef.current = null;
    };

    const requestUpdate = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateCenterCard);
    };

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    requestUpdate();

    return () => {
      window.removeEventListener("scroll", requestUpdate);

      window.removeEventListener("resize", requestUpdate);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [facilities, isMobile]);

  /*
   * Membersihkan timer long-press.
   */
  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  /*
   * User mulai menyentuh card.
   *
   * Belum langsung dianggap long-press.
   */
  const handleTouchStart = (facilityId: string, event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const touch = event.touches[0];

    touchStartPositionRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    clearLongPressTimer();

    /*
     * Baru dianggap "ditahan" setelah sekitar
     * 180ms tanpa gerakan scroll berarti.
     */
    longPressTimerRef.current = setTimeout(() => {
      setPressedFacilityId(facilityId);
      longPressTimerRef.current = null;
    }, 180);
  };

  /*
   * Jika jari ternyata bergerak untuk scrolling,
   * jangan anggap sebagai long-press.
   */
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const touch = event.touches[0];

    const deltaX = Math.abs(touch.clientX - touchStartPositionRef.current.x);

    const deltaY = Math.abs(touch.clientY - touchStartPositionRef.current.y);

    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer();
    }
  };

  /*
   * Saat jari dilepas:
   *
   * - long-press berakhir
   * - auto-hover center otomatis kembali berlaku
   *   kalau memang masih ada card di tengah.
   */
  const handleTouchEnd = () => {
    clearLongPressTimer();
    setPressedFacilityId(null);
  };

  const handleTouchCancel = () => {
    clearLongPressTimer();
    setPressedFacilityId(null);
  };

  return (
    <div
      className="
        grid grid-cols-1 gap-5
        md:grid-cols-2 md:gap-6
        lg:grid-cols-4
      "
    >
      {facilities.map((facility) => {
        /*
         * RULE PRIORITAS:
         *
         * Kalau ada card sedang ditahan:
         * hanya card tersebut yang aktif.
         *
         * Kalau tidak ada card yang ditahan:
         * card center boleh aktif.
         */
        const isMobileActive = isMobile ? (pressedFacilityId !== null ? pressedFacilityId === facility.id : centerActiveId === facility.id) : false;

        return (
          <div
            key={facility.id}
            ref={(element) => {
              cardRefs.current[facility.id] = element;
            }}
            className={`
              ${facilityCardVariants()}

              ${isMobileActive ? "-translate-y-1 shadow-xl" : "translate-y-0 shadow-md"}
            `}
            onTouchStart={(event) => handleTouchStart(facility.id, event)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            {/* Facility Image / Fallback */}
            {facility.photo_url ? (
              <img
                src={facility.photo_url}
                alt={facility.title}
                className={`
                  absolute inset-0
                  h-full w-full
                  object-cover

                  transition-transform
                  duration-500
                  ease-out

                  md:group-hover:scale-105

                  ${isMobileActive ? "scale-105" : "scale-100"}
                `}
              />
            ) : (
              <div className={facilityFallbackVariants()}>
                <span
                  className={`
                    text-5xl
                    transition-transform
                    duration-300
                    ease-out

                    sm:text-6xl

                    md:group-hover:scale-110

                    ${isMobileActive ? "scale-110" : "scale-100"}
                  `}
                >
                  {facility.emoji}
                </span>
              </div>
            )}

            {/* Image Overlay */}
            <div
              className={`
                absolute inset-0

                bg-linear-to-t
                to-transparent

                transition-all
                duration-300
                ease-out

                md:from-black/70
                md:via-black/10

                md:group-hover:from-black/90
                md:group-hover:via-black/50

                ${isMobileActive ? "from-black/90 via-black/50" : "from-black/70 via-black/10"}
              `}
            />

            {/* Facility Information */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              {/* Facility Title */}
              <h3 className="break-words text-center text-base font-bold text-white sm:text-lg">{facility.title}</h3>

              {/* Facility Subtitle */}
              {facility.subtitle && (
                <p
                  className={`
                    mt-1.5
                    break-words
                    overflow-hidden

                    text-center
                    text-sm
                    leading-relaxed
                    text-white/90

                    transition-[max-height,opacity,transform]
                    duration-300
                    ease-out

                    md:max-h-0
                    md:translate-y-2
                    md:opacity-0

                    md:group-hover:max-h-24
                    md:group-hover:translate-y-0
                    md:group-hover:opacity-100

                    ${isMobileActive ? "max-h-24 translate-y-0 opacity-100" : "max-h-0 translate-y-2 opacity-0"}
                  `}
                >
                  {facility.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
