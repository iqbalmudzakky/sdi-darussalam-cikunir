import { sql } from "@/modules/db/postgres";
import type { PaymentSettings } from "./entity";

const COLUMNS = `id, registration_fee, created_at, updated_at`;

export async function get(): Promise<PaymentSettings | null> {
  const rows = await sql.unsafe<PaymentSettings[]>(
    `SELECT ${COLUMNS} FROM payment_settings LIMIT 1`,
  );
  return rows[0] ?? null;
}

/* Baris pengaturan hanya satu, dijaga singleton_guard, jadi tanpa id. */
export async function updateFee(fee: number): Promise<PaymentSettings | null> {
  const rows = await sql.unsafe<PaymentSettings[]>(
    `UPDATE payment_settings
     SET registration_fee = $1, updated_at = now()
     WHERE singleton_guard
     RETURNING ${COLUMNS}`,
    [fee],
  );
  return rows[0] ?? null;
}
