import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type SessionUser = {
  id: string;
  email: string;
  role: "superadmin" | "admin";
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};
