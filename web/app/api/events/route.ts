import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import * as eventService from "@/modules/event/service";
import { SaveEventRequestSchema } from "@/modules/event/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await eventService.listEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat data event." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SaveEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const event = await eventService.createEvent(parsed.data);
    revalidatePath("/");
    revalidatePath("/event", "layout");
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events failed:", error);
    return NextResponse.json(
      { error: "Gagal membuat event." },
      { status: 500 },
    );
  }
}
