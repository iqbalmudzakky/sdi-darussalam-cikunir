export type Facility = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type NewFacility = Omit<Facility, "id" | "created_at" | "updated_at">;
