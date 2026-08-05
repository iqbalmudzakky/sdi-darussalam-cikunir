import { cva } from "class-variance-authority";
import { getHeroContent } from "@/lib/data/hero";

const ctaPrimaryVariants = cva([
  "px-8 py-4 rounded-full font-semibold text-center",
  "bg-linear-to-r from-emerald-600 to-teal-600 text-white",
  "hover:shadow-lg hover:scale-105 transition-all duration-300",
]);

const ctaSecondaryVariants = cva([
  "px-8 py-4 rounded-full font-semibold text-center",
  "bg-white text-emerald-600 border-2 border-emerald-600",
  "hover:bg-emerald-50 transition-all duration-300",
]);

export default async function Hero() {
  const hero = await getHeroContent();

  return (
    <section className="relative pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50 to-green-50"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full">
              <span className="text-emerald-700 font-semibold text-sm">
                🌟 Sekolah Dasar Islam Unggulan
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {hero.headline_main}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600">
                {" "}
                {hero.headline_highlight}
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#kontak" className={ctaPrimaryVariants()}>
                Daftar Sekarang
              </a>
              <a href="#tentang" className={ctaSecondaryVariants()}>
                Pelajari Lebih Lanjut
              </a>
            </div>
            <div className="flex gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {hero.stat1_value}
                </p>
                <p className="text-gray-600">Tahun Berpengalaman</p>
              </div>
              <div className="border-l-2 border-gray-200"></div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {hero.stat2_value}
                </p>
                <p className="text-gray-600">Siswa Aktif</p>
              </div>
              <div className="border-l-2 border-gray-200"></div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">
                  {hero.stat3_value}
                </p>
                <p className="text-gray-600">Tenaga Pendidik</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-2">
              <div className="aspect-4/3 bg-linear-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center overflow-hidden">
                {hero.photo_url ? (
                  <img
                    src={hero.photo_url}
                    alt="Foto gedung sekolah"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-16 h-16 text-white"
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
                    <p className="text-gray-600 font-medium">
                      Foto Gedung Sekolah
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full bg-linear-to-br from-emerald-200 to-teal-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
