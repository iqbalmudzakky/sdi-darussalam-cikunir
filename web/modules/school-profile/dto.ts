import { z } from "zod";

export const SaveSchoolProfileRequestSchema = z.object({
  photo_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
  description: z.string().trim().default(""),
  visi: z.string().trim().default(""),
  misi: z.array(z.string()).default([]),
  alamat: z.string().trim().default(""),
  telepon: z.string().trim().default(""),
  whatsapp: z.string().trim().default(""),
  whatsapp_message: z.string().trim().default(""),
  email: z.string().trim().default(""),
  jam_operasional: z.string().trim().default(""),
  facebook: z.string().trim().default(""),
  instagram: z.string().trim().default(""),
  tiktok: z.string().trim().default(""),
  youtube: z.string().trim().default(""),
});

export type SaveSchoolProfileRequest = z.infer<
  typeof SaveSchoolProfileRequestSchema
>;

export type SchoolProfileResponse = {
  photo_url: string | null;
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
};
