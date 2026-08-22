// One-time script to copy content-table rows from staging to production.
// Run from web/ so Node resolves the `postgres` package from node_modules:
//
//   STAGING_DATABASE_URL="postgresql://..." PRODUCTION_DATABASE_URL="postgresql://..." node modules/db/migrate-staging-data-to-production.mjs
//
// Only copies the 6 content tables — admin_users/refresh_tokens are
// intentionally excluded (production already has its own fresh superadmin
// seeded by bootstrap-production.sql).

import postgres from "postgres";

const stagingUrl = process.env.STAGING_DATABASE_URL;
const productionUrl = process.env.PRODUCTION_DATABASE_URL;

if (!stagingUrl || !productionUrl) {
  console.error(
    "Set STAGING_DATABASE_URL and PRODUCTION_DATABASE_URL env vars first.",
  );
  process.exit(1);
}

const staging = postgres(stagingUrl, { prepare: false });
const production = postgres(productionUrl, { prepare: false });

const TABLES = [
  "school_profiles",
  "facilities",
  "programs",
  "activities",
  "achievements",
  "registrations",
];

async function migrateTable(table) {
  const rows = await staging.unsafe(`SELECT * FROM ${table}`);

  if (rows.length === 0) {
    console.log(`[${table}] no rows in staging, skipped.`);
    return;
  }

  const columns = Object.keys(rows[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  let inserted = 0;

  for (const row of rows) {
    const values = columns.map((col) => row[col]);
    await production.unsafe(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values,
    );
    inserted++;
  }

  console.log(`[${table}] migrated ${inserted}/${rows.length} rows.`);
}

async function main() {
  for (const table of TABLES) {
    await migrateTable(table);
  }

  await staging.end();
  await production.end();
  console.log("Done.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
