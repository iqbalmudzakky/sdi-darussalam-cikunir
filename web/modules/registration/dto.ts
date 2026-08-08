import { z } from "zod";
import type { Registration, RegistrationStatus } from "./entity";

export const CreateRegistrationRequestSchema = z.object({
  parent_name: z.string().trim().min(1, "Nama orang tua wajib diisi."),
  student_name: z.string().trim().min(1, "Nama calon siswa wajib diisi."),
  whatsapp: z.string().trim().min(1, "Nomor WhatsApp wajib diisi."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  message: z.string().trim().default(""),
});

export type CreateRegistrationRequest = z.infer<
  typeof CreateRegistrationRequestSchema
> & {
  ip_address: string;
};

export type CreateRegistrationResult =
  | { ok: true; registration: Registration }
  | { ok: false; reason: "rate_limited" | "duplicate"; message: string };

const REGISTRATION_STATUSES: [RegistrationStatus, ...RegistrationStatus[]] = [
  "pending",
  "in_progress",
  "completed",
];

export const UpdateRegistrationStatusRequestSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
});

export type UpdateRegistrationStatusRequest = z.infer<
  typeof UpdateRegistrationStatusRequestSchema
>;
