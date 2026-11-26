import { z } from "zod";
import type { SessionUser } from "@/modules/auth/dto";
import {
  OBSERVATION_INDICATOR_COUNT,
  OBSERVATION_MAX_SCORE,
} from "@/modules/shared/constant/admission/observation";
import { blankable } from "@/modules/validation/validators";

const ObservationScoreSchema = z.object({
  indicator: z.number().int().min(1).max(OBSERVATION_INDICATOR_COUNT),
  score: z.number().int().min(1).max(OBSERVATION_MAX_SCORE),
  note: blankable(z.string().trim().max(500, "Catatan maksimal 500 karakter.")),
});

export const SaveObservationRequestSchema = z.object({
  action: z.literal("save_observation"),
  is_complete: z.boolean().default(false),
  note: blankable(z.string().trim().max(1000, "Note maksimal 1000 karakter.")),
  recommendation: blankable(
    z.string().trim().max(3000, "Catatan/Rekomendasi maksimal 3000 karakter."),
  ),
  scores: z
    .array(ObservationScoreSchema)
    .max(OBSERVATION_INDICATOR_COUNT)
    .refine(
      (scores) =>
        new Set(scores.map((item) => item.indicator)).size === scores.length,
      "Indikator ganda.",
    ),
});

export type SaveObservationRequest = z.infer<
  typeof SaveObservationRequestSchema
>;

export type SaveObservationFailureReason =
  "not_found" | "invalid_state" | "forbidden_result" | "incomplete_observation";

export type SaveObservationRequestInput = {
  registrationId: string;
  request: SaveObservationRequest;
  actor: SessionUser;
};

export type ReadinessTone = "brand" | "amber" | "red";

export type ReadinessCategoryResponse = {
  label: string;
  tone: ReadinessTone;
};

export type ObservationIndicatorResponse = {
  number: number;
  label: string;
  score: number | null;
  note: string | null;
};

export type ObservationDimensionResponse = {
  name: string;
  indicators: ObservationIndicatorResponse[];
  score: number;
  max_score: number;
  score_label: string;
  ratio: number;
  category: ReadinessCategoryResponse | null;
};

export type ReadinessProfileResponse = {
  score: number;
  max_score: number;
  score_label: string;
  ratio: number;
  conclusion: ReadinessCategoryResponse | null;
  strongest: string | null;
  weakest: string | null;
};

export type MissingIndicatorResponse = {
  step: number;
  label: string;
};

export type ObservationViewResponse = {
  registration_id: string;
  full_name: string;
  registration_number: string | null;
  date_of_birth: string;
  entry_age_label: string | null;
  entry_age_text: string | null;
  academic_year: string | null;
  previous_school: string;
  observer_name: string | null;
  observed_on: string;
  note: string | null;
  recommendation: string | null;
  dimensions: ObservationDimensionResponse[];
  profile: ReadinessProfileResponse;
  missing_indicators: MissingIndicatorResponse[];
  can_complete: boolean;
  is_completed: boolean;
  can_edit: boolean;
};

export type SaveObservationResult =
  | { ok: true; observation: ObservationViewResponse }
  | { ok: false; reason: SaveObservationFailureReason };

export type ObservationSummaryResponse = {
  state: "not_tested" | "in_progress" | "tested";
  score_label: string | null;
  ratio: number;
  conclusion: ReadinessCategoryResponse | null;
  observer_name: string | null;
  observed_on: string | null;
};
