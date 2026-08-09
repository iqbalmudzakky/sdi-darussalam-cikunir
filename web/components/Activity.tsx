import { listActivities } from "@/lib/data/activities";
import ActivityContent from "@/components/ActivityContent";

export default async function Activity() {
  const activities = await listActivities();

  return (
    <section id="kegiatan" className="scroll-mt-20 bg-gray-50 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-4xl text-center sm:mb-14 lg:mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Kegiatan & Ekstrakurikuler</h2>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-emerald-500" />

          <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">Berbagai kegiatan untuk mengembangkan bakat dan minat siswa</p>
        </div>

        <ActivityContent activities={activities} />
      </div>
    </section>
  );
}
