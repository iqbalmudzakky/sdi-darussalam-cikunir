import type { AdminRole } from "@/modules/shared/constant/account/role";

export const SCHOOL_NAME = "SD Islam Darussalam Cikunir";

/* Salinan hex dari app/globals.css — email tidak baca CSS/Tailwind. */
export const BRAND_600 = "#3d6749";
export const BRAND_100 = "#dfeae1";
export const BRAND_700 = "#33553d";

export const EMAIL_ROLE_CHIP: Record<
  AdminRole,
  { background: string; border: string; text: string; dot: string }
> = {
  principal: {
    background: "#f2f7f3",
    border: "#c1d6c6",
    text: "#33553d",
    dot: "#3d6749",
  },
  vice_principal: {
    background: "#eff6ff",
    border: "#bfdbfe",
    text: "#1d4ed8",
    dot: "#2563eb",
  },
  administration_staff: {
    background: "#f7ecdb",
    border: "#dcb87e",
    text: "#7d5a2d",
    dot: "#b8874a",
  },
  teacher: {
    background: "#f3f4f6",
    border: "#e5e7eb",
    text: "#374151",
    dot: "#6b7280",
  },
  developer: {
    background: "#faf5ff",
    border: "#e9d5ff",
    text: "#7e22ce",
    dot: "#9333ea",
  },
};
