import { EMPTY_FORM, type FormFields } from "./config";

const STORAGE_KEY = "ppdb-registration-draft";

/* Draft berisi data pribadi anak dan orang tua, jadi tidak disimpan
 * selamanya di komputer yang mungkin dipakai bersama. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredDraft = {
  savedAt: number;
  step: number;
  form: Partial<FormFields>;
};

export type LoadedDraft = {
  form: FormFields;
  step: number;
  savedAt: number;
};

/* null kalau tidak ada, kedaluwarsa, atau storage diblokir browser. */
export function loadDraft(): LoadedDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed?.form || typeof parsed.savedAt !== "number") return null;

    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      clearDraft();
      return null;
    }

    return {
      /* Digabung ke EMPTY_FORM supaya draft lama tetap bisa dimuat. */
      form: { ...EMPTY_FORM, ...parsed.form },
      step: parsed.step >= 1 && parsed.step <= 3 ? parsed.step : 1,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveDraft(form: FormFields, step: number): void {
  try {
    /* Honeypot tidak ikut disimpan: memulihkannya membuat pendaftar
     * dianggap bot. */
    const { website: _website, ...rest } = form;

    const draft: StoredDraft = {
      savedAt: Date.now(),
      step,
      form: rest,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* Storage penuh atau diblokir; form tetap jalan, hanya tidak tersimpan. */
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Draft akan kedaluwarsa sendiri. */
  }
}

export function isDraftMeaningful(form: FormFields): boolean {
  /* Dibandingkan dengan form kosong supaya dialog yang cuma dibuka tidak
   * ikut tersimpan. */
  return Object.keys(EMPTY_FORM).some((key) => {
    const field = key as keyof FormFields;
    if (field === "website") return false;
    return form[field] !== EMPTY_FORM[field];
  });
}
