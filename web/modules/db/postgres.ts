import postgres from "postgres";

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}
