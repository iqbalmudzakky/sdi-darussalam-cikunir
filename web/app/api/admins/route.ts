import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";
import {
  InviteAdminRequestSchema,
  type InviteAdminInput,
} from "@/modules/admin/dto";

export async function GET() {
  const user = await requirePermission("manage_accounts");
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const admins = await adminService.listAdmins(user);
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
  const user = await requirePermission("manage_accounts");
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
    const inviteInput: InviteAdminInput = {
      actingUser: user,
      request: parsed.data,
    };
    const result = await adminService.inviteAdmin(inviteInput);
    if (!result.ok) {
      const status = result.reason === "forbidden_role" ? 403 : 409;
      return NextResponse.json({ error: result.message }, { status });
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
