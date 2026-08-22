import { z } from "zod";

export const SaveFacilityRequestSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  subtitle: z.string().trim().default(""),
  emoji: z.string().trim().default(""),
  photo_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export type SaveFacilityRequest = z.infer<typeof SaveFacilityRequestSchema>;

export type FacilityResponse = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  photo_url: string | null;
};
