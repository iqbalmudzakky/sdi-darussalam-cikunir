export function normalizeWhatsAppNumber(phone?: string | null): string {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}

export function buildWhatsAppLink(phone?: string | null, message?: string): string {
  const normalized = normalizeWhatsAppNumber(phone);

  if (!normalized) return "#";

  const base = `https://wa.me/${normalized}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
