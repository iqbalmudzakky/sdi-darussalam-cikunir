export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type NewAchievement = Omit<
  Achievement,
  "id" | "created_at" | "updated_at"
>;
