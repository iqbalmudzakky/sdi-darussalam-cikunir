import type {
  EditRegistrationForm,
  RegistrationDetailResponse,
  RegistrationDocumentResponse,
  RegistrationEditFormResponse,
  RegistrationFormAchievementResponse,
  RegistrationFormParentResponse,
  RegistrationFormRowResponse,
  RegistrationFormSectionResponse,
  RegistrationListItemResponse,
  RegistrationListResponse,
  UpdateRegistrationRequest,
} from "@/modules/registration-admin/dto";
import type {
  ObservationViewResponse,
  SaveObservationRequest,
} from "@/modules/observation/dto";
import type { TestReminderGroupResponse } from "@/modules/admission-test/dto";
import type {
  DecisionLetterViewResponse,
  SaveDecisionLetterRequest,
  SaveStatementRequest,
  StatementViewResponse,
} from "@/modules/admission-letter/dto";
import type { SharedDocumentsResult } from "@/modules/document/dto";
import type { useFullRegistrationForm } from "@/hooks/useFullRegistrationForm";
import type {
  FullFormLinkResult,
  FullFormRequest,
  SubmitFullFormResult,
} from "@/modules/registration-link/dto";
import type {
  CreateManualRegistrationResult,
  CreateShortRegistrationResult,
  ManualRegistrationRequest,
  ShortFormOptionsResponse,
} from "@/modules/registration-intake/dto";

export type Registration = RegistrationListItemResponse;

export type RegistrationDetail = RegistrationDetailResponse;

export type RegistrationDocument = RegistrationDocumentResponse;

export type RegistrationFullForm = NonNullable<RegistrationDetail["full_form"]>;

export type RegistrationSchedule = NonNullable<RegistrationDetail["schedule"]>;

export type RegistrationScheduleOptions =
  RegistrationDetail["schedule_options"];

export type RegistrationPaymentView = RegistrationDetail["payment"];

export type StatementView = StatementViewResponse;

export type StatementContent = StatementView["content"];

export type SaveStatementPayload = SaveStatementRequest;

export type SaveStatementResult =
  { ok: true; statement: StatementView } | { ok: false; error: string };

export type RegistrationLetter = RegistrationDetail["letters"][number];

export type DecisionLetterView = DecisionLetterViewResponse;

export type DecisionLetterContent = DecisionLetterView["content"];

export type SaveDecisionLetterPayload = SaveDecisionLetterRequest;

export type SaveDecisionLetterResult =
  { ok: true; letter: DecisionLetterView } | { ok: false; error: string };

export type SharedDocuments = SharedDocumentsResult;

export type RegistrationManualResult = NonNullable<
  RegistrationSchedule["manual_result"]
>;

export type ObservationView = ObservationViewResponse;

export type ObservationDimension = ObservationView["dimensions"][number];

export type SaveObservationPayload = SaveObservationRequest;

export type SaveObservationResult =
  { ok: true; observation: ObservationView } | { ok: false; error: string };

export type TestReminderGroup = TestReminderGroupResponse;

export type RegistrationFormSection = RegistrationFormSectionResponse;

export type RegistrationFormRow = RegistrationFormRowResponse;

export type RegistrationFormParent = RegistrationFormParentResponse;

export type RegistrationFormAchievement = RegistrationFormAchievementResponse;

export type RegistrationFullFormTab = "child" | "parents" | "contact";

export type RegistrationListPage = RegistrationListResponse;

export type ShortFormOptions = ShortFormOptionsResponse;

export type UpdateRegistrationInput = UpdateRegistrationRequest;

export type RegistrationStatus = Registration["status"];

export type RegistrationStatusAction = "cancel" | "reactivate" | "delete";

export type RegistrationProgram = NonNullable<Registration["program"]>;

export type RegistrationType = "siswa_baru" | "pindahan";

export type Gender = "laki_laki" | "perempuan";

export type RegistrationSortDirection = "asc" | "desc";

export type RegistrationListFilters = {
  scope: "" | "mine";
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

export type FullFormStep = "registration" | "child" | "parents" | "submit";

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

export type FullFormRegistrationState = {
  registration_type: RegistrationType;
  target_grade: string;
  program: string;
  academic_year: string;
  contact_name: string;
  contact_phone: string;
};

export type FullFormState = {
  registration: FullFormRegistrationState;
  student: FullFormStudentState;
  parent_email: string;
  father: FullFormParentState;
  mother: FullFormParentState;
  guardian: FullFormGuardianState;
  details: FullFormDetailsState;
  achievements: FullFormAchievementState[];
};

export type FullFormSection =
  "registration" | "student" | "father" | "mother" | "guardian" | "details";

export type RegistrationEditForm = RegistrationEditFormResponse;

export type EditRegistrationInput = EditRegistrationForm;

export type FullRegistrationFormInput =
  | { mode: "link"; token: string; form: FullFormData }
  | { mode: "manual" }
  | { mode: "edit"; form: RegistrationEditForm };

export type ManualRegistrationInput = ManualRegistrationRequest;

export type ManualRegistrationSubmitResult =
  | Extract<CreateManualRegistrationResult, { ok: true }>
  | {
      ok: false;
      error: string;
      fieldErrors: Record<string, string>;
    };

export type SendFormLinkResult =
  { ok: true; whatsappUrl: string } | { ok: false; error: string };

export type FullFormController = ReturnType<typeof useFullRegistrationForm>;
