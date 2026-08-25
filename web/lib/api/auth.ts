import type { SessionInfo } from "@/types/Auth";

export async function login(
  email: string,
  password: string,
): Promise<SessionInfo> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Login failed (${res.status})`);
  }

  return res.json();
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function refreshSession(): Promise<SessionInfo | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  if (!res.ok) return null;
  return res.json();
}

export async function forgotPassword(email: string): Promise<void> {
  await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function acceptInvite(
  token: string,
  password: string,
): Promise<
  | { ok: true; session: SessionInfo }
  | { ok: false; error: string; reason?: "invalid_token" | "expired" }
> {
  const res = await fetch("/api/auth/accept-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: data.error ?? "Gagal menerima undangan.",
      reason: data.reason,
    };
  }
  return { ok: true, session: await res.json() };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<
  | { ok: true; session: SessionInfo }
  | { ok: false; error: string; reason?: "invalid_token" | "expired" }
> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: data.error ?? "Gagal mereset password.",
      reason: data.reason,
    };
  }
  return { ok: true, session: await res.json() };
}
