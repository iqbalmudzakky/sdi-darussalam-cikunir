"use client";

import { useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import EventCard from "@/components/sections/EventCard";
import type { PublicEventItem } from "@/types/Event";

const chipGroupVariants = cva([
  "-mx-5 mt-10 flex gap-2 overflow-x-auto px-5 pb-1",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
]);

const chipVariants = cva(
  [
    "h-11 shrink-0 cursor-pointer rounded-full border px-5",
    "text-sm font-medium whitespace-nowrap transition-colors",
  ],
  {
    variants: {
      active: {
        true: "border-brand-700 bg-brand-700 text-white",
        false:
          "border-brand-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

const eventGridVariants = cva([
  "mt-8 grid gap-x-6 gap-y-10 sm:mt-10",
  "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
]);

type EventListProps = {
  events: PublicEventItem[];
};

export default function EventList({ events }: EventListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set(
      events.map((event) => event.category.trim()).filter(Boolean),
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "id"));
  }, [events]);

  const visibleEvents = activeCategory
    ? events.filter((event) => event.category.trim() === activeCategory)
    : events;

  const chips = [
    { value: null, label: "Semua" },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  return (
    <>
      {/* Satu kategori saja tidak butuh penyaring. */}
      {categories.length > 1 && (
        <div
          role="group"
          aria-label="Saring berdasarkan kategori"
          className={chipGroupVariants()}
        >
          {chips.map((chip) => {
            const isActive = chip.value === activeCategory;

            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(chip.value)}
                className={chipVariants({ active: isActive })}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      <div className={eventGridVariants()}>
        {visibleEvents.map((event) => (
          <EventCard key={event.slug} event={event} />
        ))}
      </div>
    </>
  );
}
