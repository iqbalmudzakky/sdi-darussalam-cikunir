import { listActivities } from "@/lib/actions/activities";
import { listAchievements } from "@/lib/actions/achievements";
import ActivityContent from "@/components/sections/ActivityContent";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/sections/Reveal";

export default async function Activity() {
  const [activities, achievements] = await Promise.all([
    listActivities(),
    listAchievements(),
  ]);

  return (
    <section id="kegiatan" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Kegiatan"
            title="Di luar jam pelajaran"
            description="Ekstrakurikuler dan kegiatan sekolah yang membuat anak menemukan minatnya sendiri."
          />
        </Reveal>

        <ActivityContent activities={activities} achievements={achievements} />
      </div>
    </section>
  );
}
