import type {
  AdminItem,
  InviteAdminInput,
  UpdateAdminInput,
} from "@/types/Admin";

export async function listAdmins(): Promise<AdminItem[]> {
  const res = await fetch("/api/admins");
  if (!res.ok) throw new Error(`Failed to list admins (${res.status})`);
  return res.json();
}

export async function inviteAdmin(
  input: InviteAdminInput,
): Promise<{ ok: true; admin: AdminItem } | { ok: false; error: string }> {
  const res = await fetch("/api/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal mengundang admin." };
  }
  return { ok: true, admin: await res.json() };
}

export async function updateAdmin(
  id: string,
  input: UpdateAdminInput,
): Promise<{ ok: true; admin: AdminItem } | { ok: false; error: string }> {
  const res = await fetch(`/api/admins/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal memperbarui admin." };
  }
  return { ok: true, admin: await res.json() };
}

export async function deleteAdmin(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal menghapus admin." };
  }
  return { ok: true };
}

export async function resendInvite(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/admins/${id}/resend-invite`, {
    method: "POST",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal mengirim ulang undangan." };
  }
  return { ok: true };
}
