import type { AdminRole } from "@/modules/shared/constant/role";

export type SessionInfo = {
  email: string;
  role: AdminRole;
};

export type SessionUser = {
  id: string;
  email: string;
  role: AdminRole;
};
