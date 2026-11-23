"use client";

import { useEffect, useState } from "react";
import {
  createManualRegistration,
  submitFullForm,
} from "@/lib/api/registration/registrations";
import { fetchShortFormOptions } from "@/lib/api/registration/registrationWindow";
import type {
  FullFormAchievementState,
  FullFormData,
  FullFormInput,
  FullFormReceipt,
  FullFormSection,
  FullFormState,
  FullFormStep,
  FullFormSubmitResult,
  FullRegistrationFormInput,
  ManualRegistrationInput,
  ManualRegistrationSubmitResult,
  ShortFormOptions,
} from "@/types/registration/Registration";

export function useFullRegistrationForm(input: FullRegistrationFormInput) {
  const isManual = input.mode === "manual";
  const [values, setValues] = useState<FullFormState>(() =>
    toFullFormState(input.mode === "link" ? input.form : null),
  );
  const [step, setStep] = useState<FullFormStep>(
    isManual ? "registration" : "child",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<FullFormReceipt | null>(null);
  const [options, setOptions] = useState<ShortFormOptions | null>(null);

  const registrationType = values.registration.registration_type;
  const academicYears = options?.academic_years ?? [];
  const academicYear =
    values.registration.academic_year || academicYears[0] || "";

  useEffect(() => {
    if (!isManual) return;
    let cancelled = false;

    const load = async () => {
      const query = {
        registration_type: registrationType,
        full_name: "",
        birth_date: "",
        academic_year: "",
      };
      const nextOptions = await fetchShortFormOptions(query);
      if (!cancelled && nextOptions) setOptions(nextOptions);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isManual, registrationType]);

  function setSectionField(
    section: FullFormSection,
    field: string,
    value: string,
  ) {
    setValues((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setFieldErrors((prev) => ({ ...prev, [`${section}.${field}`]: "" }));
  }

  function setParentEmail(value: string) {
    setValues((prev) => ({ ...prev, parent_email: value }));
    setFieldErrors((prev) => ({ ...prev, parent_email: "" }));
  }

  function addAchievement() {
    const achievement: FullFormAchievementState = {
      category: "",
      level: "",
      name: "",
      year: "",
      organizer: "",
    };
    setValues((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievement],
    }));
  }

  function updateAchievement(index: number, field: string, value: string) {
    setValues((prev) => ({
      ...prev,
      achievements: prev.achievements.map((achievement, position) =>
        position === index ? { ...achievement, [field]: value } : achievement,
      ),
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [`achievements.${index}.${field}`]: "",
    }));
  }

  function removeAchievement(index: number) {
    setValues((prev) => ({
      ...prev,
      achievements: prev.achievements.filter(
        (_, position) => position !== index,
      ),
    }));
  }

  async function submit(): Promise<
    FullFormSubmitResult | ManualRegistrationSubmitResult | null
  > {
    if (isSubmitting) return null;
    setIsSubmitting(true);

    try {
      const result =
        input.mode === "link"
          ? await submitFullForm(input.token, toFullFormInput(values))
          : await createManualRegistration(
              toManualRegistrationInput(values, academicYear),
            );
      if (!result.ok) {
        setFieldErrors(result.fieldErrors);
      } else if ("flow_steps" in result) {
        setReceipt(result);
      }
      return result;
    } catch (error) {
      console.error("Failed to submit full form:", error);
      const failure: FullFormSubmitResult = {
        ok: false,
        error: "Gagal mengirim. Coba lagi.",
        fieldErrors: {},
      };
      return failure;
    } finally {
      setIsSubmitting(false);
    }
  }

  const controller = {
    mode: input.mode,
    registrationNumber:
      input.mode === "link" ? input.form.registration_number : null,
    values,
    academicYear,
    academicYears,
    targetGrades: options?.target_grades ?? [],
    step,
    fieldErrors,
    isSubmitting,
    receipt,
    setStep,
    setSectionField,
    setParentEmail,
    addAchievement,
    updateAchievement,
    removeAchievement,
    submit,
  };
  return controller;
}

function toFullFormState(form: FullFormData | null): FullFormState {
  const values = form?.values;
  const emptyParent = {
    name: "",
    birth_year: "",
    special_needs: "",
    nik: "",
    occupation: "",
    education: "",
    income_range: "",
    phone: "",
  };

  const state: FullFormState = {
    registration: {
      registration_type: "siswa_baru",
      target_grade: "",
      program: "",
      academic_year: "",
      contact_name: "",
      contact_phone: "",
    },
    student: toTextRecord(values?.student ?? {}) as FullFormState["student"],
    parent_email: values?.parent_email ?? "",
    father: { ...emptyParent, ...toTextRecord(values?.father ?? {}) },
    mother: { ...emptyParent, ...toTextRecord(values?.mother ?? {}) },
    guardian: { ...emptyParent, ...toTextRecord(values?.guardian ?? {}) },
    details: toTextRecord(
      values?.details ?? {
        living_with: null,
        transportation_method: null,
        height: null,
        weight: null,
        distance_km: null,
        travel_time_minutes: null,
      },
    ) as FullFormState["details"],
    achievements: (values?.achievements ?? []).map(
      (achievement) => toTextRecord(achievement) as FullFormAchievementState,
    ),
  };
  return state;
}

function toFullFormInput(state: FullFormState): FullFormInput {
  const guardian = state.guardian;

  const input = {
    student: {
      ...state.student,
      sibling_count: toNumber(state.student.sibling_count ?? ""),
      latitude: toNumber(state.student.latitude ?? ""),
      longitude: toNumber(state.student.longitude ?? ""),
    },
    parent_email: state.parent_email,
    father: { ...state.father, birth_year: toNumber(state.father.birth_year) },
    mother: { ...state.mother, birth_year: toNumber(state.mother.birth_year) },
    guardian: guardian.name.trim()
      ? {
          name: guardian.name,
          birth_year: toNumber(guardian.birth_year),
          occupation: guardian.occupation || null,
          education: guardian.education || null,
          income_range: guardian.income_range || null,
        }
      : null,
    details: {
      ...state.details,
      height: toNumber(state.details.height),
      weight: toNumber(state.details.weight),
      distance_km: toNumber(state.details.distance_km),
      travel_time_minutes: toNumber(state.details.travel_time_minutes),
    },
    achievements: state.achievements.map((achievement) => ({
      ...achievement,
      year: toNumber(achievement.year),
    })),
  };
  return input as unknown as FullFormInput;
}

function toManualRegistrationInput(
  state: FullFormState,
  academicYear: string,
): ManualRegistrationInput {
  const form = toFullFormInput(state);
  const registration = state.registration;

  const input = {
    ...form,
    registration: {
      ...registration,
      academic_year: academicYear,
      target_grade:
        registration.registration_type === "pindahan"
          ? toNumber(registration.target_grade)
          : null,
    },
    parent_email: state.parent_email || null,
    father: isBlank(state.father) ? null : form.father,
    mother: isBlank(state.mother) ? null : form.mother,
  };
  return input as unknown as ManualRegistrationInput;
}

function isBlank(record: Record<string, string>): boolean {
  return Object.values(record).every((value) => value.trim() === "");
}

function toTextRecord(record: object): Record<string, string> {
  const entries = Object.entries(record).map(([key, value]) => [
    key,
    value === null || value === undefined ? "" : String(value),
  ]);
  return Object.fromEntries(entries);
}

function toNumber(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  return trimmed === "" ? null : Number(trimmed);
}
