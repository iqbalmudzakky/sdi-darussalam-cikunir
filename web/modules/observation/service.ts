import type { SessionUser } from "@/modules/auth/dto";
import * as authService from "@/modules/auth/service";
import * as admissionTestService from "@/modules/admission-test/service";
import { withDbLogging } from "@/modules/db/errors";
import { withTransaction } from "@/modules/db/postgres";
import type { AdvanceStatusInput } from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import {
  DIMENSION_CATEGORY_LABEL,
  OBSERVATION_DIMENSIONS,
  OBSERVATION_INDICATOR_COUNT,
  OBSERVATION_MAX_SCORE,
  READINESS_CONCLUSION_LABEL,
  READINESS_THRESHOLD,
  READINESS_TONE,
} from "@/modules/shared/constant/observation";
import { calculateEntryAge } from "@/modules/shared/entryAge";
import { jakartaDateKey } from "@/modules/shared/jakartaDate";
import { toStaffName } from "@/modules/shared/staffName";
import * as repository from "./repository";
import type {
  ObservationDimensionResponse,
  ObservationIndicatorResponse,
  ObservationSummaryResponse,
  ObservationViewResponse,
  ReadinessProfileResponse,
  SaveObservationFailureReason,
  SaveObservationRequestInput,
  SaveObservationResult,
} from "./dto";
import type { ObservationScoreRow, SaveObservationInput } from "./entity";

type ReadinessLevel = keyof typeof READINESS_TONE;

export async function getSummary(
  registrationId: string,
): Promise<ObservationSummaryResponse> {
  const [row, scores, accounts] = await Promise.all([
    withDbLogging("observation.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
    withDbLogging("observation.listScores", () =>
      repository.listScores(registrationId),
    ),
    authService.listAccounts(),
  ]);
  const { profile } = toReadiness(scores);
  const observer = accounts.find((account) => account.id === row?.observer_id);
  const state = row?.completed_at ? "tested" : "in_progress";

  const summary: ObservationSummaryResponse = {
    state: row ? state : "not_tested",
    score_label: profile.score_label,
    ratio: profile.ratio,
    conclusion: profile.conclusion,
    observer_name: observer ? toStaffName(observer.email) : null,
    observed_on: row?.observed_on ?? null,
  };
  return summary;
}

export async function getObservationView(
  registrationId: string,
  actor: SessionUser,
): Promise<ObservationViewResponse | null> {
  const registration = await registrationService.findFullById(registrationId);
  if (!registration || registration.registration_type !== "siswa_baru") {
    return null;
  }

  const [row, scores, childInterviewerId, accounts] = await Promise.all([
    withDbLogging("observation.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
    withDbLogging("observation.listScores", () =>
      repository.listScores(registrationId),
    ),
    admissionTestService.findChildInterviewerId(registrationId),
    authService.listAccounts(),
  ]);
  const observerId = row?.observer_id ?? childInterviewerId ?? actor.id;
  const observer = accounts.find((account) => account.id === observerId);
  const { dimensions, profile } = toReadiness(scores);
  const entryAge = registration.academic_year
    ? calculateEntryAge(registration.date_of_birth, registration.academic_year)
    : null;
  const canRecord = admissionTestService.canRecordResult(
    actor,
    childInterviewerId,
  );

  const view: ObservationViewResponse = {
    registration_id: registration.id,
    full_name: registration.full_name,
    registration_number: registration.registration_number,
    date_of_birth: registration.date_of_birth,
    entry_age_label: entryAge
      ? `${entryAge.years} th ${entryAge.months} bln`
      : null,
    previous_school: registration.previous_school,
    observer_name: observer ? toStaffName(observer.email) : null,
    observed_on: row?.observed_on ?? jakartaDateKey(new Date()),
    note: row?.note ?? null,
    recommendation: row?.recommendation ?? null,
    dimensions,
    profile,
    can_complete: scores.length === OBSERVATION_INDICATOR_COUNT,
    can_edit: registration.status !== "cancelled" && canRecord,
  };
  return view;
}

export async function saveObservation(
  input: SaveObservationRequestInput,
): Promise<SaveObservationResult> {
  const { registrationId, request, actor } = input;
  const [registration, childInterviewerId] = await Promise.all([
    registrationService.findFullById(registrationId),
    admissionTestService.findChildInterviewerId(registrationId),
  ]);
  const canRecord = admissionTestService.canRecordResult(
    actor,
    childInterviewerId,
  );
  const isIncomplete =
    request.is_complete && request.scores.length < OBSERVATION_INDICATOR_COUNT;

  let failure: SaveObservationFailureReason | null = null;
  if (!registration) failure = "not_found";
  else if (registration.status === "cancelled") failure = "invalid_state";
  else if (registration.registration_type !== "siswa_baru") {
    failure = "invalid_state";
  } else if (!canRecord) failure = "forbidden_result";
  else if (isIncomplete) failure = "incomplete_observation";
  if (failure) {
    const rejected: SaveObservationResult = { ok: false, reason: failure };
    return rejected;
  }

  const saveInput: SaveObservationInput = {
    registrationId,
    scores: request.scores,
    note: request.note,
    recommendation: request.recommendation,
    observerId: childInterviewerId ?? actor.id,
    observedOn: jakartaDateKey(new Date()),
    isComplete: request.is_complete,
    actorId: actor.id,
  };
  const statusInput: AdvanceStatusInput = {
    id: registrationId,
    nextStatus: "tested",
    fromStatuses: ["new", "scheduled"],
  };
  await withTransaction(async (tx) => {
    await withDbLogging("observation.saveWithin", () =>
      repository.saveWithin(tx, saveInput),
    );
    if (request.is_complete) {
      await registrationService.advanceStatusWithin(tx, statusInput);
    }
  });

  const observation = await getObservationView(registrationId, actor);
  const result: SaveObservationResult = observation
    ? { ok: true, observation }
    : { ok: false, reason: "not_found" };
  return result;
}

function toReadiness(scores: ObservationScoreRow[]): {
  dimensions: ObservationDimensionResponse[];
  profile: ReadinessProfileResponse;
} {
  const scoreByIndicator = new Map(
    scores.map((item) => [item.indicator, item]),
  );
  let indicatorNumber = 0;

  const dimensions = OBSERVATION_DIMENSIONS.map((dimension) => {
    const indicators = dimension.indicators.map((label) => {
      indicatorNumber += 1;
      const saved = scoreByIndicator.get(indicatorNumber);
      const indicator: ObservationIndicatorResponse = {
        number: indicatorNumber,
        label,
        score: saved?.score ?? null,
        note: saved?.note ?? null,
      };
      return indicator;
    });
    const filled = indicators.filter((item) => item.score !== null);
    const score = filled.reduce((total, item) => total + (item.score ?? 0), 0);
    const maxScore = indicators.length * OBSERVATION_MAX_SCORE;
    const ratio = score / maxScore;
    const percent = Math.floor((score * 100) / maxScore);

    let level: ReadinessLevel = "weak";
    if (ratio >= READINESS_THRESHOLD.strong) level = "strong";
    else if (ratio >= READINESS_THRESHOLD.moderate) level = "moderate";
    const category = {
      label: DIMENSION_CATEGORY_LABEL[level],
      tone: READINESS_TONE[level],
    };

    const response: ObservationDimensionResponse = {
      name: dimension.name,
      indicators,
      score_label: `${score}/${maxScore} (${percent}%)`,
      ratio,
      category: filled.length > 0 ? category : null,
    };
    return response;
  });

  const score = scores.reduce((total, item) => total + item.score, 0);
  const maxScore = OBSERVATION_INDICATOR_COUNT * OBSERVATION_MAX_SCORE;
  const ratio = score / maxScore;
  const percent = Math.floor((score * 100) / maxScore);

  let level: ReadinessLevel = "weak";
  if (ratio >= READINESS_THRESHOLD.strong) level = "strong";
  else if (ratio >= READINESS_THRESHOLD.moderate) level = "moderate";
  const conclusion = {
    label: READINESS_CONCLUSION_LABEL[level],
    tone: READINESS_TONE[level],
  };
  const strongest = dimensions.reduce((best, item) =>
    item.ratio > best.ratio ? item : best,
  );
  const weakest = dimensions.reduce((best, item) =>
    item.ratio < best.ratio ? item : best,
  );
  const hasScores = scores.length > 0;

  const profile: ReadinessProfileResponse = {
    score_label: `${score} / ${maxScore} (${percent}%)`,
    ratio,
    conclusion: hasScores ? conclusion : null,
    strongest: hasScores ? strongest.name : null,
    weakest: hasScores ? weakest.name : null,
  };
  const readiness = { dimensions, profile };
  return readiness;
}
