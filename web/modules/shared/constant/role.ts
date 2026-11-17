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
  | "manage_developer_accounts";

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
  ],
  vice_principal: ["view_accounts", "view_admission_settings"],
  administration_staff: [],
  teacher: [],
  developer: [
    "view_accounts",
    "manage_accounts",
    "view_admission_settings",
    "manage_admission_settings",
    "manage_developer_accounts",
  ],
};
