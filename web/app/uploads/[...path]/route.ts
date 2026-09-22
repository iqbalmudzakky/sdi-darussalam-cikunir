import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const uploadDir = process.env.UPLOAD_DIR;
  if (!uploadDir) {
    console.error("[uploads] UPLOAD_DIR is not set.");
    return new NextResponse(null, { status: 404 });
  }

  const { path: segments } = await params;
  const root = path.resolve(uploadDir);
  const target = path.resolve(root, ...segments);

  /* Jalur yang keluar dari UPLOAD_DIR ditolak: tanpa ini, ".." pada URL bisa
   * membaca berkas mana pun yang terjangkau proses ini. */
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse(null, { status: 404 });

    const contentType =
      CONTENT_TYPES[path.extname(target).toLowerCase()] ??
      "application/octet-stream";

    const stream = Readable.toWeb(
      createReadStream(target),
    ) as ReadableStream<Uint8Array>;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        /* Nama berkas memuat UUID, jadi isinya tidak pernah berubah. */
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[uploads] failed to serve file:", error);
    }
    return new NextResponse(null, { status: 404 });
  }
}
