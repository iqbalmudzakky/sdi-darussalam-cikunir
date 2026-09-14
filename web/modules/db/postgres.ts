import postgres from "postgres";
import type { Options, TransactionSql } from "postgres";

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// max_pipeline ada di runtime postgres.js tapi belum masuk definisi tipenya.
const connectionOptions: Options<Record<string, never>> & {
  max_pipeline: number;
} = {
  prepare: false,
  connect_timeout: 10,
  max: isBuild ? 1 : 10,
  idle_timeout: 20,
  // Pooler Supabase mode transaksi (:6543) menukar hasil query yang di-pipeline — query jadi salah data atau menggantung.
  max_pipeline: 0,
};

export const sql =
  globalForDb.sql ?? postgres(process.env.DATABASE_URL!, connectionOptions);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export async function withTransaction<T>(
  fn: (tx: TransactionSql) => Promise<T>,
): Promise<T> {
  return sql.begin((tx) => fn(tx)) as Promise<T>;
}
