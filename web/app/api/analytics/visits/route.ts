import { NextResponse } from "next/server";
import * as analyticsService from "@/modules/analytics/service";
import { getClientIp } from "@/modules/shared/clientIp";

export async function POST(request: Request) {
  try {
    const visitId = await analyticsService.recordVisit(
      getClientIp(request),
      request.headers.get("user-agent") ?? "",
    );

    if (!visitId) {
      return NextResponse.json({ id: null });
    }

    return NextResponse.json({ id: visitId });
  } catch (error) {
    console.error("POST /api/analytics/visits failed:", error);
    return NextResponse.json({ id: null });
  }
}
