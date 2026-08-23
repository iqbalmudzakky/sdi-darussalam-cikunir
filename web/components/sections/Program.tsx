import { listPrograms } from "@/lib/actions/programs";
import ProgramCards from "@/components/sections/ProgramCards";
import SectionHeading from "@/components/sections/SectionHeading";

export default async function Program() {
  const programs = await listPrograms();

  return (
    <section id="program" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Program"
          title="Yang dipelajari anak setiap hari"
          description="Kurikulum nasional berjalan berdampingan dengan pembinaan Al-Qur'an dan pembiasaan ibadah harian."
        />

        <ProgramCards programs={programs} />
      </div>
    </section>
  );
}
