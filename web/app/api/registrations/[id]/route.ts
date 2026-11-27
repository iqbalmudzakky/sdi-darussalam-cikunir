import { NextResponse } from "next/server";
import { requirePermission, requireUser } from "@/lib/auth/session";
import * as registrationAdminService from "@/modules/registration-admin/service";
import {
  UpdateRegistrationRequestSchema,
  type UpdateRegistrationInput,
} from "@/modules/registration-admin/dto";
import {
  SaveObservationRequestSchema,
  type SaveObservationRequestInput,
} from "@/modules/observation/dto";
import * as observationService from "@/modules/observation/service";
import {
  SaveDecisionLetterRequestSchema,
  SaveStatementRequestSchema,
  type SaveDecisionLetterRequestInput,
  type SaveStatementRequestInput,
} from "@/modules/admission-letter/dto";
import * as admissionLetterService from "@/modules/admission-letter/service";
import type { SessionUser } from "@/modules/auth/dto";
import * as documentService from "@/modules/document/service";
import * as paymentService from "@/modules/payment/service";
import * as registrationLinkService from "@/modules/registration-link/service";
import * as registrationService from "@/modules/registration/service";
import { REGISTRATION_FAILURE } from "@/modules/shared/constant/admission/registration";

type ActionInput = {
  id: string;
  user: SessionUser;
  body: unknown;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const registration = await registrationAdminService.getRegistrationDetail(
      id,
      user,
    );
    if (!registration) {
      const failure = REGISTRATION_FAILURE.not_found;
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(registration);
  } catch (error) {
    console.error(`GET /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memuat pendaftar." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const input: ActionInput = {
    id,
    user,
    body,
  };

  switch (body.action) {
    case "send_form_link":
      return sendFormLink(input);
    case "send_payment_link":
      return sendPaymentLink(input);
    case "send_documents":
      return sendDocuments(input);
    case "save_observation":
      return saveObservation(input);
    case "save_statement":
    case "refresh_statement":
      return saveStatement(input);
    case "save_decision_letter":
    case "refresh_decision_letter":
      return saveDecisionLetter(input);
    default:
      return updateRegistration(input);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("delete_registrations");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await registrationService.deleteRegistration(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus pendaftar." },
      { status: 500 },
    );
  }
}

async function sendFormLink({ id, user }: ActionInput) {
  try {
    const whatsappUrl = await registrationLinkService.sendFormLink(id, user.id);
    if (!whatsappUrl) {
      const failure = REGISTRATION_FAILURE.not_found;
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json({ whatsapp_url: whatsappUrl });
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} send_form_link failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal membuat link form lengkap." },
      { status: 500 },
    );
  }
}

async function sendPaymentLink({ id, user }: ActionInput) {
  try {
    const result = await paymentService.createPaymentLink(id, user);
    if (!result.ok) {
      const failure =
        result.reason === "gateway_error"
          ? { status: 502, message: "Gagal membuat link pembayaran DOKU." }
          : REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json({ whatsapp_url: result.whatsapp_url });
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} send_payment_link failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal membuat link pembayaran." },
      { status: 500 },
    );
  }
}

async function sendDocuments({ id, user }: ActionInput) {
  try {
    const result = await documentService.sendDocuments(id, user.id);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json({ whatsapp_url: result.whatsapp_url });
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} send_documents failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal membuat link dokumen." },
      { status: 500 },
    );
  }
}

async function saveObservation({ id, user, body }: ActionInput) {
  const parsed = SaveObservationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input: SaveObservationRequestInput = {
      registrationId: id,
      request: parsed.data,
      actor: user,
    };
    const result = await observationService.saveObservation(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result.observation);
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} save_observation failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal menyimpan observasi." },
      { status: 500 },
    );
  }
}

async function saveStatement({ id, user, body }: ActionInput) {
  const parsed = SaveStatementRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input: SaveStatementRequestInput = {
      registrationId: id,
      request: parsed.data,
      actor: user,
    };
    const result = await admissionLetterService.saveStatement(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result.statement);
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} ${parsed.data.action} failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal menyimpan surat pernyataan." },
      { status: 500 },
    );
  }
}

async function saveDecisionLetter({ id, user, body }: ActionInput) {
  const parsed = SaveDecisionLetterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input: SaveDecisionLetterRequestInput = {
      registrationId: id,
      request: parsed.data,
      actor: user,
    };
    const result = await admissionLetterService.saveDecisionLetter(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result.letter);
  } catch (error) {
    console.error(
      `PATCH /api/registrations/${id} ${parsed.data.action} failed:`,
      error,
    );
    return NextResponse.json(
      { error: "Gagal menyimpan Surat Keterangan." },
      { status: 500 },
    );
  }
}

async function updateRegistration({ id, user, body }: ActionInput) {
  const parsed = UpdateRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] === "form" ? issue.path.slice(1) : issue.path;
      fieldErrors[path.join(".")] ??= issue.message;
    }
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
        field_errors: fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const input: UpdateRegistrationInput = {
      id,
      request: parsed.data,
      actor: user,
    };
    const result = await registrationAdminService.updateRegistration(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result.registration);
  } catch (error) {
    console.error(`PATCH /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui pendaftar." },
      { status: 500 },
    );
  }
}
