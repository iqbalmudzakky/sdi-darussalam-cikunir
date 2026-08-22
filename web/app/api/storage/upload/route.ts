import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { uploadStoragePhoto } from "@/modules/storage/storage";

const ALLOWED_BUCKETS = new Set([
  "activity-photos",
  "facility-photos",
  "school-profile-photos",
]);

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bucket = formData.get("bucket");

  if (
    !(file instanceof File) ||
    typeof bucket !== "string" ||
    !ALLOWED_BUCKETS.has(bucket)
  ) {
    return NextResponse.json(
      { error: "Data upload tidak valid." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadStoragePhoto(bucket, file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("POST /api/storage/upload failed:", error);
    return NextResponse.json({ error: "Gagal unggah foto." }, { status: 500 });
  }
}
