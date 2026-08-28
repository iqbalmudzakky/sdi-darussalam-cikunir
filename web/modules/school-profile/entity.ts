export type SchoolProfile = {
  id: string;
  photo_url: string | null;
  vision_photo_url: string | null;
  /** Tautan YouTube untuk hero. Kalau diisi, video menggantikan photo_url. */
  hero_video_url: string;
  description: string;
  visi: string;
  misi: string[];
  alamat: string;
  telepon: string;
  whatsapp: string;
  whatsapp_message: string;
  email: string;
  jam_operasional: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  created_at: string;
  updated_at: string;
};

export type NewSchoolProfile = Omit<
  SchoolProfile,
  "id" | "created_at" | "updated_at"
>;
