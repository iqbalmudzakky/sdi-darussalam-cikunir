// Menyalin seluruh isi tabel dari satu database PMB ke database PMB lain —
// dipakai saat pindah dari Supabase ke Postgres sendiri.
//
// Skema di tujuan harus SUDAH ada (jalankan scripts/migrate.mjs lebih dulu).
//
// Jalankan dari web/:
//
//   SOURCE_DATABASE_URL="postgres://...supabase..." \
//   node --env-file=.env.local scripts/copy-db.mjs --truncate
//
// --truncate  mengosongkan tabel tujuan lebih dulu, supaya bisa diulang tanpa
//             menumpuk baris. Tanpa ini, tabel tujuan harus benar-benar kosong.
// --dry-run   hanya menampilkan urutan tabel dan jumlah baris di sumber.

import postgres from "postgres";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  console.error("[copy-db] SOURCE_DATABASE_URL and DATABASE_URL must be set.");
  process.exit(1);
}
if (sourceUrl === targetUrl) {
  console.error("[copy-db] source and target are the same database.");
  process.exit(1);
}

const truncate = process.argv.includes("--truncate");
const dryRun = process.argv.includes("--dry-run");

const source = postgres(sourceUrl, { max: 1, connect_timeout: 10 });
const target = postgres(targetUrl, { max: 1, connect_timeout: 10 });

const BATCH_SIZE = 500;

// Tabel milik runner migrasi — isinya soal skema, bukan data aplikasi.
const SKIP_TABLES = new Set(["schema_migrations"]);

async function readTables() {
  const rows = await source`
    SELECT table_name AS name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  return rows.map((row) => row.name).filter((name) => !SKIP_TABLES.has(name));
}

// Ketergantungan foreign key: anak menunggu induknya. Dibaca dari database,
// bukan ditulis tangan, supaya urutannya ikut benar saat ada tabel baru.
async function readDependencies() {
  return source`
    SELECT child.relname AS child, parent.relname AS parent
    FROM pg_constraint c
    JOIN pg_class child ON child.oid = c.conrelid
    JOIN pg_class parent ON parent.oid = c.confrelid
    JOIN pg_namespace n ON n.oid = child.relnamespace
    WHERE c.contype = 'f' AND n.nspname = 'public'
  `;
}

function sortByDependency(tables, dependencies) {
  const pending = new Set(tables);
  const done = [];

  while (pending.size > 0) {
    const ready = [...pending].filter((table) =>
      dependencies.every(
        (dep) =>
          dep.child !== table ||
          dep.parent === table || // foreign key ke dirinya sendiri
          !pending.has(dep.parent),
      ),
    );

    if (ready.length === 0) {
      // Lingkaran ketergantungan: lebih baik berhenti daripada menebak urutan.
      throw new Error(
        `circular foreign keys between: ${[...pending].join(", ")}`,
      );
    }

    for (const table of ready) {
      pending.delete(table);
      done.push(table);
    }
  }

  return done;
}

async function copyTable(table) {
  const rows = await source`SELECT * FROM ${source(table)}`;
  if (rows.length === 0) return 0;

  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    const batch = rows.slice(index, index + BATCH_SIZE);
    await target`INSERT INTO ${target(table)} ${target(batch)}`;
  }

  return rows.length;
}

async function countRows(sql, table) {
  const [row] = await sql`SELECT count(*)::int AS total FROM ${sql(table)}`;
  return row.total;
}

async function run() {
  const [tables, dependencies] = await Promise.all([
    readTables(),
    readDependencies(),
  ]);
  const ordered = sortByDependency(tables, dependencies);

  console.log(`[copy-db] ${ordered.length} table(s), in this order:`);
  for (const table of ordered) console.log(`  - ${table}`);

  if (dryRun) {
    for (const table of ordered) {
      console.log(`  ${table}: ${await countRows(source, table)} row(s)`);
    }
    return;
  }

  if (truncate) {
    // Terbalik dari urutan salin: anak dikosongkan sebelum induknya.
    for (const table of [...ordered].reverse()) {
      await target`DELETE FROM ${target(table)}`;
    }
    console.log("[copy-db] target tables emptied.");
  }

  for (const table of ordered) {
    const copied = await copyTable(table);
    console.log(`[copy-db] ${table}: ${copied} row(s)`);
  }

  // Verifikasi: jumlah baris di kedua sisi harus sama persis untuk SETIAP tabel.
  // Tanpa ini, satu tabel yang gagal disalin hanya terlihat sebagai fitur yang
  // "kosong" berminggu-minggu kemudian.
  let mismatched = 0;
  for (const table of ordered) {
    const [from, to] = await Promise.all([
      countRows(source, table),
      countRows(target, table),
    ]);
    if (from !== to) {
      mismatched += 1;
      console.error(
        `[copy-db] MISMATCH ${table}: source ${from}, target ${to}`,
      );
    }
  }

  if (mismatched > 0) {
    throw new Error(`${mismatched} table(s) do not match`);
  }
  console.log("[copy-db] verified: row counts match for every table.");
}

try {
  await run();
} catch (error) {
  console.error("[copy-db] failed:", error);
  process.exitCode = 1;
} finally {
  await Promise.all([source.end(), target.end()]);
}
