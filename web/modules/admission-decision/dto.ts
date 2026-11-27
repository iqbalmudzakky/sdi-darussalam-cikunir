import { z } from "zod";
import type { ScheduleResponse } from "@/modules/admission-test/dto";
import type { SessionUser } from "@/modules/auth/dto";
import type {
  PpdbRegistrationStatus,
  RegistrationType,
} from "@/modules/registration/entity";

export const DecisionResultSchema = z.enum(["accepted", "rejected"], {
  error: "Pilih Diterima atau Tidak Diterima.",
});

export type DecisionResult = z.infer<typeof DecisionResultSchema>;

export type TestStatus = "not_tested" | "in_progress" | "tested";

export type ProgressInput = {
  status: PpdbRegistrationStatus;
  registrationType: RegistrationType;
  schedule: ScheduleResponse | null;
  observationState: TestStatus | null;
  hasDecisionLetter: boolean;
  actor: SessionUser;
};

export type AdmissionProgressResponse = {
  test_status: TestStatus;
  can_start_test: boolean;
  can_edit_test: boolean;
  decision: DecisionResult | null;
  can_decide: boolean;
  can_write_statement: boolean;
  can_write_decision_letter: boolean;
};

export type DecideInput = {
  registrationId: string;
  result: DecisionResult;
  hasDecisionLetter: boolean;
  actor: SessionUser;
};

export type DecideFailureReason =
  "not_found" | "invalid_state" | "forbidden_decision" | "locked_decision";
