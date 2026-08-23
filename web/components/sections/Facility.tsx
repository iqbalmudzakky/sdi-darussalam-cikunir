import { listFacilities } from "@/lib/actions/facilities";
import FacilityCards from "@/components/sections/FacilityCards";
import SectionHeading from "@/components/sections/SectionHeading";

export default async function Facility() {
  const facilities = await listFacilities();

  return (
    <section id="fasilitas" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Fasilitas"
          title="Ruang belajar dan penunjangnya"
          description="Ruang kelas, perpustakaan, musala, dan lapangan yang dipakai setiap hari oleh siswa."
        />

        <FacilityCards facilities={facilities} />
      </div>
    </section>
  );
}
