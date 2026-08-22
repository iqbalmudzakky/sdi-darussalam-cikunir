export type Activity = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  badge: string;
  photo_url: string | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
};

export type NewActivity = Omit<Activity, "id" | "created_at" | "updated_at">;
