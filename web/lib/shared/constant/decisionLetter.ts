export const DECISION_CHILD_FIELDS = [
  { name: "full_name", label: "Nama" },
  { name: "previous_school", label: "Asal Sekolah" },
  { name: "grade_label", label: "Kelas" },
  { name: "age_label", label: "Dengan Usia" },
] as const;

export const DECISION_BANK_FIELDS = [
  { name: "bank_name", label: "Bank" },
  { name: "bank_account_number", label: "No. A/C" },
  { name: "bank_account_name", label: "a/n" },
] as const;

export const DECISION_SIGNER_FIELDS = [
  { name: "principal_name", label: "Kepala sekolah" },
  { name: "committee_chair_name", label: "Ketua Panitia PMB" },
] as const;
