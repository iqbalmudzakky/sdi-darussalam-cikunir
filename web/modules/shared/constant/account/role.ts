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
  | "decide_admissions"
  | "assign_leader_roles"
  | "delete_registrations";

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
    "assign_leader_roles",
    "view_admission_settings",
    "manage_admission_settings",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
    "delete_registrations",
  ],
  vice_principal: [
    "view_accounts",
    "manage_accounts",
    "view_admission_settings",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
    "delete_registrations",
  ],
  administration_staff: [],
  teacher: ["delete_registrations"],
  developer: [
    "view_accounts",
    "manage_accounts",
    "assign_leader_roles",
    "view_admission_settings",
    "manage_admission_settings",
    "manage_developer_accounts",
    "assign_interviewers",
    "manage_payments",
    "cancel_payments",
    "record_test_results",
    "manage_pmb_settings",
    "decide_admissions",
    "delete_registrations",
  ],
};

export const LEADER_ROLES: readonly AdminRole[] = [
  "principal",
  "vice_principal",
];
