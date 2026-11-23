import { z } from "zod";
import {
  BiodataFormSchema,
  type FullFormValues,
} from "@/modules/registration-biodata/dto";
import type { RegistrationFlowStepResponse } from "@/modules/registration-intake/dto";
import { StudentFormSchema } from "@/modules/registration/dto";
import type { RegistrationType } from "@/modules/registration/entity";
import { requiredEmail } from "@/modules/validation/validators";

export const FullFormRequestSchema = BiodataFormSchema.extend({
  student: StudentFormSchema,
  parent_email: requiredEmail("Email"),
});

export type FullFormRequest = z.infer<typeof FullFormRequestSchema>;

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
