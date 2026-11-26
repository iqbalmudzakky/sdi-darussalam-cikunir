import type { AdminRole } from "@/types/account/Admin";

export { ADMIN_ROLE_LABEL } from "@/modules/shared/constant/account/role";

export const ADMIN_ROLE_DOT_CLASS: Record<AdminRole, string> = {
  principal: "bg-brand-600",
  vice_principal: "bg-blue-600",
  administration_staff: "bg-accent-500",
  teacher: "bg-gray-500",
  developer: "bg-purple-600",
};

export const ADMIN_ROLE_CHIP_CLASS: Record<AdminRole, string> = {
  principal: "border-brand-200 bg-brand-50 text-brand-700",
  vice_principal: "border-blue-200 bg-blue-50 text-blue-700",
  administration_staff: "border-accent-300 bg-accent-100 text-accent-700",
  teacher: "border-gray-200 bg-gray-100 text-gray-700",
  developer: "border-purple-200 bg-purple-50 text-purple-700",
};
