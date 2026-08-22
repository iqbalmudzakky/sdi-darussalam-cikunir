import { z } from "zod";

export const SaveAchievementRequestSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi."),
  description: z.string().trim().default(""),
  emoji: z.string().trim().default(""),
});

export type SaveAchievementRequest = z.infer<
  typeof SaveAchievementRequestSchema
>;

export type AchievementResponse = {
  id: string;
  emoji: string;
  title: string;
  description: string;
};
