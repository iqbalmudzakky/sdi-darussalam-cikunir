import { cva } from "class-variance-authority";
import { listFacilities } from "@/lib/data/facilities";

const facilityCardVariants = cva([
  "group relative aspect-square overflow-hidden rounded-2xl",
  "shadow-md hover:shadow-lg transition-all duration-300",
]);

const facilityFallbackVariants = cva([
  "absolute inset-0 flex items-center justify-center",
  "bg-linear-to-br from-emerald-500 to-teal-600",
]);

const facilityScrimVariants = cva([
  "absolute inset-0 transition-colors duration-300",
  "bg-linear-to-t from-black/70 via-black/10 to-transparent",
  "group-hover:from-black/90 group-hover:via-black/50",
]);

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
            <div key={facility.id} className={facilityCardVariants()}>
              {facility.photo_url ? (
                <img
                  src={facility.photo_url}
                  alt={facility.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className={facilityFallbackVariants()}>
                  <span className="text-6xl">{facility.emoji}</span>
                </div>
              )}
              <div className={facilityScrimVariants()} />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-bold text-white text-center">
                  {facility.title}
                </h3>
                {facility.subtitle && (
                  <p className="text-white/90 text-sm text-center mt-1 max-h-0 opacity-0 overflow-hidden transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100">
                    {facility.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
