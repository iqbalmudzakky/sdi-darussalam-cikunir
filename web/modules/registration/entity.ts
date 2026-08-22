export type RegistrationStatus = "pending" | "in_progress" | "completed";

export type Registration = {
  id: string;
  parent_name: string;
  student_name: string;
  whatsapp: string;
  email: string;
  message: string;
  ip_address: string | null;
  status: RegistrationStatus;
  created_at: string;
};

export type NewRegistration = Omit<
  Registration,
  "id" | "status" | "created_at"
>;
