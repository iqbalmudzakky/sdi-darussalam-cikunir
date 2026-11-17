export const ADMIN_ROLES = [
  "principal",
  "vice_principal",
  "administration_staff",
  "teacher",
  "developer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type Permission =
  "manage_accounts" | "manage_admission_settings" | "manage_developer_accounts";

export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  principal: ["manage_accounts", "manage_admission_settings"],
  vice_principal: [],
  administration_staff: [],
  teacher: [],
  developer: [
    "manage_accounts",
    "manage_admission_settings",
    "manage_developer_accounts",
  ],
};
