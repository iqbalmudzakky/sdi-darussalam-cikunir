import { listFacilities } from "@/lib/actions/facilities";
import FacilityCards from "@/components/sections/FacilityCards";

export default async function Facility() {
  const facilities = await listFacilities();

  return (
    <section
      id="fasilitas"
      className="scroll-mt-20 bg-white py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-14 lg:mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Fasilitas Sekolah
          </h2>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-emerald-500" />

          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
            Fasilitas lengkap dan modern untuk mendukung proses belajar mengajar
            yang optimal
          </p>
        </div>

        {/* Facility Cards */}
        <FacilityCards facilities={facilities} />
      </div>
    </section>
  );
}
