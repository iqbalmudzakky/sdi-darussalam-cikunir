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
} from "@/modules/shared/constant/admission/observation";
import { calculateEntryAge } from "@/modules/shared/date/entryAge";
import { jakartaDateKey } from "@/modules/shared/date/jakartaDate";
import { toStaffName } from "@/modules/shared/format/staffName";
import * as repository from "./repository";
import type {
  MissingIndicatorResponse,
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
    observer_name: observer ? toStaffName(observer) : null,
    observed_on: row?.observed_on ?? null,
  };
  return summary;
}

export async function getObservationView(
  registrationId: string,
  actor: SessionUser | null,
): Promise<ObservationViewResponse | null> {
  const registration = await registrationService.findFullById(registrationId);
  if (!registration || registration.registration_type !== "siswa_baru") {
    return null;
  }

  const [row, scores, interviewerIds, accounts] = await Promise.all([
    withDbLogging("observation.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
    withDbLogging("observation.listScores", () =>
      repository.listScores(registrationId),
    ),
    admissionTestService.findInterviewerIds(registrationId),
    authService.listAccounts(),
  ]);
  const { childInterviewerId } = interviewerIds;
  const observerId = row?.observer_id ?? childInterviewerId ?? actor?.id;
  const observer = accounts.find((account) => account.id === observerId);
  const { dimensions, profile } = toReadiness(scores);
  const entryAge = registration.academic_year
    ? calculateEntryAge(registration.date_of_birth, registration.academic_year)
    : null;
  const canRecord =
    actor !== null &&
    admissionTestService.canRecordResult(actor, childInterviewerId);
  const missingIndicators = dimensions.flatMap((dimension, index) => {
    const numbers = dimension.indicators
      .filter((indicator) => indicator.score === null)
      .map((indicator) => indicator.number);
    if (numbers.length === 0) return [];

    const missing: MissingIndicatorResponse = {
      step: index,
      label: `${index + 1}. ${dimension.name} · no. ${numbers.join(", ")}`,
    };
    return [missing];
  });

  const view: ObservationViewResponse = {
    registration_id: registration.id,
    full_name: registration.full_name,
    registration_number: registration.registration_number,
    date_of_birth: registration.date_of_birth,
    entry_age_label: entryAge
      ? `${entryAge.years} th ${entryAge.months} bln`
      : null,
    entry_age_text: entryAge
      ? `${entryAge.years} Tahun ${entryAge.months} Bulan`
      : null,
    academic_year: registration.academic_year,
    previous_school: registration.previous_school,
    observer_name: observer ? toStaffName(observer) : null,
    observed_on: row?.observed_on ?? jakartaDateKey(new Date()),
    note: row?.note ?? null,
    recommendation: row?.recommendation ?? null,
    dimensions,
    profile,
    missing_indicators: missingIndicators,
    can_complete: scores.length === OBSERVATION_INDICATOR_COUNT,
    is_completed: Boolean(row?.completed_at),
    can_edit: registration.status !== "cancelled" && canRecord,
  };
  return view;
}

export async function saveObservation(
  input: SaveObservationRequestInput,
): Promise<SaveObservationResult> {
  const { registrationId, request, actor } = input;
  const [registration, interviewerIds] = await Promise.all([
    registrationService.findFullById(registrationId),
    admissionTestService.findInterviewerIds(registrationId),
  ]);
  const { childInterviewerId } = interviewerIds;
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
      score,
      max_score: maxScore,
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
  const ratios = dimensions.map((dimension) => dimension.ratio);
  const highestRatio = Math.max(...ratios);
  const lowestRatio = Math.min(...ratios);
  const strongest = dimensions
    .filter((dimension) => dimension.ratio === highestRatio)
    .map((dimension) => dimension.name)
    .join(", ");
  const weakest = dimensions
    .filter((dimension) => dimension.ratio === lowestRatio)
    .map((dimension) => dimension.name)
    .join(", ");
  const hasScores = scores.length > 0;
  const needsStrengthening = lowestRatio < READINESS_THRESHOLD.strong;

  const profile: ReadinessProfileResponse = {
    score,
    max_score: maxScore,
    score_label: `${score} / ${maxScore} (${percent}%)`,
    ratio,
    conclusion: hasScores ? conclusion : null,
    strongest: hasScores ? strongest : null,
    weakest: hasScores && needsStrengthening ? weakest : null,
  };
  const readiness = { dimensions, profile };
  return readiness;
}
