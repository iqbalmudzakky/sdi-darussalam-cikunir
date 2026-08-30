import { NextResponse } from "next/server";
import * as analyticsService from "@/modules/analytics/service";
import { RecordDurationRequestSchema } from "@/modules/analytics/dto";

export async function POST(request: Request) {
  try {
    const parsed = RecordDurationRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return new NextResponse(null, { status: 204 });
    }

    await analyticsService.recordDuration(
      parsed.data.visit_id,
      parsed.data.duration_ms,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("POST /api/analytics/visits/duration failed:", error);
    return new NextResponse(null, { status: 204 });
  }
}
