export type Program = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  created_at: string;
  updated_at: string;
};

export type NewProgram = Omit<Program, "id" | "created_at" | "updated_at">;
