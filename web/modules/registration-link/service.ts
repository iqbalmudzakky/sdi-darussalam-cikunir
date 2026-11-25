import * as repository from "./repository";
import { withTransaction } from "@/modules/db/postgres";
import type { TestDayResponse } from "@/modules/admission-test/dto";
import * as admissionTestService from "@/modules/admission-test/service";
import { getRegistrationFee } from "@/modules/payment-settings/service";
import * as registrationBiodataService from "@/modules/registration-biodata/service";
import type { UpdateRegistrationFormInput } from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import * as admissionSettingsService from "@/modules/admission-settings/service";
import { buildFlowSteps } from "@/modules/shared/registrationFlow";
import { getSiteUrl } from "@/modules/shared/siteUrl";
import { buildWhatsAppLink } from "@/modules/shared/whatsapp";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "@/modules/crypto/tokens";
import { withDbLogging } from "@/modules/db/errors";
import {
  FORM_LINK_TTL_DAYS,
  FULL_FORM_FLOW_STEP,
} from "@/modules/shared/constant/registration";
import type {
  FullFormLinkResult,
  FullFormResponse,
  SubmitFullFormInput,
  SubmitFullFormResult,
} from "./dto";
import type { NewRegistrationFormLink, RegistrationFormLink } from "./entity";

export async function createLink(
  registrationId: string,
  createdBy: string | null,
): Promise<string> {
  const token = generateRefreshToken();
  const ttlMilliseconds = FORM_LINK_TTL_DAYS * 24 * 60 * 60 * 1000;

  const link: NewRegistrationFormLink = {
    registrationId,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + ttlMilliseconds),
    createdBy,
  };
  await withDbLogging("registrationLink.upsert", () => repository.upsert(link));
  return token;
}

export async function findLink(
  token: string,
): Promise<RegistrationFormLink | null> {
  const tokenHash = hashRefreshToken(token);
  return withDbLogging("registrationLink.findByTokenHash", () =>
    repository.findByTokenHash(tokenHash),
  );
}

export async function sendFormLink(
  registrationId: string,
  adminId: string,
): Promise<string | null> {
  const [registration, testDay] = await Promise.all([
    registrationService.findFormById(registrationId),
    admissionTestService.findTestDay(registrationId),
  ]);
  if (!registration?.contact_phone) return null;

  const token = await createLink(registrationId, adminId);
  const formUrl = `${getSiteUrl()}/pendaftaran/${token}`;
  const message = [
    "Assalamu'alaikum, berikut link form lengkap pendaftaran SDI Darussalam Cikunir.",
    `Nama anak: ${registration.student.full_name}\nNo. pendaftaran: ${registration.registration_number ?? "-"}`,
    formUrl,
    testDay
      ? `Link berlaku sampai ${testDay.date_label}.`
      : `Link berlaku ${FORM_LINK_TTL_DAYS} hari.`,
  ].join("\n\n");
  return buildWhatsAppLink(registration.contact_phone, message);
}

export async function getFullFormByToken(
  token: string,
): Promise<FullFormLinkResult> {
  try {
    const link = await findLink(token);
    const [registration, testDay] = link
      ? await Promise.all([
          registrationService.findFormById(link.registration_id),
          admissionTestService.findTestDay(link.registration_id),
        ])
      : [null, null];
    const isActive = isLinkActive(link, testDay);

    if (!registration || !isActive) {
      const contactPhone = await admissionSettingsService.getContactPhone();
      const message = [
        "Assalamu'alaikum, link form lengkap pendaftaran SDI Darussalam Cikunir saya sudah tidak berlaku.",
        registration &&
          `Nama anak: ${registration.student.full_name}\nNo. pendaftaran: ${registration.registration_number ?? "-"}`,
        "Mohon dikirim link baru.",
      ]
        .filter(Boolean)
        .join("\n\n");
      const expired: FullFormLinkResult = {
        status: "expired",
        whatsapp_url: contactPhone
          ? buildWhatsAppLink(contactPhone, message)
          : null,
      };
      return expired;
    }

    const biodata = await registrationBiodataService.getFormBiodata(
      registration.id,
    );
    const form: FullFormResponse = {
      registration_number: registration.registration_number,
      registration_type: registration.registration_type,
      values: {
        student: registration.student,
        parent_email: registration.parent_email,
        ...biodata,
      },
    };
    const valid: FullFormLinkResult = { status: "valid", form };
    return valid;
  } catch (error) {
    console.error("registrationLink.getFullFormByToken failed:", error);
    throw error;
  }
}

export async function submitFullForm(
  input: SubmitFullFormInput,
): Promise<SubmitFullFormResult> {
  const { token, request } = input;
  try {
    const link = await findLink(token);
    const testDay = link
      ? await admissionTestService.findTestDay(link.registration_id)
      : null;
    if (!link || !isLinkActive(link, testDay)) {
      const expired: SubmitFullFormResult = {
        ok: false,
        reason: "expired_link",
      };
      return expired;
    }

    const registrationId = link.registration_id;
    const isNikTaken = await registrationService.existsNikOnOther(
      request.student.nik,
      registrationId,
    );
    if (isNikTaken) {
      const duplicate: SubmitFullFormResult = {
        ok: false,
        reason: "duplicate_nik",
      };
      return duplicate;
    }

    const formInput: UpdateRegistrationFormInput = {
      registrationId,
      parentEmail: request.parent_email,
      student: request.student,
    };
    await withTransaction(async (tx) => {
      await registrationService.updateFormWithin(tx, formInput);
      await registrationBiodataService.replaceWithin(
        tx,
        registrationId,
        request,
      );
    });

    const [registration, registrationFee] = await Promise.all([
      registrationService.findFormById(registrationId),
      getRegistrationFee(),
    ]);
    const result: SubmitFullFormResult = {
      ok: true,
      registration_number: registration?.registration_number ?? null,
      flow_steps: buildFlowSteps(FULL_FORM_FLOW_STEP, registrationFee),
    };
    return result;
  } catch (error) {
    console.error("registrationLink.submitFullForm failed:", error);
    throw error;
  }
}

function isLinkActive(
  link: RegistrationFormLink | null,
  testDay: TestDayResponse | null,
): boolean {
  if (!link) return false;

  const expiresAt = testDay
    ? new Date(`${testDay.test_date}T23:59:59+07:00`)
    : new Date(link.expires_at);
  return expiresAt > new Date();
}
