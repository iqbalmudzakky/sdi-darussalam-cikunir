import type {
  RegistrationDetailResponse,
  RegistrationDocumentResponse,
  RegistrationFormAchievementResponse,
  RegistrationFormParentResponse,
  RegistrationFormRowResponse,
  RegistrationFormSectionResponse,
  RegistrationListItemResponse,
  RegistrationListResponse,
  UpdateRegistrationRequest,
} from "@/modules/registration-admin/dto";
import type { useFullRegistrationForm } from "@/hooks/useRegistrations";
import type {
  FullFormLinkResult,
  FullFormRequest,
  SubmitFullFormResult,
} from "@/modules/registration-link/dto";
import type {
  CreateShortRegistrationResult,
  ShortFormOptionsResponse,
} from "@/modules/registration-intake/dto";

export type Registration = RegistrationListItemResponse;

export type RegistrationDetail = RegistrationDetailResponse;

export type RegistrationDocument = RegistrationDocumentResponse;

export type RegistrationFullForm = NonNullable<RegistrationDetail["full_form"]>;

export type RegistrationFormSection = RegistrationFormSectionResponse;

export type RegistrationFormRow = RegistrationFormRowResponse;

export type RegistrationFormParent = RegistrationFormParentResponse;

export type RegistrationFormAchievement = RegistrationFormAchievementResponse;

export type RegistrationFullFormTab = "child" | "parents" | "contact";

export type RegistrationListPage = RegistrationListResponse;

export type ShortFormOptions = ShortFormOptionsResponse;

export type UpdateRegistrationInput = UpdateRegistrationRequest;

export type RegistrationStatus = Registration["status"];

export type RegistrationProgram = NonNullable<Registration["program"]>;

export type RegistrationType = "siswa_baru" | "pindahan";

export type Gender = "laki_laki" | "perempuan";

export type PhysicalDisability = "tidak_ada" | "ada";

export type ParentRelationship = "kandung" | "tiri" | "angkat" | "wali";

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

export type RegistrationSortDirection = "asc" | "desc";

export type RegistrationListFilters = {
  status: RegistrationStatus | "";
  academicYear: string;
  program: RegistrationProgram | "";
  registrationType: RegistrationType | "";
};

export type ListRegistrationsParams = RegistrationListFilters & {
  search: string;
  sort: RegistrationSortDirection;
  limit: number;
  offset: number;
};

export type ShortRegistrationValues = {
  full_name: string;
  gender: Gender | "";
  date_of_birth: string;
  previous_school: string;
  target_grade: string;
  program: RegistrationProgram | "";
  academic_year: string;
  contact_name: string;
  contact_phone: string;
  parent_email: string;
  website: string;
};

export type ShortRegistrationInput = Omit<
  ShortRegistrationValues,
  "target_grade"
> & {
  registration_type: RegistrationType;
  target_grade: number | null;
};

export type ShortRegistrationReceipt = Omit<
  Extract<CreateShortRegistrationResult, { ok: true }>,
  "ok"
>;

export type ShortRegistrationResult =
  | ({ ok: true } & ShortRegistrationReceipt)
  | {
      ok: false;
      error: string;
      fieldErrors: Record<string, string>;
      whatsappUrl: string | null;
    };

export type ShortRegistrationFormInput = {
  registrationType: RegistrationType;
  onSubmitted: (receipt: ShortRegistrationReceipt) => void;
};

export type ShortFormOptionsQuery = {
  registration_type: RegistrationType;
  full_name: string;
  birth_date: string;
  academic_year: string;
};

export type UpdateRegistrationResult =
  { ok: true; registration: RegistrationDetail } | { ok: false; error: string };

export type FullFormLink = FullFormLinkResult;

export type FullFormData = Extract<
  FullFormLinkResult,
  { status: "valid" }
>["form"];

export type FullFormInput = FullFormRequest;

export type FullFormReceipt = Omit<
  Extract<SubmitFullFormResult, { ok: true }>,
  "ok"
>;

export type FullFormSubmitResult =
  | ({ ok: true } & FullFormReceipt)
  | {
      ok: false;
      error: string;
      fieldErrors: Record<string, string>;
    };

export type FullFormStep = "child" | "parents" | "submit";

type FullFormValues = FullFormData["values"];

type AsText<T> = { [K in keyof T]-?: string };

export type FullFormStudentState = AsText<FullFormValues["student"]>;

export type FullFormParentState = AsText<
  Omit<NonNullable<FullFormValues["father"]>, "parent_type">
>;

export type FullFormGuardianState = Pick<
  FullFormParentState,
  "name" | "birth_year" | "occupation" | "education" | "income_range"
>;

export type FullFormDetailsState = AsText<
  NonNullable<FullFormValues["details"]>
>;

export type FullFormAchievementState = AsText<
  FullFormValues["achievements"][number]
>;

export type FullFormState = {
  student: FullFormStudentState;
  parent_email: string;
  father: FullFormParentState;
  mother: FullFormParentState;
  guardian: FullFormGuardianState;
  details: FullFormDetailsState;
  achievements: FullFormAchievementState[];
};

export type FullFormSection =
  "student" | "father" | "mother" | "guardian" | "details";

export type FullRegistrationFormInput = {
  token: string;
  form: FullFormData;
};

export type SendFormLinkResult =
  { ok: true; whatsappUrl: string } | { ok: false; error: string };

export type FullFormController = ReturnType<typeof useFullRegistrationForm>;
