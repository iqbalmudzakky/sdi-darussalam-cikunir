import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import { removeStoragePhoto } from "@/modules/storage/storage";
import type { SaveSchoolProfileRequest, SchoolProfileResponse } from "./dto";

const PHOTO_BUCKET = "school-profile-photos";

const DEFAULT_SCHOOL_PROFILE_RESPONSE: SchoolProfileResponse = {
  photo_url: null,
  vision_photo_url: null,
  hero_video_url: "",
  description: "",
  visi: "",
  misi: [],
  alamat: "",
  telepon: "",
  whatsapp: "",
  whatsapp_message: "",
  email: "",
  jam_operasional: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
};

export async function getSchoolProfile(): Promise<SchoolProfileResponse> {
  const profile = await withDbLogging("schoolProfile.get", () =>
    repository.get(),
  );

  if (!profile) return DEFAULT_SCHOOL_PROFILE_RESPONSE;

  const response: SchoolProfileResponse = {
    photo_url: profile.photo_url,
    vision_photo_url: profile.vision_photo_url,
    hero_video_url: profile.hero_video_url,
    description: profile.description,
    visi: profile.visi,
    misi: profile.misi,
    alamat: profile.alamat,
    telepon: profile.telepon,
    whatsapp: profile.whatsapp,
    whatsapp_message: profile.whatsapp_message,
    email: profile.email,
    jam_operasional: profile.jam_operasional,
    facebook: profile.facebook,
    instagram: profile.instagram,
    tiktok: profile.tiktok,
    youtube: profile.youtube,
  };

  return response;
}

export async function saveSchoolProfile(
  input: SaveSchoolProfileRequest,
): Promise<SchoolProfileResponse> {
  const existing = await withDbLogging("schoolProfile.get", () =>
    repository.get(),
  );

  const saved = await withDbLogging("schoolProfile.upsert", () =>
    repository.upsert(input),
  );

  /*
   * Foto lama dihapus hanya kalau benar-benar tidak lagi
   * dirujuk kolom mana pun. Foto hero dan foto visi berbagi
   * satu bucket, jadi gambar yang sama bisa dipakai keduanya.
   */
  const stillReferenced = [input.photo_url, input.vision_photo_url];

  if (existing?.photo_url && !stillReferenced.includes(existing.photo_url)) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.photo_url);
  }

  if (
    existing?.vision_photo_url &&
    !stillReferenced.includes(existing.vision_photo_url)
  ) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.vision_photo_url);
  }

  const response: SchoolProfileResponse = {
    photo_url: saved.photo_url,
    vision_photo_url: saved.vision_photo_url,
    hero_video_url: saved.hero_video_url,
    description: saved.description,
    visi: saved.visi,
    misi: saved.misi,
    alamat: saved.alamat,
    telepon: saved.telepon,
    whatsapp: saved.whatsapp,
    whatsapp_message: saved.whatsapp_message,
    email: saved.email,
    jam_operasional: saved.jam_operasional,
    facebook: saved.facebook,
    instagram: saved.instagram,
    tiktok: saved.tiktok,
    youtube: saved.youtube,
  };

  return response;
}
