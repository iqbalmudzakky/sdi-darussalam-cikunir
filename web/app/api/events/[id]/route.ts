import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import * as eventService from "@/modules/event/service";
import { SaveEventRequestSchema } from "@/modules/event/dto";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = SaveEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const event = await eventService.updateEvent(id, parsed.data);
    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidatePath("/");
    revalidatePath("/event");
    return NextResponse.json(event);
  } catch (error) {
    console.error(`PUT /api/events/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal menyimpan event." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await eventService.deleteEvent(id);
    revalidatePath("/");
    revalidatePath("/event");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/events/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus event." },
      { status: 500 },
    );
  }
}
