import type {
  EditRegistrationInput,
  FullFormInput,
  FullFormSubmitResult,
  ListRegistrationsParams,
  ManualRegistrationInput,
  ManualRegistrationSubmitResult,
  SendFormLinkResult,
  RegistrationDetail,
  RegistrationListPage,
  RegistrationStatus,
  ShortRegistrationInput,
  ShortRegistrationResult,
  UpdateRegistrationInput,
  UpdateRegistrationResult,
} from "@/types/registration/Registration";

function buildStatusQuery(statuses: RegistrationStatus[]): URLSearchParams {
  const query = new URLSearchParams();
  for (const status of statuses) query.append("status", status);
  return query;
}

export async function listRegistrations(
  params: ListRegistrationsParams,
): Promise<RegistrationListPage> {
  const query = buildStatusQuery(params.status ? [params.status] : []);
  query.set("search", params.search);
  query.set("academic_year", params.academicYear);
  query.set("program", params.program);
  query.set("registration_type", params.registrationType);
  query.set("sort", params.sort);
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));

  const res = await fetch(`/api/registrations?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to list registrations (${res.status})`);
  return res.json();
}

export async function getRegistration(
  id: string,
): Promise<RegistrationDetail | null> {
  const res = await fetch(`/api/registrations/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to get registration (${res.status})`);
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

export async function submitShortRegistration(
  input: ShortRegistrationInput,
): Promise<ShortRegistrationResult> {
  const res = await fetch("/api/registrations/short", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const failure: ShortRegistrationResult = {
      ok: false,
      error: data.error ?? "Gagal mengirim pendaftaran.",
      fieldErrors: data.field_errors ?? {},
      whatsappUrl: data.whatsapp_url ?? null,
    };
    return failure;
  }

  return data;
}

export async function createManualRegistration(
  input: ManualRegistrationInput,
): Promise<ManualRegistrationSubmitResult> {
  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const failure: ManualRegistrationSubmitResult = {
      ok: false,
      error: data.error ?? "Gagal menyimpan pendaftaran.",
      fieldErrors: data.field_errors ?? {},
    };
    return failure;
  }

  const result: ManualRegistrationSubmitResult = { ok: true, ...data };
  return result;
}

export async function updateRegistrationForm(
  id: string,
  form: EditRegistrationInput,
): Promise<ManualRegistrationSubmitResult> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update_form", form }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const failure: ManualRegistrationSubmitResult = {
      ok: false,
      error: data.error ?? "Gagal menyimpan perubahan.",
      fieldErrors: data.field_errors ?? {},
    };
    return failure;
  }

  const result: ManualRegistrationSubmitResult = {
    ok: true,
    id: data.id,
    registration_number: data.registration_number,
  };
  return result;
}

export async function markTestReminded(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mark_reminded" }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal menyimpan." };
  }
  return { ok: true };
}

export async function updateRegistration(
  id: string,
  input: UpdateRegistrationInput,
): Promise<UpdateRegistrationResult> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  const result: UpdateRegistrationResult = res.ok
    ? { ok: true, registration: data }
    : { ok: false, error: data.error ?? "Gagal menyimpan." };
  return result;
}

export async function getPendingFollowUpCount(): Promise<number> {
  const res = await fetch("/api/registrations/pending-count");
  if (!res.ok) throw new Error(`Failed to get pending count (${res.status})`);
  const data = await res.json();
  return data.count;
}

export async function submitFullForm(
  token: string,
  input: FullFormInput,
): Promise<FullFormSubmitResult> {
  const res = await fetch(`/api/registrations/form/${token}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const failure: FullFormSubmitResult = {
      ok: false,
      error: data.error ?? "Gagal mengirim form lengkap.",
      fieldErrors: data.field_errors ?? {},
    };
    return failure;
  }

  const result: FullFormSubmitResult = { ok: true, ...data };
  return result;
}

export async function sendFormLink(id: string): Promise<SendFormLinkResult> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send_form_link" }),
  });
  const data = await res.json().catch(() => ({}));

  const result: SendFormLinkResult = res.ok
    ? { ok: true, whatsappUrl: data.whatsapp_url }
    : { ok: false, error: data.error ?? "Gagal membuat link form lengkap." };
  return result;
}

export async function sendPaymentLink(id: string): Promise<SendFormLinkResult> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send_payment_link" }),
  });
  const data = await res.json().catch(() => ({}));

  const result: SendFormLinkResult = res.ok
    ? { ok: true, whatsappUrl: data.whatsapp_url }
    : { ok: false, error: data.error ?? "Gagal membuat link pembayaran." };
  return result;
}
