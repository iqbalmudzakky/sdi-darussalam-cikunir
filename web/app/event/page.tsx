import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { cva } from "class-variance-authority";
import { ArrowRight } from "lucide-react";

import EventList from "@/components/sections/EventList";
import Footer from "@/components/sections/Footer";
import Navbar from "@/components/sections/Navbar";
import Reveal from "@/components/sections/Reveal";
import { listPublishedEvents } from "@/lib/actions/events";

export const dynamic = "force-dynamic";

const getEvents = cache(listPublishedEvents);

const PAGE_TITLE = "Event Sekolah | SD Islam Darussalam Cikunir";
const PAGE_DESCRIPTION =
  "Kabar kegiatan dan prestasi SD Islam Darussalam Cikunir: PMB, Akram, peringatan hari besar, hingga prestasi siswa.";

const sectionVariants = cva([
  "page-container pt-12 pb-20",
  "sm:pt-16 sm:pb-24 lg:pt-20",
]);

const eyebrowVariants = cva([
  "text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase",
]);

const pageTitleVariants = cva([
  "font-display mt-4 text-balance",
  "text-3xl leading-tight font-semibold text-ink-900 sm:text-[2.5rem]",
]);

const introVariants = cva(["mt-5 text-[17px] leading-relaxed text-ink-700"]);

const emptyStateVariants = cva([
  "mt-12 max-w-xl border-t border-brand-200 pt-10",
]);

const emptyTitleVariants = cva([
  "font-display text-xl font-semibold text-ink-900",
]);

const emptyTextVariants = cva([
  "mt-3 text-[15px] leading-relaxed text-ink-700",
]);

const emptyLinkVariants = cva([
  "mt-6 inline-flex h-11 cursor-pointer items-center gap-2",
  "text-[15px] font-medium text-brand-700 transition-colors hover:text-brand-900",
]);

export async function generateMetadata(): Promise<Metadata> {
  const events = await getEvents();
  const ogImage =
    events.find((event) => event.poster_url)?.poster_url ?? "/logo.png";

  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    alternates: {
      canonical: "/event",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: "/event",
      siteName: "SD Islam Darussalam Cikunir",
      locale: "id_ID",
      images: [{ url: ogImage, alt: "Event SD Islam Darussalam Cikunir" }],
    },
  };
}

export default async function EventPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-16 sm:pt-[72px]">
        <section className={sectionVariants()}>
          <Reveal className="max-w-3xl">
            <p className={eyebrowVariants()}>Event Sekolah</p>

            <h1 className={pageTitleVariants()}>Kabar dari sekolah</h1>

            <p className={introVariants()}>
              Penerimaan murid baru, kegiatan besar, dan prestasi siswa SD Islam
              Darussalam Cikunir.
            </p>
          </Reveal>

          {events.length > 0 ? (
            <EventList events={events} />
          ) : (
            <div className={emptyStateVariants()}>
              <p className={emptyTitleVariants()}>
                Belum ada event yang diterbitkan.
              </p>

              <p className={emptyTextVariants()}>
                Sambil menunggu, lihat kegiatan keseharian siswa di sekolah
                kami.
              </p>

              <Link href="/#kegiatan" className={emptyLinkVariants()}>
                Lihat kegiatan sekolah
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
