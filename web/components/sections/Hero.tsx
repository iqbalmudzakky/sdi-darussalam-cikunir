import { ArrowRight } from "lucide-react";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import RegistrationDialog from "@/components/sections/RegistrationDialog";
import HeroStats, { type HeroStat } from "@/components/sections/HeroStats";
import { HeroMedia } from "@/components/sections/HeroMedia";

const STATS: HeroStat[] = [
  { value: 683, display: "683", label: "Siswa aktif" },
  { value: 65, display: "65", label: "Guru & staf" },
  { value: 16, display: "16", suffix: "+", label: "Tahun berdiri" },
  { value: null, display: "A", label: "Akreditasi" },
];

export default async function Hero() {
  const profile = await getSchoolProfile();

  return (
    <section className="relative bg-paper pt-16 sm:pt-[72px]">
      <div className="page-container pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-16">
          {/*
            Teks utama.

            Urutan DOM sengaja tetap teks lebih dulu supaya
            pembaca layar dan mesin pencari membaca judul
            sebelum foto. Yang dibalik hanya tampilannya
            di layar kecil.
          */}
          <div className="order-2 min-w-0 lg:order-1">
            <p className="intro text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">Sekolah Dasar Islam &middot; Terakreditasi A</p>

            <h1 className="font-display intro mt-5 text-[2.1rem] leading-[1.2] font-semibold text-balance text-ink-900 sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: "80ms" }}>
              Membentuk generasi yang <span className="text-brand-700">cerdas dan berakhlak karimah</span>
            </h1>

            <p className="intro mt-6 max-w-lg text-[17px] leading-relaxed text-ink-700" style={{ animationDelay: "160ms" }}>
              Sejak 2009 kami mendampingi anak-anak di Jaka Mulya tumbuh dengan dasar akademik yang kuat, hafalan Al-Qur&rsquo;an, dan kebiasaan baik yang terbawa sampai dewasa.
            </p>

            <div className="intro mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5" style={{ animationDelay: "240ms" }}>
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
            <HeroStats stats={STATS} />
          </div>

          {/*
            Media hero: video YouTube kalau diatur, selain itu foto gedung.

            Di desktop tingginya mengikuti kolom teks di
            sebelahnya, sehingga kedua kolom berakhir pada
            garis yang sama.
          */}
          <div className="intro intro-hero-photo relative order-1 lg:order-2 lg:h-full lg:min-h-[30rem]">
            <div className="aspect-4/3 overflow-hidden rounded-sm bg-brand-100 lg:absolute lg:inset-0 lg:aspect-auto">
              <HeroMedia
                photoUrl={profile.photo_url}
                videoUrl={profile.hero_video_url}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
