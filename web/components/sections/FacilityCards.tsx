"use client";

import type { FacilityItem } from "@/types/Facility";
import { useReveal } from "@/hooks/useReveal";

type FacilityCardsProps = {
  facilities: FacilityItem[];
};

function FacilityCard({
  facility,
  index,
}: {
  facility: FacilityItem;
  index: number;
}) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  return (
    <figure
      ref={ref}
      className={`min-w-0 reveal ${isVisible ? "reveal-visible" : ""}`}
      style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      <div className="group relative aspect-4/3 overflow-hidden bg-brand-100">
        {facility.photo_url ? (
          <img
            src={facility.photo_url}
            alt={facility.title}
            className="
              absolute inset-0 h-full w-full object-cover
              transition-transform duration-700 ease-out
              group-hover:scale-105
            "
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-200">
            <span className="font-display text-3xl text-brand-600">
              {facility.title.charAt(0)}
            </span>
          </div>
        )}

        {/*
          Gelap di bagian bawah supaya judul selalu terbaca,
          lalu menguat saat hover agar keterangan ikut jelas.
        */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent
            transition-opacity duration-300 ease-out
            group-hover:from-ink-900/90 group-hover:via-ink-900/45
          "
        />

        <figcaption className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-display text-lg leading-snug font-semibold wrap-break-word text-white">
            {facility.title}
          </h3>

          {facility.subtitle && (
            <p
              className="
                mt-1.5 line-clamp-3 overflow-hidden wrap-break-word
                text-sm leading-relaxed text-white/90

                max-h-0 translate-y-2 opacity-0
                transition-[max-height,opacity,transform]
                duration-300 ease-out

                group-hover:max-h-28
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              {facility.subtitle}
            </p>
          )}
        </figcaption>
      </div>
    </figure>
  );
}

export default function FacilityCards({ facilities }: FacilityCardsProps) {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {facilities.map((facility, index) => (
        <FacilityCard key={facility.id} facility={facility} index={index} />
      ))}
    </div>
  );
}
