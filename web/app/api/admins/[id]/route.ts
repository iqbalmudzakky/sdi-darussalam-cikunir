import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";
import {
  UpdateAdminRequestSchema,
  type AdminMutationFailure,
  type AdminTargetInput,
  type UpdateAdminInput,
} from "@/modules/admin/dto";

function statusFor(reason: AdminMutationFailure) {
  if (reason === "not_found") return 404;
  if (reason === "self" || reason === "forbidden_role") return 403;
  return 409;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("manage_accounts");
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const updateInput: UpdateAdminInput = {
      actingUser: user,
      targetId: id,
      patch: parsed.data,
    };
    const result = await adminService.updateAdmin(updateInput);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: statusFor(result.reason) },
      );
    }
    return NextResponse.json(result.admin);
  } catch (error) {
    console.error(`PATCH /api/admins/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui admin." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePermission("manage_accounts");
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const deleteInput: AdminTargetInput = {
      actingUser: user,
      targetId: id,
    };
    const result = await adminService.deleteAdmin(deleteInput);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: statusFor(result.reason) },
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/admins/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus admin." },
      { status: 500 },
    );
  }
}
