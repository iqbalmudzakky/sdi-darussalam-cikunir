export default function Footer() {
  return (
    <footer className="bg-linear-to-br from-emerald-900 to-teal-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">SD</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">SDI Darussalam</h3>
                <p className="text-emerald-200 text-sm">
                  Cikunir, Bekasi Selatan
                </p>
              </div>
            </div>
            <p className="text-emerald-100 leading-relaxed mb-4">
              Sekolah Dasar Islam yang mengintegrasikan kurikulum nasional
              dengan nilai-nilai keislaman untuk membentuk generasi cerdas dan
              berakhlak mulia.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Link Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#tentang"
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#program"
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  Program Unggulan
                </a>
              </li>
              <li>
                <a
                  href="#fasilitas"
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  Fasilitas
                </a>
              </li>
              <li>
                <a
                  href="#kegiatan"
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  Kegiatan
                </a>
              </li>
              <li>
                <a
                  href="#kontak"
                  className="text-emerald-100 hover:text-white transition-colors"
                >
                  Kontak
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Informasi Kontak</h3>
            <ul className="space-y-3 text-emerald-100">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 mt-1 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  Jl. Raya Alternatif Cibubur, Cikunir, Bekasi Selatan
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 mt-1 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>0812-XXXX-XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 mt-1 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>info@sdidarussalam.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-700/50 pt-8 text-center">
          <p className="text-emerald-200">
            © 2026 SDI Darussalam. All rights reserved. | Sekolah Dasar Islam
            Unggulan Bekasi Selatan
          </p>
        </div>
      </div>
    </footer>
  );
}
