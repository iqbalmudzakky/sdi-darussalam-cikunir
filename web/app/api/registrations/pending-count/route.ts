import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as registrationService from "@/modules/registration/service";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await registrationService.countPendingFollowUp();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("GET /api/registrations/pending-count failed:", error);
    return NextResponse.json(
      { error: "Failed to get pending count" },
      { status: 500 },
    );
  }
}
