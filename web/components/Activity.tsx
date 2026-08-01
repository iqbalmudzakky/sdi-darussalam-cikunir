export default function Activity() {
  return (
    <section
      id="kegiatan"
      className="py-20 bg-linear-to-br from-emerald-50 via-teal-50 to-green-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Kegiatan & Ekstrakurikuler
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-emerald-600 to-teal-600 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Berbagai kegiatan untuk mengembangkan bakat dan minat siswa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">🎨</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Seni Kaligrafi
              </h3>
              <p className="text-gray-600">
                Mengasah kemampuan seni kaligrafi Arab dengan berbagai teknik
                dan media.
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Populer
            </div>
          </div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">🎤</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nasyid & Qiraah
              </h3>
              <p className="text-gray-600">
                Kelompok nasyid dan qiraah untuk mengembangkan bakat seni islami
                siswa.
              </p>
            </div>
          </div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">🥋</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Pencak Silat
              </h3>
              <p className="text-gray-600">
                Beladiri tradisional untuk membentuk mental dan fisik yang
                tangguh.
              </p>
            </div>
          </div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">🏀</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Basket & Futsal
              </h3>
              <p className="text-gray-600">
                Olahraga tim untuk melatih kerjasama dan jiwa kompetitif yang
                sehat.
              </p>
            </div>
          </div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">🤖</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Robotika & Coding
              </h3>
              <p className="text-gray-600">
                Pengenalan teknologi robotika dan pemrograman sejak dini.
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Baru
            </div>
          </div>

          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group">
            <div className="aspect-video bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                English Club
              </h3>
              <p className="text-gray-600">
                Klub bahasa Inggris untuk meningkatkan kemampuan berbicara dan
                menulis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-linear-to-r from-emerald-500 to-teal-600 rounded-3xl p-12 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-6">Prestasi Kami</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold mb-2">🥇</div>
                <p className="text-2xl font-bold mb-2">1st Place</p>
                <p className="text-emerald-100">
                  Lomba Tahfidz Tingkat Kota Bekasi 2025
                </p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">🥈</div>
                <p className="text-2xl font-bold mb-2">2nd Place</p>
                <p className="text-emerald-100">
                  Kompetisi Sains Madrasah Tingkat Provinsi
                </p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">🏆</div>
                <p className="text-2xl font-bold mb-2">Best School</p>
                <p className="text-emerald-100">
                  Sekolah Berprestasi Kecamatan Jatiasih
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
