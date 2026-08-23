import Reveal from "@/components/sections/Reveal";

type VisionParallaxProps = {
  photoUrl: string | null;
  visi: string;
  misi: string[];
};

/*
 * Visi dan misi di atas latar yang diam ketika halaman
 * digulir.
 *
 * Latarnya seluruhnya CSS, tanpa listener scroll, sehingga
 * tidak ada perhitungan yang berjalan saat menggulir.
 */
export default function VisionParallax({
  photoUrl,
  visi,
  misi,
}: VisionParallaxProps) {
  return (
    <section id="visi-misi" className="fixed-bg-frame scroll-mt-20 bg-brand-900">
      {/* Lapisan foto yang diam */}
      <div className="fixed-bg-layer">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-800" />
        )}

        {/*
          Lapisan gelap menjaga teks tetap terbaca apa pun
          terangnya foto yang diunggah dari halaman admin.
        */}
        <div className="absolute inset-0 bg-ink-900/75" />
      </div>

      <div className="page-container relative z-10 flex min-h-svh flex-col justify-center py-24 sm:py-28 lg:py-32">
        <Reveal>
          <p className="text-[11px] font-medium tracking-[0.18em] text-white/60 uppercase">
            Visi &amp; Misi
          </p>
        </Reveal>

        {/* Visi */}
        <Reveal as="figure" className="mt-8 max-w-4xl" delay={80}>
          <blockquote>
            <p className="font-display text-[1.6rem] leading-[1.3] font-medium text-balance text-white sm:text-4xl lg:text-[2.75rem]">
              {visi}
            </p>
          </blockquote>

          <figcaption className="mt-6 flex items-center gap-3">
            <span className="h-px w-10 bg-white/40" />

            <span className="text-[11px] font-medium tracking-[0.18em] text-white/70 uppercase">
              Visi sekolah
            </span>
          </figcaption>
        </Reveal>

        {/* Misi */}
        {misi.length > 0 && (
          <Reveal className="mt-16 border-t border-white/15 pt-12" delay={160}>
            <h3 className="text-[11px] font-medium tracking-[0.18em] text-white/60 uppercase">
              Misi sekolah
            </h3>

            <ol className="mt-8 grid gap-x-12 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {misi.map((item, index) => (
                <li key={index} className="flex min-w-0 gap-4">
                  <span className="font-display shrink-0 text-sm text-white/50 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 text-[15px] leading-relaxed wrap-break-word text-white/90">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </div>
    </section>
  );
}
