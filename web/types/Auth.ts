export type SessionInfo = {
  email: string;
  role: "superadmin" | "admin";
};

export type SessionUser = {
  id: string;
  email: string;
  role: "superadmin" | "admin";
};
