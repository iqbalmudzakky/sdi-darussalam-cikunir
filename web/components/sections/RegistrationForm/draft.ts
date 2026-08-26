import { EMPTY_FORM, type FormFields } from "./config";

const STORAGE_KEY = "ppdb-registration-draft";

/**
 * Drafts hold a child's and both parents' personal data — name, NIK, address,
 * phone numbers — so they are not kept indefinitely on a possibly shared
 * computer. A week covers "I got interrupted and came back", which is the case
 * this exists for.
 */
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

/**
 * Reads a saved draft, or null when there is none, it has expired, or storage
 * is unavailable. Private windows and browsers with site data disabled throw
 * on access rather than returning empty, so every call is guarded.
 */
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
      // Merged onto EMPTY_FORM so a draft saved before a field was added still
      // loads, with the new field simply empty.
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
    // The honeypot is never restored: a value there marks the submission as a
    // bot, and reloading one would lock the applicant out of their own form.
    const { website: _website, ...rest } = form;

    const draft: StoredDraft = {
      savedAt: Date.now(),
      step,
      form: rest,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked — the form still works, it just will not resume.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the draft expires on its own.
  }
}

export function isDraftMeaningful(form: FormFields): boolean {
  // Citizenship fields default to "Indonesia", so comparing against the empty
  // form avoids saving a draft for someone who only opened the dialog.
  return Object.keys(EMPTY_FORM).some((key) => {
    const field = key as keyof FormFields;
    if (field === "website") return false;
    return form[field] !== EMPTY_FORM[field];
  });
}
