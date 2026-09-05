import type {
  ListRegistrationsParams,
  RegistrationListPage,
  RegistrationStatus,
  SubmitRegistrationInput,
  UpdateRegistrationStatusInput,
} from "@/types/Registration";
import type { ManualPaymentInput } from "@/types/Payment";

function buildStatusQuery(statuses: RegistrationStatus[]): URLSearchParams {
  const query = new URLSearchParams();
  for (const status of statuses) query.append("status", status);
  return query;
}

export async function listRegistrations(
  params: ListRegistrationsParams,
): Promise<RegistrationListPage> {
  const query = buildStatusQuery(params.statuses);
  query.set("search", params.search);
  query.set("sort", params.sort);
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));

  const res = await fetch(`/api/registrations?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to list registrations (${res.status})`);
  return res.json();
}

export function buildRegistrationsExportUrl(
  statuses: RegistrationStatus[],
): string {
  const query = buildStatusQuery(statuses).toString();
  return query
    ? `/api/registrations/export?${query}`
    : "/api/registrations/export";
}

export async function deleteRegistration(id: string): Promise<void> {
  const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete registration (${res.status})`);
}

export async function createManualRegistration(
  input: SubmitRegistrationInput,
  payment: ManualPaymentInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const body = {
    ...input,
    payment: {
      amount: payment.amount,
      payment_method: payment.paymentMethod,
      receipt_number: payment.receiptNumber,
      paid_at: payment.paidAt,
    },
  };

  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal menyimpan pendaftaran." };
  }

  return { ok: true };
}

export async function updateRegistrationStatus(
  id: string,
  input: UpdateRegistrationStatusInput,
): Promise<void> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to update registration status (${res.status})`);
}

export async function getPendingFollowUpCount(): Promise<number> {
  const res = await fetch("/api/registrations/pending-count");
  if (!res.ok) throw new Error(`Failed to get pending count (${res.status})`);
  const data = await res.json();
  return data.count;
}
