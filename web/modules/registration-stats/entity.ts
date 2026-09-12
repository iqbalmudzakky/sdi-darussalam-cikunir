export type RegistrationStats = {
  academic_year: string;
  /** Pendaftar offline yang BELUM diinput lewat form manual — bukan totalnya. */
  offline_count: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type UpdateOfflineCountInput = {
  academicYear: string;
  offlineCount: number;
};
