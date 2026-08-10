import { z } from "zod";

export const SaveActivityRequestSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi."),
  description: z.string().trim().default(""),
  emoji: z.string().trim().default(""),
  badge: z.string().trim().default(""),
  photo_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
  youtube_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export type SaveActivityRequest = z.infer<typeof SaveActivityRequestSchema>;
