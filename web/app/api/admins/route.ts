import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/session";
import * as authService from "@/modules/auth/service";
import { InviteAdminRequestSchema } from "@/modules/auth/dto";

export async function GET() {
  const user = await requireSuperadmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admins = await authService.listAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET /api/admins failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar admin." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireSuperadmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = InviteAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const result = await authService.inviteAdmin(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }
    return NextResponse.json(result.admin, { status: 201 });
  } catch (error) {
    console.error("POST /api/admins failed:", error);
    return NextResponse.json(
      { error: "Gagal mengundang admin." },
      { status: 500 },
    );
  }
}
