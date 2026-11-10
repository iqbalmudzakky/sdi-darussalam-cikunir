import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireSuperadmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await adminService.resendInvite(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }
    return NextResponse.json(result.admin);
  } catch (error) {
    console.error(`POST /api/admins/${id}/resend-invite failed:`, error);
    return NextResponse.json(
      { error: "Gagal mengirim ulang undangan." },
      { status: 500 },
    );
  }
}
