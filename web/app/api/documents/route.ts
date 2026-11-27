import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import {
  DocumentQuerySchema,
  type DocumentRequestInput,
  type DocumentResult,
  type SharedDocumentInput,
} from "@/modules/document/dto";
import * as documentService from "@/modules/document/service";
import { DOCUMENT_FAILURE } from "@/modules/shared/constant/admission/document";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = DocumentQuerySchema.safeParse({
    kind: searchParams.get("kind"),
    registration: searchParams.get("registration"),
    token: searchParams.get("token"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const { kind, registration, token } = parsed.data;
  const user = registration ? await requireUser() : null;
  if (registration && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let result: DocumentResult;
    if (registration && user) {
      const input: DocumentRequestInput = {
        kind,
        registrationId: registration,
        actor: user,
      };
      result = await documentService.getDocument(input);
    } else {
      const input: SharedDocumentInput = { kind, token: token ?? "" };
      result = await documentService.getSharedDocument(input);
    }
    if (!result.ok) {
      const failure = DOCUMENT_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }

    const body = new Uint8Array(result.file.buffer);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${result.file.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/documents failed:", error);
    return NextResponse.json(
      { error: "Gagal membuat dokumen." },
      { status: 500 },
    );
  }
}
