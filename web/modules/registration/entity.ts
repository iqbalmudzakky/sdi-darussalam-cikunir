export type RegistrationStatus = "pending" | "in_progress" | "completed";
export type RegistrationType = "siswa_baru" | "pindahan";
export type Gender = "laki_laki" | "perempuan";
export type PhysicalDisability = "tidak_ada" | "ada";
export type ParentRelationship = "kandung" | "tiri" | "angkat" | "wali";

export type Registration = {
  id: string;
  registration_type: RegistrationType;
  full_name: string;
  gender: Gender;
  place_of_birth: string;
  date_of_birth: string;
  current_address: string;
  physical_disability: PhysicalDisability;
  previous_school: string;
  nisn: string | null;
  father_status: ParentRelationship;
  father_name: string;
  father_place_of_birth: string;
  father_date_of_birth: string;
  father_phone: string;
  mother_status: ParentRelationship;
  mother_name: string;
  mother_place_of_birth: string;
  mother_date_of_birth: string;
  mother_phone: string;
  parent_email: string;
  ip_address: string | null;
  status: RegistrationStatus;
  created_at: string;
};

export type NewRegistration = Omit<
  Registration,
  "id" | "status" | "created_at"
>;
