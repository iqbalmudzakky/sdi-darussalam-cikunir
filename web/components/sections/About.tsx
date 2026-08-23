import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import SectionHeading from "@/components/sections/SectionHeading";

export default async function About() {
  const profile = await getSchoolProfile();

  const paragraphs = profile.description
    .split("\n\n")
    .filter((paragraph) => paragraph.trim().length > 0);

  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="Tentang kami" title="Sekilas tentang sekolah" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Profil sekolah */}
          <div className="min-w-0">
            <div className="space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[17px] leading-[1.75] wrap-break-word text-ink-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/*
              Visi.

              Ditampilkan sebagai kutipan dengan tanda kutip
              serif besar sebagai jangkar visual, bukan garis
              tepi berwarna.
            */}
            <figure className="relative mt-12">
              <span
                aria-hidden="true"
                className="font-display pointer-events-none absolute -top-6 -left-1 text-[5rem] leading-none text-brand-200 select-none"
              >
                &ldquo;
              </span>

              <blockquote className="relative pt-4">
                <p className="font-display text-[1.35rem] leading-[1.45] wrap-break-word text-ink-900 sm:text-2xl">
                  {profile.visi}
                </p>
              </blockquote>

              <figcaption className="mt-5 flex items-center gap-3">
                <span className="h-px w-8 bg-brand-300" />
                <span className="text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
                  Visi sekolah
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Misi */}
          <div className="min-w-0">
            <div className="border border-brand-100 bg-brand-50/60 p-7 sm:p-9">
              <h3 className="font-display text-xl font-semibold text-ink-900">
                Misi kami
              </h3>

              <ol className="mt-6 space-y-5">
                {profile.misi.map((item, index) => (
                  <li key={index} className="flex min-w-0 gap-4">
                    <span className="font-display shrink-0 text-sm text-brand-500 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 text-[15px] leading-relaxed wrap-break-word text-ink-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
