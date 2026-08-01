export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                SDI Darussalam Cikunir
              </h1>
              <p className="text-xs text-emerald-600">
                Kota Bekasi, Jawa Barat
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-8">
            <a
              href="#tentang"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Tentang
            </a>
            <a
              href="#program"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Program
            </a>
            <a
              href="#fasilitas"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Fasilitas
            </a>
            <a
              href="#kegiatan"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Kegiatan
            </a>
            <a
              href="#kontak"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
            >
              Kontak
            </a>
          </div>
          <button className="md:hidden text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
