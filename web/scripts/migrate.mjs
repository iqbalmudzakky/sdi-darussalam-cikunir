// Menjalankan berkas migrasi di modules/db/migrations yang belum pernah dipakai
// di database tujuan, urut nama berkas.
//
// Jalankan dari web/:
//
//   node scripts/migrate.mjs            # pakai DATABASE_URL dari lingkungan
//   node scripts/migrate.mjs --dry-run  # hanya menampilkan yang akan dijalankan
//
// Berkas di subfolder TIDAK ikut dijalankan — _supabase/ berisi migrasi lama
// yang isinya sudah terwakili oleh baseline.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "modules",
  "db",
  "migrations",
);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[migrate] DATABASE_URL is not set.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 10,
  // "already exists" dari IF NOT EXISTS bukan kabar yang perlu dibaca siapa pun.
  onnotice: (notice) => {
    if (notice.code !== "42P07") console.warn("[migrate]", notice.message);
  },
});

async function listMigrationFiles() {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
}

async function listApplied() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  const rows = await sql`SELECT name FROM schema_migrations`;
  return new Set(rows.map((row) => row.name));
}

async function run() {
  const [files, applied] = await Promise.all([
    listMigrationFiles(),
    listApplied(),
  ]);

  const pending = files.filter((name) => !applied.has(name));
  if (pending.length === 0) {
    console.log("[migrate] nothing to apply.");
    return;
  }

  console.log(`[migrate] ${pending.length} migration(s) pending:`);
  for (const name of pending) console.log(`  - ${name}`);
  if (dryRun) return;

  for (const name of pending) {
    const statements = await readFile(path.join(MIGRATIONS_DIR, name), "utf8");

    // Tiap berkas membawa BEGIN/COMMIT-nya sendiri (konvensi PRD 6.3), jadi
    // dijalankan apa adanya lalu dicatat — bukan dibungkus transaksi kedua.
    // .simple() wajib: protokol extended hanya menerima SATU perintah per query.
    await sql.unsafe(statements).simple();
    await sql`INSERT INTO schema_migrations ${sql({ name })}`;

    console.log(`[migrate] applied ${name}`);
  }
}

try {
  await run();
} catch (error) {
  console.error("[migrate] failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
