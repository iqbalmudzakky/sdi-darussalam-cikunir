import postgres from "postgres";
import type { Options, TransactionSql } from "postgres";

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

const connectionOptions: Options<Record<string, never>> = {
  prepare: false,
  connect_timeout: 10,
  max: isBuild ? 1 : 10,
  idle_timeout: 20,
};

if (/:6543\//.test(process.env.DATABASE_URL ?? "")) {
  console.error(
    "[db] DATABASE_URL points to the transaction pooler (:6543). Use the session pooler (:5432) — pipelined query results can get swapped.",
  );
}

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
