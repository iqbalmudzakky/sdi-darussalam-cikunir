import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), "URL harus menggunakan http:// atau https://.");

export const UpdateMetaSettingRequestSchema = z.object({
  meta_title: z.string().trim().min(1, "Meta title wajib diisi."),

  meta_description: z.string().trim().min(1, "Meta description wajib diisi."),

  meta_keywords: z
    .array(z.string().trim())
    .default([])
    .transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0)),

  og_title: z.string().trim().default(""),
  og_description: z.string().trim().default(""),
  og_image_url: optionalUrlSchema.default(""),

  twitter_title: z.string().trim().default(""),
  twitter_description: z.string().trim().default(""),
  twitter_image_url: optionalUrlSchema.default(""),

  canonical_url: optionalUrlSchema.default(""),

  robots_index: z.boolean().default(true),
  robots_follow: z.boolean().default(true),

  favicon_url: optionalUrlSchema.default(""),
});

export type UpdateMetaSettingRequest = z.infer<typeof UpdateMetaSettingRequestSchema>;
