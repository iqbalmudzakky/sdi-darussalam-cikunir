import { createServiceRoleClient } from "./client";

function extractStoragePath(bucket: string, publicUrl: string): string | null {
  const marker = `/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(publicUrl.slice(index + marker.length));
}

export async function removeStoragePhoto(
  bucket: string,
  photoUrl: string | null,
) {
  if (!photoUrl) return;
  const path = extractStoragePath(bucket, photoUrl);
  if (!path) return;

  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(
        `[storage] removeStoragePhoto failed for bucket "${bucket}" (non-fatal):`,
        error,
      );
    }
  } catch (error) {
    console.error(
      `[storage] removeStoragePhoto failed for bucket "${bucket}" (non-fatal):`,
      error,
    );
  }
}

export async function uploadStoragePhoto(
  bucket: string,
  file: File,
): Promise<string> {
  const supabase = createServiceRoleClient();
  const filePath = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) {
    console.error(
      `[storage] uploadStoragePhoto failed for bucket "${bucket}":`,
      error,
    );
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}
