export const ADMIN_ROLES = [
  "principal",
  "vice_principal",
  "administration_staff",
  "teacher",
  "developer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type Permission =
  | "view_accounts"
  | "manage_accounts"
  | "view_admission_settings"
  | "manage_admission_settings"
  | "manage_developer_accounts"
  | "assign_interviewers"
  | "manage_payments"
  | "cancel_payments"
  | "record_test_results"
  | "manage_pmb_settings"
  | "decide_admissions";

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  principal: "Kepsek",
  vice_principal: "Wakepsek",
  administration_staff: "TU",
  teacher: "Guru",
  developer: "Admin",
};

export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  principal: [
    "view_accounts",
    "manage_accounts",
    "view_admission_settings",
    "manage_admission_settings",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
  ],
  vice_principal: [
    "view_accounts",
    "view_admission_settings",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
  ],
  administration_staff: [],
  teacher: [],
  developer: [
    "view_accounts",
    "manage_accounts",
    "view_admission_settings",
    "manage_admission_settings",
    "manage_developer_accounts",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
  ],
};
