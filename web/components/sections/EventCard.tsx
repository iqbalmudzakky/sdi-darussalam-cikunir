import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { formatDateOnly } from "@/lib/date";
import type { PublicEventItem } from "@/types/Event";

export const categoryBadgeVariants = cva(
  [
    "truncate px-3 py-1.5",
    "text-[11px] font-semibold tracking-[0.08em] text-white uppercase",
  ],
  {
    variants: {
      tone: {
        pmb: "bg-brand-600",
        prestasi: "bg-brand-800",
        akram: "bg-ink-900",
        hutRi: "bg-red-700",
        default: "bg-accent-600",
      },
      placement: {
        overlay: "absolute top-3 left-3 max-w-[calc(100%-1.5rem)] shadow-sm",

        inline: "max-w-full",
      },
    },
    defaultVariants: {
      tone: "default",
      placement: "inline",
    },
  },
);

type CategoryTone = NonNullable<
  VariantProps<typeof categoryBadgeVariants>["tone"]
>;

export function categoryTone(category: string): CategoryTone {
  const normalized = category.trim().toLowerCase();

  if (normalized === "pmb" || normalized === "ppdb") return "pmb";
  if (normalized === "prestasi") return "prestasi";
  if (normalized === "akram") return "akram";
  if (normalized === "hut ri" || normalized === "17 agustus") return "hutRi";

  return "default";
}

export const posterFrameVariants = cva([
  "relative aspect-3/4 overflow-hidden bg-brand-100",
]);

export const posterImageVariants = cva(
  ["absolute inset-0 h-full w-full object-contain"],
  {
    variants: {
      interactive: {
        true: "transition-transform duration-700 ease-out lg:group-hover:scale-[1.02]",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  },
);

export const posterFallbackVariants = cva(
  [
    "absolute inset-0 flex items-center justify-center",
    "font-display bg-brand-200 text-brand-600",
  ],
  {
    variants: {
      size: {
        card: "text-4xl",
        detail: "text-6xl",
      },
    },
    defaultVariants: {
      size: "card",
    },
  },
);

const cardLinkVariants = cva([
  "group block cursor-pointer rounded-sm",
  "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
  "focus-visible:ring-offset-4 focus-visible:ring-offset-paper",
]);

const cardDateVariants = cva([
  "text-xs font-medium tracking-wide text-ink-500",
]);

const cardTitleVariants = cva([
  "font-display mt-1.5 line-clamp-2 wrap-break-word",
  "text-lg leading-snug font-semibold text-ink-900",
  "transition-colors group-hover:text-brand-700",
]);

const cardSummaryVariants = cva([
  "mt-1.5 line-clamp-2 wrap-break-word",
  "text-sm leading-relaxed text-ink-700",
]);

type EventCardProps = {
  event: PublicEventItem;
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="min-w-0">
      <Link href={`/event/${event.slug}`} className={cardLinkVariants()}>
        <div className={posterFrameVariants()}>
          {event.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.poster_url}
              alt={`Poster ${event.title}`}
              loading="lazy"
              className={posterImageVariants({ interactive: true })}
            />
          ) : (
            <div className={posterFallbackVariants({ size: "card" })}>
              {event.title.charAt(0)}
            </div>
          )}

          {event.category && (
            <span
              className={categoryBadgeVariants({
                tone: categoryTone(event.category),
                placement: "overlay",
              })}
            >
              {event.category}
            </span>
          )}
        </div>

        <div className="pt-4">
          <p className={cardDateVariants()}>
            <time dateTime={event.event_date}>
              {formatDateOnly(event.event_date)}
            </time>
          </p>

          <h3 className={cardTitleVariants()}>{event.title}</h3>

          {event.summary && (
            <p className={cardSummaryVariants()}>{event.summary}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
