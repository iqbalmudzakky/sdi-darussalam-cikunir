import {
  REGISTRATION_PROGRAM_LABEL,
  REGISTRATION_PROGRAMS,
  REGISTRATION_STATUS_LABEL,
  REGISTRATION_STATUSES,
  REGISTRATION_TYPE_LABEL,
  REGISTRATION_TYPES,
} from "@/modules/shared/constant/registration";
import {
  ACHIEVEMENT_CATEGORY_LABEL,
  ACHIEVEMENT_LEVEL_LABEL,
  EDUCATION_LEVEL_LABEL,
  INCOME_RANGE_LABEL,
  LIVING_ARRANGEMENT_LABEL,
  PARENT_OCCUPATION_LABEL,
  SPECIAL_NEEDS_LABEL,
  TRANSPORTATION_LABEL,
} from "@/modules/shared/constant/registrationForm";
import type { Registration } from "@/types/registration/Registration";

export { REGISTRATION_STATUS_LABEL };
export { PHONE_COUNTRIES } from "@/modules/shared/constant/phoneCountry";

export const REGISTRATION_TYPE_OPTIONS = [
  { value: "siswa_baru", label: "Siswa Baru" },
  { value: "pindahan", label: "Pindahan" },
];

export const REGISTRATION_STATUS_OPTIONS = REGISTRATION_STATUSES.map(
  (value) => ({ value, label: REGISTRATION_STATUS_LABEL[value] }),
);

export const REGISTRATION_PROGRAM_OPTIONS = REGISTRATION_PROGRAMS.map(
  (value) => ({ value, label: REGISTRATION_PROGRAM_LABEL[value] }),
);

export const REGISTRATION_JENIS_OPTIONS = REGISTRATION_TYPES.map((value) => ({
  value,
  label: REGISTRATION_TYPE_LABEL[value],
}));

export const GENDER_OPTIONS = [
  { value: "laki_laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
];

export const RELIGION_OPTIONS = [
  { value: "islam", label: "Islam" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
];

export const SPECIAL_NEEDS_OPTIONS = toOptions(SPECIAL_NEEDS_LABEL);
export const OCCUPATION_OPTIONS = toOptions(PARENT_OCCUPATION_LABEL);
export const EDUCATION_OPTIONS = toOptions(EDUCATION_LEVEL_LABEL);
export const INCOME_RANGE_OPTIONS = toOptions(INCOME_RANGE_LABEL);
export const TRANSPORTATION_OPTIONS = toOptions(TRANSPORTATION_LABEL);
export const LIVING_ARRANGEMENT_OPTIONS = toOptions(LIVING_ARRANGEMENT_LABEL);
export const ACHIEVEMENT_CATEGORY_OPTIONS = toOptions(
  ACHIEVEMENT_CATEGORY_LABEL,
);
export const ACHIEVEMENT_LEVEL_OPTIONS = toOptions(ACHIEVEMENT_LEVEL_LABEL);

export const PHYSICAL_DISABILITY_OPTIONS = [
  { value: "tidak_ada", label: "Tidak Ada" },
  { value: "ada", label: "Ada" },
];

export const PARENT_RELATIONSHIP_OPTIONS = [
  { value: "kandung", label: "Kandung" },
  { value: "tiri", label: "Tiri" },
  { value: "angkat", label: "Angkat" },
  { value: "wali", label: "Wali" },
];

export function getOptionLabel(
  options: { value: string; label: string }[],
  value: string | null,
): string {
  return (
    options.find((option) => option.value === value)?.label ?? value ?? "-"
  );
}

export function formatRegistrationSummary(
  item: Pick<
    Registration,
    "registration_type" | "target_grade" | "program" | "academic_year"
  >,
): string {
  const parts = [
    REGISTRATION_TYPE_LABEL[item.registration_type],
    item.target_grade && `Kelas ${item.target_grade}`,
    item.program && REGISTRATION_PROGRAM_LABEL[item.program],
    item.academic_year,
  ];

  return parts.filter(Boolean).join(" · ");
}

function toOptions(labels: Record<string, string>) {
  const options = Object.entries(labels).map(([value, label]) => ({
    value,
    label,
  }));
  return options;
}
