export const SIGNER_FIELDS = [
  { name: "principal_name", label: "Kepala sekolah" },
  { name: "committee_chair_name", label: "Ketua Panitia PMB" },
  { name: "director_name", label: "Direktur" },
] as const;

export const BANK_FIELDS = [
  { name: "bank_name", label: "Bank" },
  { name: "bank_account_number", label: "No. rekening" },
  { name: "bank_account_name", label: "Atas nama" },
] as const;

export const PROGRAM_FEE_FIELDS = [
  {
    name: "Tahfizh",
    yearly: "tahfizh_yearly_fee",
    july: "tahfizh_july_fee",
  },
  {
    name: "Unggulan",
    yearly: "unggulan_yearly_fee",
    july: "unggulan_july_fee",
  },
] as const;
