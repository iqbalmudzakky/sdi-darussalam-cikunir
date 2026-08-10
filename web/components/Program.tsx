import { listPrograms } from "@/lib/data/programs";
import ProgramCards from "@/components/ProgramCards";

export default async function Program() {
  const programs = await listPrograms();

  return (
    <section id="program" className="scroll-mt-20 bg-gray-50 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-14 lg:mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Program Unggulan</h2>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-emerald-500" />

          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">Program-program berkualitas yang dirancang untuk mengembangkan potensi siswa secara holistik</p>
        </div>

        <ProgramCards programs={programs} />
      </div>
    </section>
  );
}
