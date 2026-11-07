import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { cva } from "class-variance-authority";
import { ArrowLeft } from "lucide-react";

import {
  categoryBadgeVariants,
  categoryTone,
  posterFallbackVariants,
  posterFrameVariants,
  posterImageVariants,
} from "@/components/sections/EventCard";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/sections/Navbar";
import { WhatsappIcon } from "@/components/icons/SocialIcons";
import { getPublishedEvent } from "@/lib/actions/events";
import { formatDateOnly } from "@/lib/date";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

const SCHOOL_NAME = "SD Islam Darussalam Cikunir";

const articleVariants = cva([
  "page-container pt-6 pb-20",
  "sm:pt-10 sm:pb-24 lg:pt-14",
]);

const backLinkVariants = cva([
  "-ml-1 inline-flex h-11 cursor-pointer items-center gap-2 px-1",
  "text-sm font-medium text-ink-700 transition-colors hover:text-brand-700",
]);

const detailLayoutVariants = cva([
  "mt-4 grid gap-8 sm:mt-6",
  "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-14",
]);

const posterColumnVariants = cva([
  "mx-auto w-full max-w-lg",
  "lg:sticky lg:top-28 lg:max-w-none",
]);

const metaRowVariants = cva(["flex flex-wrap items-center gap-x-3 gap-y-2"]);

const dateVariants = cva(["text-sm font-medium text-ink-500"]);

const titleVariants = cva([
  "font-display mt-4 text-balance wrap-break-word",
  "text-3xl leading-tight font-semibold text-ink-900 sm:text-[2.5rem]",
]);

const summaryVariants = cva([
  "mt-5 wrap-break-word",
  "text-[17px] leading-relaxed text-ink-700",
]);

const bodyVariants = cva(["mt-8 space-y-5 border-t border-brand-200 pt-8"]);

const paragraphVariants = cva([
  "whitespace-pre-line wrap-break-word",
  "text-base leading-relaxed text-ink-700",
]);

const shareButtonVariants = cva([
  "mt-10 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5",
  "rounded-lg bg-brand-600 px-6",
  "text-[15px] font-medium text-white transition-colors hover:bg-brand-700",
  "sm:w-auto",
]);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return [];
}

const getEvent = cache(getPublishedEvent);

function describe(summary: string, body: string): string {
  if (summary) return summary;
  if (body) return body.replace(/\s+/g, " ").slice(0, 160);
  return `Event ${SCHOOL_NAME}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};

  const title = `${event.title} | ${SCHOOL_NAME}`;
  const description = describe(event.summary, event.body);
  const url = `/event/${event.slug}`;
  const images = event.poster_url
    ? [{ url: event.poster_url, alt: `Poster ${event.title}` }]
    : [{ url: "/logo.png", alt: SCHOOL_NAME }];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SCHOOL_NAME,
      locale: "id_ID",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const profile = await getSchoolProfile();
  const siteUrl = getSiteUrl();
  const eventUrl = `${siteUrl}/event/${event.slug}`;

  const shareText = `${event.title}\n${eventUrl}`;
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const paragraphs = event.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: describe(event.summary, event.body),
    startDate: event.event_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: eventUrl,
    image: event.poster_url ? [event.poster_url] : undefined,
    location: {
      "@type": "Place",
      name: SCHOOL_NAME,
      address: profile.alamat
        ? { "@type": "PostalAddress", streetAddress: profile.alamat }
        : undefined,
    },
    organizer: {
      "@type": "Organization",
      name: SCHOOL_NAME,
      url: siteUrl,
    },
  };

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Navbar />

      <main className="pt-16 sm:pt-[72px]">
        <article className={articleVariants()}>
          <Link href="/event" className={backLinkVariants()}>
            <ArrowLeft className="h-4 w-4" />
            Semua event
          </Link>

          <div className={detailLayoutVariants()}>
            <div className={posterColumnVariants()}>
              <div className={posterFrameVariants()}>
                {event.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.poster_url}
                    alt={`Poster ${event.title}`}
                    fetchPriority="high"
                    className={posterImageVariants()}
                  />
                ) : (
                  <div className={posterFallbackVariants({ size: "detail" })}>
                    {event.title.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className={metaRowVariants()}>
                {event.category && (
                  <span
                    className={categoryBadgeVariants({
                      tone: categoryTone(event.category),
                    })}
                  >
                    {event.category}
                  </span>
                )}

                <time dateTime={event.event_date} className={dateVariants()}>
                  {formatDateOnly(event.event_date)}
                </time>
              </div>

              <h1 className={titleVariants()}>{event.title}</h1>

              {event.summary && (
                <p className={summaryVariants()}>{event.summary}</p>
              )}

              {paragraphs.length > 0 && (
                <div className={bodyVariants()}>
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className={paragraphVariants()}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={shareButtonVariants()}
              >
                <WhatsappIcon className="h-5 w-5" aria-hidden="true" />
                Bagikan ke WhatsApp
              </a>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
