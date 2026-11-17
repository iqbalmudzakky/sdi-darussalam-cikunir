import type { AdminRole } from "@/types/Admin";

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  principal: "Kepsek",
  vice_principal: "Wakepsek",
  administration_staff: "TU",
  teacher: "Guru",
  developer: "Admin",
};

export const ADMIN_ROLE_DOT_CLASS: Record<AdminRole, string> = {
  principal: "bg-brand-600",
  vice_principal: "bg-blue-600",
  administration_staff: "bg-accent-500",
  teacher: "bg-gray-500",
  developer: "bg-purple-600",
};
