import { z } from "zod";
import type { AdminRole } from "@/modules/shared/constant/account/role";

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
  role: AdminRole;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type LoginResult =
  | { ok: true; tokens: TokenPair }
  | { ok: false; reason: "invalid_credentials" | "rate_limited" };
