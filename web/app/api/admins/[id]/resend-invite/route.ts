import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";
import type { AdminTargetInput } from "@/modules/admin/dto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("manage_accounts");
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const resendInput: AdminTargetInput = {
      actingUser: user,
      targetId: id,
    };
    const result = await adminService.resendInvite(resendInput);
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
