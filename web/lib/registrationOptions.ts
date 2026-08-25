export const REGISTRATION_TYPE_OPTIONS = [
  { value: "siswa_baru", label: "Siswa Baru" },
  { value: "pindahan", label: "Pindahan" },
];

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

export function getOptionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
