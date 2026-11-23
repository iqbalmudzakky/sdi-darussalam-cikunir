export type AdmissionTestRow = {
  registration_id: string;
  test_date: string;
  test_time: string;
  child_interviewer_id: string | null;
  parent_interviewer_id: string | null;
  reminded_at: string | null;
};

export type SaveAdmissionTestInput = {
  registrationId: string;
  testDate: string;
  testTime: string;
  childInterviewerId: string | null;
  parentInterviewerId: string | null;
  actorId: string;
};
