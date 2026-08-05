import { listFacilities } from "@/lib/data/facilities";

export default async function Facility() {
  const facilities = await listFacilities();

  return (
    <section id="fasilitas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fasilitas Sekolah
          </h2>
          <div className="w-24 h-1 bg-linear-to-r from-emerald-600 to-teal-600 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fasilitas lengkap dan modern untuk mendukung proses belajar mengajar
            yang optimal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300"
            >
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">{facility.emoji}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{facility.title}</h3>
              <p className="text-gray-600 text-sm">{facility.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
