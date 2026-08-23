import { listPrograms } from "@/lib/actions/programs";
import ProgramCards from "@/components/sections/ProgramCards";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/sections/Reveal";

export default async function Program() {
  const programs = await listPrograms();

  return (
    <section id="program" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Program"
            title="Yang dipelajari anak setiap hari"
            description="Kurikulum nasional berjalan berdampingan dengan pembinaan Al-Qur'an dan pembiasaan ibadah harian."
          />
        </Reveal>

        <ProgramCards programs={programs} />
      </div>
    </section>
  );
}
