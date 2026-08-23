import { ArrowRight } from "lucide-react";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import RegistrationDialog from "@/components/sections/RegistrationDialog";

const STATS = [
  { value: "683", label: "Siswa aktif" },
  { value: "65", label: "Guru & staf" },
  { value: "A", label: "Akreditasi" },
];

export default async function Hero() {
  const profile = await getSchoolProfile();

  return (
    <section className="relative bg-paper pt-16 sm:pt-[72px]">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Teks utama */}
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
              Sekolah Dasar Islam &middot; Terakreditasi A
            </p>

            <h1 className="font-display mt-5 text-[2.1rem] leading-[1.2] font-semibold text-balance text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Membentuk generasi yang{" "}
              <span className="text-brand-700">
                cerdas dan berakhlakulkarimah
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-700">
              Sejak 2009 kami mendampingi anak-anak di Jaka Setia tumbuh dengan
              dasar akademik yang kuat, hafalan Al-Qur&rsquo;an, dan kebiasaan
              baik yang terbawa sampai dewasa.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <RegistrationDialog variant="primary">
                Daftar tahun ajaran 2026/2027
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </RegistrationDialog>

              <a
                href="#tentang"
                className="
                  inline-flex cursor-pointer items-center justify-center
                  px-1 py-3.5 font-medium text-ink-700
                  underline decoration-brand-200 underline-offset-[6px]
                  transition-colors
                  hover:text-brand-700 hover:decoration-brand-500
                "
              >
                Kenali sekolah kami
              </a>
            </div>

            {/* Angka ringkas */}
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-brand-100 pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl font-semibold text-ink-900">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-sm text-ink-500">{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>

          {/* Foto sekolah */}
          <div className="relative">
            <div className="aspect-4/5 overflow-hidden rounded-sm bg-brand-100 sm:aspect-4/3 lg:aspect-4/5">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt="Gedung SDI Darussalam Cikunir"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center">
                  <p className="text-sm text-brand-700">
                    Foto gedung sekolah belum diunggah
                  </p>
                </div>
              )}
            </div>

            {/* Garis aksen tipis, bukan bayangan blok */}
            <div className="absolute -bottom-3 -left-3 -z-10 h-24 w-24 border-b border-l border-brand-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
