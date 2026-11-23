"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/useToast";
import {
  listRegistrations,
  submitFullForm,
  submitShortRegistration,
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
  FullRegistrationFormInput,
  ListRegistrationsParams,
  Registration,
  RegistrationListFilters,
  ShortFormOptions,
  ShortRegistrationInput,
  ShortRegistrationFormInput,
  ShortRegistrationValues,
} from "@/types/registration/Registration";

export function useShortRegistrationForm({
  registrationType,
  onSubmitted,
}: ShortRegistrationFormInput) {
  const [values, setValues] = useState<ShortRegistrationValues>({
    full_name: "",
    gender: "",
    date_of_birth: "",
    previous_school: "",
    target_grade: "",
    program: "",
    academic_year: "",
    contact_name: "",
    contact_phone: "",
    parent_email: "",
    website: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<ShortFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitWhatsAppUrl, setSubmitWhatsAppUrl] = useState<string | null>(
    null,
  );

  const academicYears = options?.academic_years ?? [];
  const academicYear = values.academic_year || academicYears[0] || "";
  const birthDate = values.date_of_birth;
  const yearForAge = birthDate ? academicYear : "";
  const nameForAge = birthDate ? values.full_name.trim() : "";

  useEffect(() => {
    let cancelled = false;
    const debounceMs = birthDate ? 400 : 0;

    const load = async () => {
      const query = {
        registration_type: registrationType,
        full_name: nameForAge,
        birth_date: birthDate,
        academic_year: yearForAge,
      };
      const nextOptions = await fetchShortFormOptions(query);
      if (!cancelled && nextOptions) setOptions(nextOptions);
    };

    const timer = setTimeout(load, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [registrationType, birthDate, yearForAge, nameForAge]);

  function setField(field: keyof ShortRegistrationValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitWhatsAppUrl(null);

    const input: ShortRegistrationInput = {
      ...values,
      registration_type: registrationType,
      academic_year: academicYear,
      target_grade: values.target_grade ? Number(values.target_grade) : null,
    };

    try {
      const result = await submitShortRegistration(input);
      if (result.ok) {
        onSubmitted(result);
        return;
      }
      setFieldErrors(result.fieldErrors);
      setSubmitError(result.error);
      setSubmitWhatsAppUrl(result.whatsappUrl);
    } catch (error) {
      console.error("Failed to submit short registration:", error);
      setSubmitError("Gagal mengirim. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const form = {
    values,
    fieldErrors,
    academicYear,
    academicYears,
    targetGrades: options?.target_grades ?? [],
    underAge: options?.under_age ?? null,
    isSubmitting,
    submitError,
    submitWhatsAppUrl,
    setField,
    handleSubmit,
  };
  return form;
}

export function useRegistrationList() {
  const toast = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<RegistrationListFilters>({
    status: "",
    academicYear: "",
    program: "",
    registrationType: "",
  });
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    const debounceMs = 600;
    const timer = setTimeout(() => setSearch(searchInput.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsRefreshing(true);
      setLoadError(false);

      try {
        const params = buildListParams(filters, search, 0);
        const page = await listRegistrations(params);
        if (cancelled) return;
        setItems(page.items);
        setTotal(page.total);
        setHasMore(page.has_more);
        setAcademicYears(page.academic_years);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load registrations:", error);
        setLoadError(true);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [search, filters]);

  async function loadMore() {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;

    try {
      const params = buildListParams(filters, search, items.length);
      const page = await listRegistrations(params);
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
      setHasMore(page.has_more);
    } catch (error) {
      console.error("Failed to load more registrations:", error);
      setHasMore(false);
      toast.error("Gagal memuat data berikutnya", "Coba refresh halaman.");
    } finally {
      isLoadingMoreRef.current = false;
    }
  }

  function changeFilters(patch: Partial<RegistrationListFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  const filterValues = Object.values(filters);
  const hasActiveFilter =
    search !== "" || filterValues.some((value) => value !== "");

  const list = {
    items,
    academicYears,
    total,
    hasMore,
    isLoading,
    isRefreshing,
    loadError,
    searchInput,
    filters,
    hasActiveFilter,
    setSearchInput,
    changeFilters,
    loadMore,
  };
  return list;
}

export function useFullRegistrationForm({
  token,
  form,
}: FullRegistrationFormInput) {
  const [values, setValues] = useState<FullFormState>(() =>
    toFullFormState(form),
  );
  const [step, setStep] = useState<FullFormStep>("child");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [receipt, setReceipt] = useState<FullFormReceipt | null>(null);

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

  async function submit(): Promise<Record<string, string> | null> {
    if (isSubmitting) return null;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const input = toFullFormInput(values);
      const result = await submitFullForm(token, input);
      if (result.ok) {
        setReceipt(result);
        return null;
      }
      setFieldErrors(result.fieldErrors);
      setSubmitError(result.error);
      return result.fieldErrors;
    } catch (error) {
      console.error("Failed to submit full form:", error);
      setSubmitError("Gagal mengirim. Coba lagi.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  const controller = {
    registrationNumber: form.registration_number,
    registrationType: form.registration_type,
    values,
    step,
    fieldErrors,
    isSubmitting,
    submitError,
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

function buildListParams(
  filters: RegistrationListFilters,
  search: string,
  offset: number,
): ListRegistrationsParams {
  const params: ListRegistrationsParams = {
    ...filters,
    search,
    sort: "desc",
    limit: 10,
    offset,
  };
  return params;
}

function toFullFormState(form: FullFormData): FullFormState {
  const { values } = form;
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
    student: toTextRecord(values.student) as FullFormState["student"],
    parent_email: values.parent_email ?? "",
    father: { ...emptyParent, ...toTextRecord(values.father ?? {}) },
    mother: { ...emptyParent, ...toTextRecord(values.mother ?? {}) },
    guardian: { ...emptyParent, ...toTextRecord(values.guardian ?? {}) },
    details: toTextRecord(
      values.details ?? {
        living_with: null,
        transportation_method: null,
        height: null,
        weight: null,
        distance_km: null,
        travel_time_minutes: null,
      },
    ) as FullFormState["details"],
    achievements: values.achievements.map(
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
      sibling_count: toNumber(state.student.sibling_count),
      latitude: toNumber(state.student.latitude),
      longitude: toNumber(state.student.longitude),
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
