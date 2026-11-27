export const NUMBER_WORDS = [
  "Nol",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
] as const;

export const SCHOOL_CITY = "Bekasi";

export const ADMISSION_LETTER_KIND = {
  statement: "statement",
  decision: "decision",
} as const;

export const ROMAN_NUMERALS = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

export const LETTER_NUMBER_CODE = "09/PMB-SDI-DC";

export const SCHOOL_LETTERHEAD = {
  foundation: "YAYASAN PEMBANGUNAN UMAT ISLAM DARUSSALAM",
  institution: "PERGURUAN ISLAM DARUSSALAM",
  school: "SEKOLAH DASAR ISLAM DARUSSALAM CIKUNIR",
  accreditation: "“TERAKREDITASI A”",
  address:
    "Jln. Cikunir Raya No 02A Jakamulya Bekasi Selatan 17146, Telp. 021 821 7157",
} as const;

export const DECISION_LETTER_TEXT = {
  accepted: {
    title: "Surat Keterangan Diterima",
    subject: "Keterangan diterima sekolah",
    result: "LULUS / Diterima",
  },
  rejected: {
    title: "Surat Keterangan Tidak Diterima",
    subject: "Keterangan tidak diterima sekolah",
    result: "TIDAK LULUS / Tidak Diterima",
  },
} as const;

export const ENTRY_AGE_NOTE = {
  enough: "Cukup",
  special: "Dengan persyaratan khusus",
} as const;

export const LETTER_NUMBER_PATTERN = /^(\d+)\..*\/(\d{4})$/;
