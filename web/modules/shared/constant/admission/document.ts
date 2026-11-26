export const DOCUMENT_FAILURE = {
  not_found: { status: 404, message: "Dokumen belum tersedia." },
  locked: {
    status: 403,
    message: "Dokumen bisa diunduh setelah biaya pendaftaran lunas.",
  },
} as const;

export const PROFILE_STATUS_LABEL = {
  waiting: "Setelah tes",
  locked: "Tunggu lunas",
  empty: null,
  ready: null,
} as const;
