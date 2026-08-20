import { z } from "zod";

export const SaveProgramRequestSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi"),
  description: z.string().trim().default(""),
  emoji: z.string().trim().default(""),
});

export type SaveProgramRequest = z.infer<typeof SaveProgramRequestSchema>;

export type ProgramResponse = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};
