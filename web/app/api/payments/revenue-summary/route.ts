import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as paymentService from "@/modules/payment/service";
import { RevenueSummaryRequestSchema } from "@/modules/payment/dto";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;

  const parsed = RevenueSummaryRequestSchema.safeParse({
    paid_from: searchParams.get("paid_from") ?? undefined,
    paid_to: searchParams.get("paid_to") ?? undefined,
  });

  if (!parsed.success) {
    console.warn(
      `GET /api/payments/revenue-summary: query ditolak (${searchParams.toString()})`,
      parsed.error.issues,
    );

    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Query tidak valid." },
      { status: 400 },
    );
  }

  try {
    const summary = await paymentService.getRevenueSummary(parsed.data);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/payments/revenue-summary failed:", error);

    return NextResponse.json(
      { error: "Failed to get revenue summary" },
      { status: 500 },
    );
  }
}
