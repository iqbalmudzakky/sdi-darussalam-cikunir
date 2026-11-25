import type { PpdbRegistrationStatus } from "@/modules/registration/entity";

export const MAX_PARENT_INCOME = 1_000_000_000;
export const MAX_SIBLING_NUMBER = 30;
export const MAX_HEIGHT_CM = 250;
export const MAX_WEIGHT_KG = 250;
export const MAX_HEAD_CIRCUMFERENCE_CM = 100;

export const REGISTRATION_STATUSES = [
  "new",
  "scheduled",
  "tested",
  "accepted",
  "rejected",
  "cancelled",
] as const;

export const DECIDABLE_STATUSES: PpdbRegistrationStatus[] = [
  "tested",
  "accepted",
  "rejected",
];

export const INTERVIEW_ROLE_LABEL = {
  child: "Observer",
  parent: "Wawancara ortu",
} as const;

export const REGISTRATION_TYPES = ["siswa_baru", "pindahan"] as const;
export const REGISTRATION_PROGRAMS = ["tahfizh", "unggulan"] as const;
export const TARGET_GRADES = [2, 3, 4, 5, 6] as const;

export const REGISTRATION_STATUS_LABEL = {
  new: "Baru",
  scheduled: "Terjadwal",
  tested: "Sudah Tes",
  accepted: "Diterima",
  rejected: "Tidak Diterima",
  cancelled: "Batal",
} as const;

export const REGISTRATION_TYPE_LABEL = {
  siswa_baru: "PMB",
  pindahan: "Pindahan",
} as const;

export const REGISTRATION_PROGRAM_LABEL = {
  tahfizh: "Tahfizh",
  unggulan: "Unggulan",
} as const;

export const RECEIVED_DOCUMENT_LABEL = {
  birth_certificate: "Akta",
  family_card: "KK",
  father_id_card: "KTP Ayah",
  mother_id_card: "KTP Ibu",
  report_card: "Rapor",
  nisn: "NISN",
} as const;

export type ReceivedDocument = keyof typeof RECEIVED_DOCUMENT_LABEL;

const BASE_RECEIVED_DOCUMENTS: ReceivedDocument[] = [
  "birth_certificate",
  "family_card",
  "father_id_card",
  "mother_id_card",
];

export const RECEIVED_DOCUMENTS_BY_TYPE: Record<
  (typeof REGISTRATION_TYPES)[number],
  ReceivedDocument[]
> = {
  siswa_baru: BASE_RECEIVED_DOCUMENTS,
  pindahan: [...BASE_RECEIVED_DOCUMENTS, "report_card", "nisn"],
};

export const TARGET_ACADEMIC_YEAR_SPAN = 5;
export const MINIMUM_ENTRY_AGE_YEARS = 6;
export const SHORT_FORM_MAX_PER_IP_PER_HOUR = 10;
export const FORM_LINK_TTL_DAYS = 14;

export const TEST_TIME_SLOT = {
  firstMinute: 7 * 60,
  lastMinute: 16 * 60,
  stepMinutes: 15,
} as const;

export const REGISTRATION_FLOW_STEPS = [
  { label: "Form singkat", showsFee: false },
  { label: "Chat panitia", showsFee: false },
  { label: "Form lengkap", showsFee: false },
  { label: "Tes & wawancara", showsFee: true },
  { label: "Surat Keterangan Diterima", showsFee: false },
] as const;

export const SHORT_FORM_FLOW_STEP = { index: 1, badge: "Sekarang" } as const;
export const FULL_FORM_FLOW_STEP = {
  index: 3,
  badge: "Tunggu jadwal",
} as const;

export const REGISTRATION_FAILURE = {
  closed: { status: 403, message: "Pendaftaran belum dibuka." },
  invalid_year: { status: 400, message: "Tahun ajaran tidak tersedia." },
  rate_limited: {
    status: 429,
    message: "Terlalu banyak percobaan. Coba lagi nanti.",
  },
  duplicate: {
    status: 409,
    message: "Anak ini sudah terdaftar, Silahkan hubungi panitia",
  },
  not_found: { status: 404, message: "Pendaftar tidak ditemukan." },
  invalid_state: {
    status: 409,
    message: "Status pendaftar sudah berubah. Muat ulang halaman.",
  },
  expired_link: { status: 410, message: "Link sudah tidak berlaku." },
  manual_duplicate: {
    status: 409,
    message: "Anak ini sudah terdaftar. Cari namanya di daftar pendaftar.",
  },
  duplicate_nik: {
    status: 409,
    message: "NIK anak sudah terdaftar, silakan hubungi panitia",
  },
  past_schedule: {
    status: 400,
    message: "Waktu tes sudah lewat. Pilih tanggal dan jam berikutnya.",
  },
  forbidden_payment: {
    status: 403,
    message: "Hanya kepsek atau wakepsek yang bisa mengurus pembayaran.",
  },
  already_paid: { status: 409, message: "Pendaftar ini sudah lunas." },
  invalid_time: { status: 400, message: "Pilih jam tes dari daftar." },
  invalid_interviewer: { status: 400, message: "Pewawancara tidak ditemukan." },
  forbidden_interviewer: {
    status: 403,
    message: "Hanya kepsek atau wakepsek yang bisa memilih pewawancara lain.",
  },
  invalid_document: {
    status: 400,
    message: "Berkas tidak sesuai jenis pendaftaran.",
  },
  forbidden_result: {
    status: 403,
    message:
      "Hanya observer, kepsek, atau wakepsek yang bisa mengisi hasil tes.",
  },
  incomplete_observation: {
    status: 400,
    message: "Isi skor ke-56 indikator dulu.",
  },
  forbidden_decision: {
    status: 403,
    message:
      "Hanya pewawancara, kepsek, atau wakepsek yang bisa memutuskan hasil.",
  },
  no_schedule: {
    status: 409,
    message: "Atur jadwal tes dulu.",
  },
  future_test_date: {
    status: 400,
    message: "Tanggal tes tidak boleh melewati hari ini.",
  },
} as const;
