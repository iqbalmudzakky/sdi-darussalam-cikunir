import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as paymentService from "@/modules/payment/service";
import { ListPaymentsRequestSchema } from "@/modules/payment/dto";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;

  const parsed = ListPaymentsRequestSchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    statuses: searchParams.getAll("status"),
    sort: searchParams.get("sort") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    console.warn(
      `GET /api/payments: query ditolak (${searchParams.toString()})`,
      parsed.error.issues,
    );

    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Query tidak valid." },
      { status: 400 },
    );
  }

  try {
    const payments = await paymentService.listPayments(parsed.data);

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/payments failed:", error);

    return NextResponse.json(
      { error: "Failed to list payments" },
      { status: 500 },
    );
  }
}
