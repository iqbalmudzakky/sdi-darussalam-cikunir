// Menyalin foto dari Supabase Storage ke UPLOAD_DIR, lalu menulis ulang kolom
// URL-nya di database menjadi jalur lokal (/uploads/<bucket>/<berkas>).
//
// Dijalankan SESUDAH scripts/copy-db.mjs: barisnya harus sudah ada di database
// tujuan, masih menunjuk URL Supabase.
//
// Jalankan dari web/:
//
//   node --env-file=.env.local scripts/copy-storage.mjs
//   node --env-file=.env.local scripts/copy-storage.mjs --dry-run
//
// Bisa dijalankan ulang: berkas yang sudah ada di disk tidak diunduh lagi, dan
// baris yang jalurnya sudah lokal dilewati.

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const uploadDir = process.env.UPLOAD_DIR;

if (!databaseUrl || !uploadDir) {
  console.error("[copy-storage] DATABASE_URL and UPLOAD_DIR must be set.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10 });

// Setiap kolom yang menyimpan URL foto, beserta bucket asalnya.
const PHOTO_COLUMNS = [
  { table: "activities", column: "photo_url", bucket: "activity-photos" },
  { table: "facilities", column: "photo_url", bucket: "facility-photos" },
  {
    table: "school_profiles",
    column: "photo_url",
    bucket: "school-profile-photos",
  },
  {
    table: "school_profiles",
    column: "vision_photo_url",
    bucket: "school-profile-photos",
  },
  { table: "events", column: "poster_url", bucket: "event-photos" },
];

function fileNameFrom(bucket, url) {
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const name = path.basename(
    decodeURIComponent(url.slice(index + marker.length)),
  );
  return name === "" || name === "." || name === ".." ? null : name;
}

async function alreadyOnDisk(target) {
  try {
    const info = await stat(target);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

async function copyColumn({ table, column, bucket }) {
  const rows = await sql`
    SELECT id, ${sql(column)} AS url
    FROM ${sql(table)}
    WHERE ${sql(column)} IS NOT NULL
      AND ${sql(column)} NOT LIKE '/uploads/%'
  `;

  let copied = 0;
  let skipped = 0;

  for (const row of rows) {
    const fileName = fileNameFrom(bucket, row.url);
    if (!fileName) {
      console.warn(
        `[copy-storage] ${table}.${column} id=${row.id}: cannot parse ${row.url}`,
      );
      skipped += 1;
      continue;
    }

    const target = path.join(uploadDir, bucket, fileName);
    const localUrl = `/uploads/${bucket}/${fileName}`;

    if (dryRun) {
      console.log(`  ${table}.${column} id=${row.id} → ${localUrl}`);
      copied += 1;
      continue;
    }

    if (!(await alreadyOnDisk(target))) {
      const response = await fetch(row.url);
      if (!response.ok) {
        // Dilaporkan, bukan dilewati diam-diam: baris ini akan kehilangan
        // fotonya begitu Supabase dimatikan.
        console.error(
          `[copy-storage] ${table}.${column} id=${row.id}: download failed (${response.status}) ${row.url}`,
        );
        skipped += 1;
        continue;
      }

      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
    }

    await sql`
      UPDATE ${sql(table)} SET ${sql(column)} = ${localUrl} WHERE id = ${row.id}
    `;
    copied += 1;
  }

  return { total: rows.length, copied, skipped };
}

async function run() {
  let totalSkipped = 0;

  for (const entry of PHOTO_COLUMNS) {
    const { total, copied, skipped } = await copyColumn(entry);
    totalSkipped += skipped;
    console.log(
      `[copy-storage] ${entry.table}.${entry.column}: ${copied}/${total} copied` +
        (skipped > 0 ? `, ${skipped} skipped` : ""),
    );
  }

  if (dryRun) return;

  // Verifikasi: setiap jalur yang tercatat di database harus benar-benar ada
  // sebagai berkas. Tanpa ini, foto yang gagal tersalin baru ketahuan sebagai
  // gambar rusak di halaman publik.
  let missing = 0;
  for (const { table, column, bucket } of PHOTO_COLUMNS) {
    const rows = await sql`
      SELECT id, ${sql(column)} AS url
      FROM ${sql(table)}
      WHERE ${sql(column)} LIKE '/uploads/%'
    `;

    for (const row of rows) {
      const fileName = fileNameFrom(bucket, row.url);
      const target = fileName && path.join(uploadDir, bucket, fileName);
      if (!target || !(await alreadyOnDisk(target))) {
        missing += 1;
        console.error(
          `[copy-storage] MISSING FILE ${table}.${column} id=${row.id}: ${row.url}`,
        );
      }
    }
  }

  if (missing > 0 || totalSkipped > 0) {
    throw new Error(
      `${missing} missing file(s), ${totalSkipped} skipped row(s)`,
    );
  }
  console.log("[copy-storage] verified: every stored path exists on disk.");
}

try {
  await run();
} catch (error) {
  console.error("[copy-storage] failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
