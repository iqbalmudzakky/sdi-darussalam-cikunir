import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import Reveal from "@/components/sections/Reveal";

export default async function About() {
  const profile = await getSchoolProfile();

  const paragraphs = profile.description
    .split("\n\n")
    .filter((paragraph) => paragraph.trim().length > 0);

  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="page-container">
        {/*
          Judul di kiri, isi di kanan.

          Lebar terpakai penuh tanpa memaksa paragraf
          dipecah menjadi kolom yang panjangnya timpang.
        */}
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-x-20">
          <Reveal>
            <p className="text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
              Tentang kami
            </p>

            <h2 className="font-display mt-4 text-3xl leading-tight font-semibold text-balance text-ink-900 sm:text-[2.5rem]">
              Sekilas tentang sekolah
            </h2>

            {/* Garis penanda, menahan kolom kiri agar tidak terasa menggantung */}
            <span
              aria-hidden="true"
              className="mt-8 hidden h-px w-16 bg-brand-300 lg:block"
            />
          </Reveal>

          <Reveal className="min-w-0" delay={80}>
            <div className="max-w-[78ch] space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-[17px] leading-[1.8] wrap-break-word text-ink-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
