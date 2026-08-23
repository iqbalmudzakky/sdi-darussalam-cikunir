import { z } from "zod";

const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

export function normalizeWhatsappNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.startsWith("62")) {
    return `0${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.startsWith("8")) {
    return `0${digitsOnly}`;
  }

  return digitsOnly;
}

export function personName(label: string) {
  return z
    .string()
    .trim()
    .min(3, `${label} minimal 3 karakter.`)
    .max(80, `${label} maksimal 80 karakter.`)
    .regex(PERSON_NAME_PATTERN, `${label} hanya boleh berisi huruf.`);
}

export function phoneNumber(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .transform(normalizeWhatsappNumber)
    .refine(
      (value) => /^0\d{9,13}$/.test(value),
      `${label} tidak valid. Contoh: 081234567890.`,
    );
}

export function birthPlace(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(80, `${label} maksimal 80 karakter.`);
}

export function birthDate(label: string) {
  return z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} wajib diisi.`);
}
