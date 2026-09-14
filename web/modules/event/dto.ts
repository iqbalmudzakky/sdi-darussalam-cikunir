import { z } from "zod";

export const SaveEventRequestSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi."),
  category: z.string().trim().default(""),
  summary: z.string().trim().default(""),
  body: z.string().trim().default(""),
  poster_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal peristiwa wajib diisi."),
  is_published: z.boolean().default(false),
});

export type SaveEventRequest = z.infer<typeof SaveEventRequestSchema>;

export type EventResponse = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  is_published: boolean;
};

export type PublicEventResponse = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  poster_url: string | null;
  event_date: string;
  updated_at: string;
};
