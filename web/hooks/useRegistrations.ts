"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/useToast";
import {
  listRegistrations,
  submitShortRegistration,
} from "@/lib/api/registrations";
import { fetchShortFormOptions } from "@/lib/api/registrationWindow";
import type {
  ListRegistrationsParams,
  Registration,
  RegistrationListFilters,
  ShortFormOptions,
  ShortRegistrationInput,
  ShortRegistrationFormInput,
  ShortRegistrationValues,
} from "@/types/Registration";

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
