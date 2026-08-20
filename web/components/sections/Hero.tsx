import { cva } from "class-variance-authority";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";

const ctaPrimaryVariants = cva([
  "px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-center",
  "bg-linear-to-r from-emerald-600 to-teal-600 text-white",
  "hover:shadow-lg sm:hover:scale-105 transition-all duration-300",
]);

const ctaSecondaryVariants = cva([
  "px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-semibold text-center",
  "bg-white text-emerald-600 border-2 border-emerald-600",
  "hover:bg-emerald-50 transition-all duration-300",
]);

export default async function Hero() {
  const profile = await getSchoolProfile();

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50 to-green-50"></div>

      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-0 h-48 w-48 rounded-full bg-emerald-400 blur-3xl sm:left-10 sm:h-72 sm:w-72"></div>
        <div className="absolute right-0 bottom-20 h-64 w-64 rounded-full bg-teal-400 blur-3xl sm:right-10 sm:h-96 sm:w-96"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Hero Content */}
          <div className="min-w-0 space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-block rounded-full bg-emerald-100 px-3 py-2 sm:px-4">
              <span className="text-xs font-semibold text-emerald-700 sm:text-sm">
                🌟 Sekolah Dasar Islam Unggulan
              </span>
            </div>

            {/* Heading */}
            <h1 className="break-words text-3xl leading-tight font-bold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
              Membentuk Generasi
              <span className="block bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Cerdas & Berakhlakulkarimah
              </span>
            </h1>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a href="#kontak" className={ctaPrimaryVariants()}>
                Daftar Sekarang
              </a>

              <a href="#tentang" className={ctaSecondaryVariants()}>
                Pelajari Lebih Lanjut
              </a>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 pt-4 sm:pt-8">
              <div className="min-w-0 pr-2 text-center sm:pr-5 sm:text-left">
                <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">
                  15+
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base">
                  Tahun Berpengalaman
                </p>
              </div>

              <div className="min-w-0 px-2 text-center sm:px-5 sm:text-left">
                <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">
                  683
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base">
                  Siswa Aktif
                </p>
              </div>

              <div className="min-w-0 pl-2 text-center sm:pl-5 sm:text-left">
                <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">
                  65
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base">
                  Tenaga Pendidik
                </p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10 rounded-3xl bg-white p-2 shadow-2xl">
              <div className="aspect-4/3 flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt="Foto gedung sekolah"
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="px-4 text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 sm:h-32 sm:w-32">
                      <svg
                        className="h-12 w-12 text-white sm:h-16 sm:w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-medium text-gray-600 sm:text-base">
                      Foto Gedung Sekolah
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Shadow */}
            <div className="absolute -right-3 -bottom-3 h-full w-full rounded-3xl bg-linear-to-br from-emerald-200 to-teal-200 sm:-right-4 sm:-bottom-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
