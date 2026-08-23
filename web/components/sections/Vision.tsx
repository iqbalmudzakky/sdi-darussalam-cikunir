import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import VisionParallax from "@/components/sections/VisionParallax";

export default async function Vision() {
  const profile = await getSchoolProfile();

  /*
   * Kalau foto latar khusus belum diunggah, section ini
   * memakai foto profil sekolah supaya tidak tampil polos.
   */
  return (
    <VisionParallax
      photoUrl={profile.vision_photo_url ?? profile.photo_url}
      visi={profile.visi}
      misi={profile.misi}
    />
  );
}
