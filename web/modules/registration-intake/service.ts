import type { TransactionSql } from "postgres";
import { withTransaction } from "@/modules/db/postgres";
import {
  getRegistrationFee,
  isRegistrationOpen,
} from "@/modules/payment-settings/service";
import * as registrationStatsService from "@/modules/registration-stats/service";
import * as registrationService from "@/modules/registration/service";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";
import type {
  InsertFullRegistrationInput,
  NewShortRegistration,
  RegistrationSource,
  ShortRegistrationIdentity,
} from "@/modules/registration/entity";
import * as schoolProfileService from "@/modules/school-profile/service";
import {
  MINIMUM_ENTRY_AGE_YEARS,
  REGISTRATION_FLOW_STEPS,
  REGISTRATION_PROGRAM_LABEL,
  REGISTRATION_TYPE_LABEL,
  SHORT_FORM_MAX_PER_IP_PER_HOUR,
  TARGET_ACADEMIC_YEAR_SPAN,
  TARGET_GRADES,
} from "@/modules/shared/constant/registration";
import { calculateEntryAge } from "@/modules/shared/entryAge";
import { buildWhatsAppLink } from "@/modules/shared/whatsapp";
import type {
  CreateShortRegistrationInput,
  CreateShortRegistrationResult,
  RegistrationFlowStepResponse,
  ShortFormOptionsQuery,
  ShortFormOptionsResponse,
  ShortRegistrationBlockReason,
} from "./dto";

export async function insertFullRegistrationWithin(
  tx: TransactionSql,
  input: CreatePpdbRegistrationRequest,
  source: RegistrationSource,
): Promise<string> {
  const academicYear =
    await registrationStatsService.findCurrentAcademicYearWithin(tx);
  const registrationNumber = academicYear
    ? await registrationService.nextRegistrationNumberWithin(tx, academicYear)
    : null;

  const options: InsertFullRegistrationInput = {
    source,
    academicYear,
    registrationNumber,
  };
  return registrationService.insertWithin(tx, input, options);
}

export async function getShortFormOptions(
  query: ShortFormOptionsQuery,
): Promise<ShortFormOptionsResponse> {
  try {
    const [open, academicYears, contactPhone] = await Promise.all([
      isRegistrationOpen(),
      listTargetAcademicYears(),
      getAdmissionContactPhone(),
    ]);

    const isTransfer = query.registration_type === "pindahan";
    const entryAge =
      !isTransfer && query.birth_date && query.academic_year
        ? calculateEntryAge(query.birth_date, query.academic_year)
        : null;
    const isUnderAge = entryAge
      ? entryAge.years < MINIMUM_ENTRY_AGE_YEARS
      : false;

    const underAgeMessage = [
      "Assalamu'alaikum, saya ingin bertanya syarat usia pendaftaran.",
      query.full_name && `Nama anak: ${query.full_name}`,
      `Tanggal lahir: ${query.birth_date ?? "-"}`,
      `Masuk tahun ajaran: ${query.academic_year ?? "-"}`,
    ]
      .filter(Boolean)
      .join("\n");
    const underAgeWhatsAppUrl = contactPhone
      ? buildWhatsAppLink(contactPhone, underAgeMessage)
      : null;
    const underAge = {
      minimum_years: MINIMUM_ENTRY_AGE_YEARS,
      whatsapp_url: underAgeWhatsAppUrl,
    };

    const response: ShortFormOptionsResponse = {
      open,
      academic_years: academicYears,
      target_grades: isTransfer ? [...TARGET_GRADES] : [],
      under_age: isUnderAge ? underAge : null,
    };
    return response;
  } catch (error) {
    console.error("registrationIntake.getShortFormOptions failed:", error);
    throw error;
  }
}

export async function createShortRegistration(
  input: CreateShortRegistrationInput,
): Promise<CreateShortRegistrationResult> {
  const { request } = input;
  try {
    const blockReason = await findShortRegistrationBlock(input);
    if (blockReason) {
      const blocked: CreateShortRegistrationResult = {
        ok: false,
        reason: blockReason,
      };
      return blocked;
    }

    const registrationNumber = await withTransaction((tx) =>
      insertShortRegistrationWithin(tx, input),
    );
    const [registrationFee, contactPhone] = await Promise.all([
      getRegistrationFee(),
      getAdmissionContactPhone(),
    ]);

    const message = [
      "Assalamu'alaikum, saya sudah mengisi form pendaftaran.",
      `Nama anak: ${request.full_name}`,
      `No. pendaftaran: ${registrationNumber}`,
      `Jenis: ${REGISTRATION_TYPE_LABEL[request.registration_type]}`,
      request.target_grade && `Kelas tujuan: ${request.target_grade}`,
      `Program: ${REGISTRATION_PROGRAM_LABEL[request.program]}`,
      `Masuk tahun ajaran: ${request.academic_year}`,
    ]
      .filter(Boolean)
      .join("\n");

    const flowSteps: RegistrationFlowStepResponse[] =
      REGISTRATION_FLOW_STEPS.map((step) => ({
        label: step.label,
        state: step.state,
        fee: step.showsFee ? registrationFee : null,
      }));

    const result: CreateShortRegistrationResult = {
      ok: true,
      registration_number: registrationNumber,
      whatsapp_url: contactPhone
        ? buildWhatsAppLink(contactPhone, message)
        : null,
      flow_steps: flowSteps,
    };
    return result;
  } catch (error) {
    console.error("registrationIntake.createShortRegistration failed:", error);
    throw error;
  }
}

async function findShortRegistrationBlock(
  input: CreateShortRegistrationInput,
): Promise<ShortRegistrationBlockReason | null> {
  const { request, ipAddress } = input;

  const isOpen = await isRegistrationOpen();
  if (!isOpen) return "closed";

  const academicYears = await listTargetAcademicYears();
  if (!academicYears.includes(request.academic_year)) return "invalid_year";

  const recentCount =
    process.env.NODE_ENV === "development"
      ? 0
      : await registrationService.countShortFormsByIpLastHour(ipAddress);
  if (recentCount >= SHORT_FORM_MAX_PER_IP_PER_HOUR) return "rate_limited";

  const identity: ShortRegistrationIdentity = {
    fullName: request.full_name,
    dateOfBirth: request.date_of_birth,
    academicYear: request.academic_year,
  };
  const isDuplicate = await registrationService.existsShortDuplicate(identity);
  return isDuplicate ? "duplicate" : null;
}

async function insertShortRegistrationWithin(
  tx: TransactionSql,
  input: CreateShortRegistrationInput,
): Promise<string> {
  const { request, ipAddress } = input;
  await registrationStatsService.ensureAcademicYearWithin(
    tx,
    request.academic_year,
  );
  const registrationNumber =
    await registrationService.nextRegistrationNumberWithin(
      tx,
      request.academic_year,
    );

  const registration: NewShortRegistration = {
    registrationType: request.registration_type,
    registrationNumber,
    academicYear: request.academic_year,
    program: request.program,
    targetGrade: request.target_grade,
    contactName: request.contact_name,
    contactPhone: request.contact_phone,
    parentEmail: request.parent_email,
    ipAddress,
    fullName: request.full_name,
    gender: request.gender,
    dateOfBirth: request.date_of_birth,
    previousSchool: request.previous_school,
  };
  await registrationService.insertShortWithin(tx, registration);
  return registrationNumber;
}

async function listTargetAcademicYears(): Promise<string[]> {
  const current = await registrationStatsService.getCurrentAcademicYear();
  if (!current) return [];

  const startYear = Number(current.split("/")[0]);
  const yearCount = TARGET_ACADEMIC_YEAR_SPAN + 1;
  const years = Array.from(
    { length: yearCount },
    (_, offset) => `${startYear + offset}/${startYear + offset + 1}`,
  );
  return years;
}

async function getAdmissionContactPhone(): Promise<string> {
  const profile = await schoolProfileService.getSchoolProfile();
  return profile.whatsapp;
}
