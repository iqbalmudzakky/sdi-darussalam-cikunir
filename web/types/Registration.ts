export type RegistrationStatus = "pending" | "in_progress" | "not_registered" | "registered";

export type RegistrationType = "siswa_baru" | "pindahan";

export type Gender = "laki_laki" | "perempuan";

export type PhysicalDisability = "tidak_ada" | "ada";

export type ParentRelationship = "kandung" | "tiri" | "angkat" | "wali";

type RegistrationBiodata = {
  registration_type: RegistrationType;

  full_name: string;

  student_nik: string;

  gender: Gender;

  place_of_birth: string;

  date_of_birth: string;

  birth_order: number;

  sibling_count: number;

  current_address: string;

  physical_disability: PhysicalDisability;

  previous_school: string;

  nisn: string | null;

  father_status: ParentRelationship;

  father_name: string;

  father_nik: string;

  father_place_of_birth: string;

  father_date_of_birth: string;

  father_phone: string;

  father_income: number;

  mother_status: ParentRelationship;

  mother_name: string;

  mother_nik: string;

  mother_place_of_birth: string;

  mother_date_of_birth: string;

  mother_phone: string;

  mother_income: number;

  parent_email: string;
};

export type Registration = RegistrationBiodata & {
  id: string;

  ip_address: string | null;

  status: RegistrationStatus;

  created_at: string;
};

/*
 * Type baru untuk form PPDB.
 * Struktur mengikuti tabel:
 *
 * ppdb_registrations
 * ppdb_registration_students
 * ppdb_registration_parents
 * ppdb_registration_details
 */

export type SubmitPpdbRegistrationInput = {
  registration_type: RegistrationType;

  student: {
    full_name: string;

    nickname: string | null;

    nik: string;

    nisn?: string | null;

    gender: Gender;

    place_of_birth: string;

    date_of_birth: string;

    address: string;

    village: string | null;

    rt_rw: string | null;

    district: string | null;

    city: string | null;

    province: string | null;

    phone: string | null;

    birth_order: number;

    sibling_count: number;

    orphan_status: string | null;

    daily_language: string | null;

    citizenship: string;

    religion: string;

    physical_disability: PhysicalDisability;

    previous_school: string;

    previous_school_transfer: string | null;
  };

  parents: [
    {
      parent_type: "father";

      relationship_status: ParentRelationship;

      name: string;

      nik: string;

      place_of_birth: string;

      date_of_birth: string;

      religion: string | null;

      education: string | null;

      occupation: string | null;

      position: string | null;

      income: number | null;

      citizenship: string | null;

      phone: string;
    },
    {
      parent_type: "mother";

      relationship_status: ParentRelationship;

      name: string;

      nik: string;

      place_of_birth: string;

      date_of_birth: string;

      religion: string | null;

      education: string | null;

      occupation: string | null;

      position: string | null;

      income: number | null;

      citizenship: string | null;

      phone: string;
    },
  ];

  details: {
    living_with: string | null;

    distance_to_school: string | null;

    owned_vehicle: string | null;

    transportation_method: string | null;

    talent: string | null;

    blood_type: string | null;

    height: number | null;

    weight: number | null;

    head_circumference: number | null;
  };

  website?: string;
};

export type SubmitRegistrationInput = SubmitPpdbRegistrationInput;

export type UpdateRegistrationStatusInput = {
  status: RegistrationStatus;
};
