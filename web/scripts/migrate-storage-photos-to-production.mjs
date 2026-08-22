// One-time script to copy actual photo files from staging Storage into
// production Storage, then repoint each row's photo_url to production.
// Run AFTER migrate-staging-data-to-production.mjs (rows must already
// exist in production, still pointing at staging URLs at this point).
//
// Run from web/:
//
//   PRODUCTION_DATABASE_URL="postgresql://..." PRODUCTION_SUPABASE_URL="https://xxx.supabase.co" PRODUCTION_SERVICE_ROLE_KEY="..." node modules/db/migrate-storage-photos-to-production.mjs

import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const productionDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;
const productionSupabaseUrl = process.env.PRODUCTION_SUPABASE_URL;
const productionServiceRoleKey = process.env.PRODUCTION_SERVICE_ROLE_KEY;

if (!productionDatabaseUrl || !productionSupabaseUrl || !productionServiceRoleKey) {
  console.error(
    "Set PRODUCTION_DATABASE_URL, PRODUCTION_SUPABASE_URL, PRODUCTION_SERVICE_ROLE_KEY first.",
  );
  process.exit(1);
}

const sql = postgres(productionDatabaseUrl, { prepare: false });
const supabase = createClient(productionSupabaseUrl, productionServiceRoleKey);

const TABLES_WITH_PHOTO = [
  { table: "school_profiles", bucket: "school-profile-photos" },
  { table: "facilities", bucket: "facility-photos" },
  { table: "activities", bucket: "activity-photos" },
];

function extractPath(bucket, url) {
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

async function migratePhotosForTable(table, bucket) {
  const rows = await sql.unsafe(
    `SELECT id, photo_url FROM ${table} WHERE photo_url IS NOT NULL`,
  );

  for (const row of rows) {
    const path = extractPath(bucket, row.photo_url);
    if (!path) {
      console.log(`[${table}] skip id=${row.id}, can't parse path from ${row.photo_url}`);
      continue;
    }

    const response = await fetch(row.photo_url);
    if (!response.ok) {
      console.log(`[${table}] skip id=${row.id}, fetch failed (${response.status})`);
      continue;
    }

    const contentType = response.headers.get("content-type") ?? undefined;
    const arrayBuffer = await response.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, Buffer.from(arrayBuffer), { upsert: true, contentType });

    if (uploadError) {
      console.log(`[${table}] skip id=${row.id}, upload failed:`, uploadError.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    await sql.unsafe(`UPDATE ${table} SET photo_url = $1 WHERE id = $2`, [
      publicUrl,
      row.id,
    ]);
    console.log(`[${table}] migrated photo for id=${row.id}`);
  }
}

async function main() {
  for (const { table, bucket } of TABLES_WITH_PHOTO) {
    await migratePhotosForTable(table, bucket);
  }

  await sql.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error("Photo migration failed:", error);
  process.exit(1);
});
