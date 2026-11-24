import type { SessionUser } from "@/modules/auth/dto";
import type { AdminSummary } from "@/modules/auth/entity";
import * as authService from "@/modules/auth/service";
import { withDbLogging } from "@/modules/db/errors";
import { withTransaction } from "@/modules/db/postgres";
import {
  sendTestReminderEmails,
  type TestReminderEmail,
} from "@/modules/email/email";
import type { AdvanceStatusInput } from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import { TEST_TIME_SLOT } from "@/modules/shared/constant/registration";
import { jakartaDateKey } from "@/modules/shared/jakartaDate";
import { toStaffName } from "@/modules/shared/staffName";
import { buildWhatsAppLink } from "@/modules/shared/whatsapp";
import * as repository from "./repository";
import type {
  InterviewerResponse,
  RecordManualResultFailureReason,
  RecordManualResultInput,
  ReminderEmailSummary,
  SaveScheduleFailureReason,
  SaveScheduleInput,
  ScheduleResponse,
  ScheduleViewResponse,
  TestDayResponse,
  TestReminderGroupResponse,
  TestReminderResponse,
} from "./dto";
import type {
  AdmissionTestRow,
  SaveAdmissionTestInput,
  SaveManualResultInput,
} from "./entity";

export async function getScheduleView(
  registrationId: string,
  actor: SessionUser,
): Promise<ScheduleViewResponse> {
  const [row, accounts] = await Promise.all([
    withDbLogging("admissionTest.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
    authService.listAccounts(),
  ]);
  const interviewers = toInterviewers(accounts);

  const view: ScheduleViewResponse = {
    schedule: row ? toSchedule(row, interviewers) : null,
    options: {
      interviewers,
      time_options: listTestTimes(),
      can_assign_others: authService.hasPermission(
        actor.role,
        "assign_interviewers",
      ),
      self: interviewers.find((item) => item.id === actor.id) ?? null,
    },
  };
  return view;
}

export async function saveSchedule(
  input: SaveScheduleInput,
): Promise<SaveScheduleFailureReason | null> {
  const { registrationId, request, actor } = input;
  const [existing, accounts] = await Promise.all([
    withDbLogging("admissionTest.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
    authService.listAccounts(),
  ]);

  const isSameSlot =
    existing?.test_date === request.test_date &&
    existing?.test_time === request.test_time;
  const startsAt = new Date(
    `${request.test_date}T${request.test_time}:00+07:00`,
  );
  if (!isSameSlot && startsAt.getTime() <= Date.now()) return "past_schedule";
  if (!isSameSlot && !listTestTimes().includes(request.test_time)) {
    return "invalid_time";
  }

  const interviewerIds = toInterviewers(accounts).map((item) => item.id);
  const chosen = [request.child_interviewer_id, request.parent_interviewer_id];
  const hasUnknown = chosen.some(
    (id) => id !== null && !interviewerIds.includes(id),
  );
  if (hasUnknown) return "invalid_interviewer";

  const canAssignOthers = authService.hasPermission(
    actor.role,
    "assign_interviewers",
  );
  const current = [
    existing?.child_interviewer_id ?? null,
    existing?.parent_interviewer_id ?? null,
  ];
  const isOwnChoice = chosen.every(
    (id, index) =>
      id === current[index] ||
      id === actor.id ||
      (id === null && current[index] === actor.id),
  );
  if (!canAssignOthers && !isOwnChoice) return "forbidden_interviewer";

  const saveInput: SaveAdmissionTestInput = {
    registrationId,
    testDate: request.test_date,
    testTime: request.test_time,
    childInterviewerId: request.child_interviewer_id,
    parentInterviewerId: request.parent_interviewer_id,
    actorId: actor.id,
  };
  const statusInput: AdvanceStatusInput = {
    id: registrationId,
    nextStatus: "scheduled",
    fromStatuses: ["new"],
  };
  await withTransaction(async (tx) => {
    await withDbLogging("admissionTest.saveWithin", () =>
      repository.saveWithin(tx, saveInput),
    );
    await registrationService.advanceStatusWithin(tx, statusInput);
  });
  return null;
}

export async function findTestDay(
  registrationId: string,
): Promise<TestDayResponse | null> {
  const row = await withDbLogging("admissionTest.findByRegistrationId", () =>
    repository.findByRegistrationId(registrationId),
  );
  if (!row) return null;

  const testDay: TestDayResponse = {
    test_date: row.test_date,
    date_label: formatDate(row.test_date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
  return testDay;
}

export async function recordManualResult(
  input: RecordManualResultInput,
): Promise<RecordManualResultFailureReason | null> {
  const { registrationId, request, actor } = input;
  const [registration, row] = await Promise.all([
    registrationService.findFullById(registrationId),
    withDbLogging("admissionTest.findByRegistrationId", () =>
      repository.findByRegistrationId(registrationId),
    ),
  ]);
  if (!registration) return "not_found";
  if (
    registration.status === "cancelled" ||
    registration.registration_type !== "pindahan"
  ) {
    return "invalid_state";
  }
  const childInterviewerId = row?.child_interviewer_id ?? null;
  if (!canRecordResult(actor, childInterviewerId)) {
    return "forbidden_result";
  }
  if (!row) return "no_schedule";
  if (request.tested_on > jakartaDateKey(new Date())) return "future_test_date";

  const saveInput: SaveManualResultInput = {
    registrationId,
    testedOn: request.tested_on,
    notes: request.notes,
    actorId: actor.id,
  };
  const statusInput: AdvanceStatusInput = {
    id: registrationId,
    nextStatus: "tested",
    fromStatuses: ["new", "scheduled"],
  };
  await withTransaction(async (tx) => {
    await withDbLogging("admissionTest.saveManualResultWithin", () =>
      repository.saveManualResultWithin(tx, saveInput),
    );
    await registrationService.advanceStatusWithin(tx, statusInput);
  });
  return null;
}

export function canRecordResult(
  actor: SessionUser,
  childInterviewerId: string | null,
): boolean {
  return (
    authService.hasPermission(actor.role, "record_test_results") ||
    actor.id === childInterviewerId
  );
}

export async function findChildInterviewerId(
  registrationId: string,
): Promise<string | null> {
  const row = await withDbLogging("admissionTest.findByRegistrationId", () =>
    repository.findByRegistrationId(registrationId),
  );
  return row?.child_interviewer_id ?? null;
}

export async function markReminded(
  registrationId: string,
  actorId: string,
): Promise<boolean> {
  return withDbLogging("admissionTest.markReminded", () =>
    repository.markReminded(registrationId, actorId),
  );
}

export async function listReminders(): Promise<TestReminderGroupResponse[]> {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const today = jakartaDateKey(now);
  const tomorrow = jakartaDateKey(new Date(now.getTime() + dayMs));

  const rows = await withDbLogging("admissionTest.listUnremindedBetween", () =>
    repository.listUnremindedBetween(today, tomorrow),
  );
  if (rows.length === 0) return [];

  const registrationIds = rows.map((row) => row.registration_id);
  const [registrations, accounts] = await Promise.all([
    registrationService.listFullByIds(registrationIds),
    authService.listAccounts(),
  ]);
  const interviewers = toInterviewers(accounts);

  const entries = rows.flatMap((row) => {
    const registration = registrations.find(
      (item) => item.id === row.registration_id,
    );
    if (!registration || registration.status === "cancelled") return [];

    const schedule = toSchedule(row, interviewers);
    const message = [
      "Assalamu'alaikum, kami mengingatkan jadwal tes dan wawancara calon murid SDI Darussalam Cikunir.",
      `Nama anak: ${registration.full_name}\nNo. pendaftaran: ${registration.registration_number ?? "-"}\nHari, tanggal: ${schedule.date_label}\nJam: ${schedule.time_label} WIB`,
      "Terima kasih.",
    ].join("\n\n");
    const whatsappUrl = registration.contact_phone
      ? buildWhatsAppLink(registration.contact_phone, message)
      : null;
    const reminder: TestReminderResponse = {
      registration_id: registration.id,
      registration_number: registration.registration_number,
      full_name: registration.full_name,
      time_label: schedule.time_label,
      interviewer_name: schedule.child_interviewer?.name ?? null,
      whatsapp_url: whatsappUrl,
    };
    const entry = { testDate: row.test_date, reminder };
    return [entry];
  });

  const days = [
    {
      key: "today",
      prefix: "Hari ini",
      date: today,
    },
    {
      key: "tomorrow",
      prefix: "Besok",
      date: tomorrow,
    },
  ] as const;
  const groups = days.map((day) => {
    const shortDate = formatDate(day.date, {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
    const group: TestReminderGroupResponse = {
      key: day.key,
      label: `${day.prefix} · ${shortDate}`,
      reminders: entries
        .filter((entry) => entry.testDate === day.date)
        .map((entry) => entry.reminder),
    };
    return group;
  });
  return groups.filter((group) => group.reminders.length > 0);
}

export async function sendTomorrowReminderEmails(): Promise<ReminderEmailSummary> {
  const dayMs = 24 * 60 * 60 * 1000;
  const tomorrowDate = new Date(Date.now() + dayMs);
  const tomorrow = jakartaDateKey(tomorrowDate);
  const rows = await withDbLogging("admissionTest.claimForEmailReminder", () =>
    repository.claimForEmailReminder(tomorrow),
  );
  if (rows.length === 0) {
    const nothingToSend: ReminderEmailSummary = { sent: 0, skipped: 0 };
    return nothingToSend;
  }

  const registrationIds = rows.map((row) => row.registration_id);
  const registrations =
    await registrationService.listFullByIds(registrationIds);
  const deliveries = rows.flatMap((row) => {
    const registration = registrations.find(
      (item) => item.id === row.registration_id,
    );
    if (!registration?.parent_email || registration.status === "cancelled") {
      return [];
    }

    const schedule = toSchedule(row, []);
    const email: TestReminderEmail = {
      to: registration.parent_email,
      studentName: registration.full_name,
      registrationNumber: registration.registration_number,
      dateLabel: schedule.date_label,
      timeLabel: schedule.time_label,
    };
    const delivery = { registrationId: row.registration_id, email };
    return [delivery];
  });

  const emails = deliveries.map((delivery) => delivery.email);
  const isSent = emails.length > 0 && (await sendTestReminderEmails(emails));
  const sentIds = isSent
    ? deliveries.map((delivery) => delivery.registrationId)
    : [];
  const unsentIds = rows
    .map((row) => row.registration_id)
    .filter((id) => !sentIds.includes(id));
  if (unsentIds.length > 0) {
    await withDbLogging("admissionTest.releaseEmailReminder", () =>
      repository.releaseEmailReminder(unsentIds),
    );
  }
  const summary: ReminderEmailSummary = {
    sent: sentIds.length,
    skipped: rows.length - sentIds.length,
  };
  return summary;
}

function listTestTimes(): string[] {
  const { firstMinute, lastMinute, stepMinutes } = TEST_TIME_SLOT;
  const slotCount = (lastMinute - firstMinute) / stepMinutes + 1;
  const times = Array.from({ length: slotCount }, (_, index) => {
    const minutes = firstMinute + index * stepMinutes;
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    return `${hour}:${minute}`;
  });
  return times;
}

function toInterviewers(accounts: AdminSummary[]): InterviewerResponse[] {
  const interviewers = accounts
    .filter(
      (account) => account.role !== "developer" && account.status === "active",
    )
    .map((account) => ({
      id: account.id,
      name: toStaffName(account.email),
    }))
    .sort((first, second) => first.name.localeCompare(second.name));
  return interviewers;
}

function toSchedule(
  row: AdmissionTestRow,
  interviewers: InterviewerResponse[],
): ScheduleResponse {
  const findInterviewer = (id: string | null) =>
    interviewers.find((item) => item.id === id) ?? null;
  const weekday = formatDate(row.test_date, { weekday: "long" });

  const schedule: ScheduleResponse = {
    test_date: row.test_date,
    test_time: row.test_time,
    weekday_short: weekday.slice(0, 3).toUpperCase(),
    day_number: formatDate(row.test_date, { day: "numeric" }),
    month_short: formatDate(row.test_date, { month: "short" }),
    date_label: formatDate(row.test_date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    time_label: row.test_time.replace(":", "."),
    child_interviewer: findInterviewer(row.child_interviewer_id),
    parent_interviewer: findInterviewer(row.parent_interviewer_id),
    is_reminded: row.reminded_at !== null,
    manual_result: row.manual_tested_on
      ? { tested_on: row.manual_tested_on, notes: row.manual_notes }
      : null,
  };
  return schedule;
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
