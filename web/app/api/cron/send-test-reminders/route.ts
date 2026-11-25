import { NextResponse } from "next/server";
import * as admissionTestService from "@/modules/admission-test/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await admissionTestService.sendTomorrowReminderEmails();
    console.info("GET /api/cron/send-test-reminders done:", summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/cron/send-test-reminders failed:", error);
    return NextResponse.json(
      { error: "Gagal mengirim email pengingat." },
      { status: 500 },
    );
  }
}
