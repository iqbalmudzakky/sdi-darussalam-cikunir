import { sql } from "@/modules/db/postgres";
import type { PaymentSettings, PaymentSettingsUpdateInput } from "./entity";

export async function get(): Promise<PaymentSettings | null> {
  const rows = await sql.unsafe<PaymentSettings[]>(
    `SELECT registration_fee, registration_opens_on, registration_closes_on, updated_at
     FROM payment_settings
     LIMIT 1`,
  );
  return rows[0] ?? null;
}

/* Baris pengaturan hanya satu, dijaga singleton_guard, jadi tanpa id. */
export async function update(
  input: PaymentSettingsUpdateInput,
): Promise<PaymentSettings | null> {
  const rows = await sql.unsafe<PaymentSettings[]>(
    `UPDATE payment_settings
     SET registration_fee = $1, registration_opens_on = $2,
         registration_closes_on = $3, updated_at = now()
     WHERE singleton_guard
     RETURNING registration_fee, registration_opens_on, registration_closes_on, updated_at`,
    [
      input.registrationFee,
      input.registrationOpensOn,
      input.registrationClosesOn,
    ],
  );
  return rows[0] ?? null;
}
