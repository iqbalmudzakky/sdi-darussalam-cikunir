import { createClient } from "@/lib/supabase/server";

function extractStoragePath(bucket: string, publicUrl: string): string | null {
  const marker = `/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}

export async function removeStoragePhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  photoUrl: string | null,
) {
  if (!photoUrl) return;
  const path = extractStoragePath(bucket, photoUrl);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
