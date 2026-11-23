import { z } from "zod";
import { BiodataFormSchema } from "@/modules/registration-biodata/dto";
import type { RegistrationFlowStepResponse } from "@/modules/registration-intake/dto";
import type {
  AchievementRow,
  DetailsFormRow,
  ParentFormRow,
} from "@/modules/registration-biodata/entity";
import { StudentFormSchema } from "@/modules/registration/dto";
import type {
  PpdbRegistrationFormRow,
  RegistrationType,
} from "@/modules/registration/entity";
import { requiredEmail } from "@/modules/validation/validators";

export const FullFormRequestSchema = BiodataFormSchema.extend({
  student: StudentFormSchema,
  parent_email: requiredEmail("Email"),
});

export type FullFormRequest = z.infer<typeof FullFormRequestSchema>;

export type FullFormValues = {
  student: PpdbRegistrationFormRow["student"];
  parent_email: string | null;
  father: ParentFormRow | null;
  mother: ParentFormRow | null;
  guardian: ParentFormRow | null;
  details: DetailsFormRow | null;
  achievements: AchievementRow[];
};

export type FullFormResponse = {
  registration_number: string | null;
  registration_type: RegistrationType;
  values: FullFormValues;
};

export type FullFormLinkResult =
  | { status: "valid"; form: FullFormResponse }
  | { status: "expired"; whatsapp_url: string | null };

export type SubmitFullFormInput = {
  token: string;
  request: FullFormRequest;
};

export type SubmitFullFormResult =
  | {
      ok: true;
      registration_number: string | null;
      flow_steps: RegistrationFlowStepResponse[];
    }
  | {
      ok: false;
      reason: "expired_link" | "duplicate_nik";
    };
