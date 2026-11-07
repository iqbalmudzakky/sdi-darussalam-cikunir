import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/* Dibaca di dalam fungsi supaya variabel yang hilang muncul sebagai error pada
 * request yang membutuhkannya, bukan menggagalkan build. */
function uploadDir(): string {
  const value = process.env.UPLOAD_DIR;
  if (!value) {
    throw new Error("Environment variable UPLOAD_DIR is not set.");
  }
  return value;
}

export const UPLOAD_URL_PREFIX = "/uploads";

/* Nama berkas dari pengguna dipakai sebagai nama di disk, jadi dibatasi ke
 * karakter yang aman: tanpa jalur, tanpa spasi, tanpa karakter khusus. */
function safeFileName(originalName: string): string {
  const base = path.basename(originalName);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "");
  return cleaned || "file";
}

/* Menerima jalur baru (/uploads/<bucket>/<berkas>) maupun URL Supabase lama,
 * karena keduanya masih ada di database selama masa pindahan. */
function extractFileName(bucket: string, storedUrl: string): string | null {
  const marker = `/${bucket}/`;
  const index = storedUrl.indexOf(marker);
  if (index === -1) return null;

  const rest = decodeURIComponent(storedUrl.slice(index + marker.length));
  const name = path.basename(rest);
  return name === "" || name === "." || name === ".." ? null : name;
}

export async function removeStoragePhoto(
  bucket: string,
  photoUrl: string | null,
) {
  if (!photoUrl) return;
  const fileName = extractFileName(bucket, photoUrl);
  if (!fileName) return;

  try {
    await unlink(path.join(uploadDir(), bucket, fileName));
  } catch (error) {
    /* Berkas yang memang sudah tidak ada bukan kegagalan — termasuk foto lama
     * yang masih menunjuk Supabase dan tidak pernah ada di disk ini. */
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
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
  const fileName = `${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const directory = path.join(uploadDir(), bucket);

  try {
    await mkdir(directory, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(directory, fileName), bytes);
  } catch (error) {
    console.error(
      `[storage] uploadStoragePhoto failed for bucket "${bucket}":`,
      error,
    );
    throw error;
  }

  return `${UPLOAD_URL_PREFIX}/${bucket}/${fileName}`;
}
