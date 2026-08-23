import { listFacilities } from "@/lib/actions/facilities";
import FacilityCards from "@/components/sections/FacilityCards";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/sections/Reveal";

export default async function Facility() {
  const facilities = await listFacilities();

  return (
    <section id="fasilitas" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Fasilitas"
            title="Ruang belajar dan penunjangnya"
            description="Ruang kelas, perpustakaan, musala, dan lapangan yang dipakai setiap hari oleh siswa."
          />
        </Reveal>

        <FacilityCards facilities={facilities} />
      </div>
    </section>
  );
}
