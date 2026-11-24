export type ObservationRow = {
  registration_id: string;
  observer_id: string | null;
  observed_on: string;
  note: string | null;
  recommendation: string | null;
  completed_at: string | null;
};

export type ObservationScoreRow = {
  indicator: number;
  score: number;
  note: string | null;
};

export type SaveObservationInput = {
  registrationId: string;
  scores: ObservationScoreRow[];
  note: string | null;
  recommendation: string | null;
  observerId: string;
  observedOn: string;
  isComplete: boolean;
  actorId: string;
};
