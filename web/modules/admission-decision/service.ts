import type { InterviewerIds } from "@/modules/admission-test/entity";
import * as admissionTestService from "@/modules/admission-test/service";
import type { SessionUser } from "@/modules/auth/dto";
import * as authService from "@/modules/auth/service";
import { withTransaction } from "@/modules/db/postgres";
import type { AdvanceStatusInput } from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import { DECIDABLE_STATUSES } from "@/modules/shared/constant/admission/registration";
import type {
  AdmissionProgressResponse,
  DecideFailureReason,
  DecideInput,
  ProgressInput,
  TestStatus,
} from "./dto";

export function getProgress(input: ProgressInput): AdmissionProgressResponse {
  const { schedule, actor, status } = input;
  const childInterviewerId = schedule?.child_interviewer?.id ?? null;
  const parentInterviewerId = schedule?.parent_interviewer?.id ?? null;
  const canRecord =
    status !== "cancelled" &&
    admissionTestService.canRecordResult(actor, childInterviewerId);
  const isManual = input.registrationType === "pindahan";
  const manualStatus: TestStatus = schedule?.manual_result
    ? "tested"
    : "not_tested";
  const testStatus = isManual
    ? manualStatus
    : (input.observationState ?? "not_tested");
  const isDecided = status === "accepted" || status === "rejected";
  const interviewerIds: InterviewerIds = {
    childInterviewerId,
    parentInterviewerId,
  };
  const canDecide = canDecideFor(actor, interviewerIds);

  const progress: AdmissionProgressResponse = {
    test_status: testStatus,
    can_start_test:
      canRecord && testStatus !== "tested" && (!isManual || schedule !== null),
    can_edit_test: canRecord && isManual && testStatus === "tested",
    decision: isDecided ? status : null,
    can_decide: DECIDABLE_STATUSES.includes(status) && canDecide,
    can_write_statement: status !== "cancelled" && canDecide,
  };
  return progress;
}

export function canDecideFor(
  actor: SessionUser,
  interviewerIds: InterviewerIds,
): boolean {
  return (
    authService.hasPermission(actor.role, "decide_admissions") ||
    actor.id === interviewerIds.childInterviewerId ||
    actor.id === interviewerIds.parentInterviewerId
  );
}

export async function decide(
  input: DecideInput,
): Promise<DecideFailureReason | null> {
  const { registrationId, actor } = input;
  const [registration, interviewerIds] = await Promise.all([
    registrationService.findFullById(registrationId),
    admissionTestService.findInterviewerIds(registrationId),
  ]);
  if (!registration) return "not_found";
  if (!DECIDABLE_STATUSES.includes(registration.status)) {
    return "invalid_state";
  }
  if (!canDecideFor(actor, interviewerIds)) return "forbidden_decision";

  const statusInput: AdvanceStatusInput = {
    id: registrationId,
    nextStatus: input.result,
    fromStatuses: DECIDABLE_STATUSES,
  };
  await withTransaction(async (tx) => {
    await registrationService.advanceStatusWithin(tx, statusInput);
  });
  return null;
}
