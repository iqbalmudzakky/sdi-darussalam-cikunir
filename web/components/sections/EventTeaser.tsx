import Link from "next/link";
import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import EventCard from "@/components/sections/EventCard";
import Reveal from "@/components/sections/Reveal";
import SectionHeading from "@/components/sections/SectionHeading";
import { listLatestPublishedEvents } from "@/lib/actions/events";

const TEASER_COUNT = 3;

const scrollTrackVariants = cva([
  "-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-1",
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "sm:mx-0 sm:mt-10 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-6",
  "sm:overflow-visible sm:px-0 sm:pb-0",
]);

const scrollItemVariants = cva([
  "w-[75%] shrink-0 snap-start",
  "sm:w-auto sm:shrink",
]);

const ctaLinkVariants = cva([
  "mt-10 inline-flex h-11 cursor-pointer items-center gap-2",
  "text-[15px] font-medium text-brand-700 transition-colors hover:text-brand-900",
]);

export default async function EventTeaser() {
  const events = await listLatestPublishedEvents(TEASER_COUNT);

  if (events.length === 0) return null;

  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Event Sekolah"
            title="Event Terbaru"
            description="Kabar kegiatan besar dan prestasi siswa, dari yang paling baru."
          />
        </Reveal>

        <div className={scrollTrackVariants()}>
          {events.map((event, index) => (
            <Reveal
              key={event.slug}
              as="div"
              delay={index * 80}
              className={scrollItemVariants()}
            >
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>

        <Link href="/event" className={ctaLinkVariants()}>
          Lihat semua event
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
