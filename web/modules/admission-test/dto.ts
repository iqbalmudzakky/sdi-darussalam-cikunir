import { z } from "zod";
import type { SessionUser } from "@/modules/auth/dto";
import { blankable } from "@/modules/validation/validators";

export const ScheduleTestRequestSchema = z.object({
  test_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tes wajib diisi."),
  test_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam tes wajib diisi."),
  child_interviewer_id: z.uuid().nullable().default(null),
  parent_interviewer_id: z.uuid().nullable().default(null),
});

export type ScheduleTestRequest = z.infer<typeof ScheduleTestRequestSchema>;

export type SaveScheduleInput = {
  registrationId: string;
  request: ScheduleTestRequest;
  actor: SessionUser;
};

export type SaveScheduleFailureReason =
  | "invalid_interviewer"
  | "forbidden_interviewer"
  | "past_schedule"
  | "invalid_time";

export const ManualResultRequestSchema = z.object({
  tested_on: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tes wajib diisi."),
  notes: blankable(
    z.string().trim().max(3000, "Catatan hasil tes maksimal 3000 karakter."),
  ),
});

export type ManualResultRequest = z.infer<typeof ManualResultRequestSchema>;

export type RecordManualResultInput = {
  registrationId: string;
  request: ManualResultRequest;
  actor: SessionUser;
};

export type RecordManualResultFailureReason =
  | "not_found"
  | "invalid_state"
  | "forbidden_result"
  | "no_schedule"
  | "future_test_date";

export type TestAssignmentResponse = {
  registration_id: string;
  roles: { key: "child" | "parent"; label: string }[];
  schedule_label: string;
};

export type ManualResultResponse = {
  tested_on: string;
  notes: string | null;
};

export type InterviewerResponse = {
  id: string;
  name: string;
};

export type ScheduleResponse = {
  test_date: string;
  test_time: string;
  weekday_short: string;
  day_number: string;
  month_short: string;
  date_label: string;
  time_label: string;
  child_interviewer: InterviewerResponse | null;
  parent_interviewer: InterviewerResponse | null;
  is_reminded: boolean;
  manual_result: ManualResultResponse | null;
};

export type ScheduleOptionsResponse = {
  interviewers: InterviewerResponse[];
  time_options: string[];
  can_assign_others: boolean;
  self: InterviewerResponse | null;
};

export type ScheduleViewResponse = {
  schedule: ScheduleResponse | null;
  options: ScheduleOptionsResponse;
};

export type ReminderEmailSummary = {
  sent: number;
  skipped: number;
};

export type TestDayResponse = {
  test_date: string;
  date_label: string;
};

export type TestReminderResponse = {
  registration_id: string;
  registration_number: string | null;
  full_name: string;
  time_label: string;
  interviewer_name: string | null;
  whatsapp_url: string | null;
};

export type TestReminderGroupResponse = {
  key: "today" | "tomorrow";
  label: string;
  reminders: TestReminderResponse[];
};
