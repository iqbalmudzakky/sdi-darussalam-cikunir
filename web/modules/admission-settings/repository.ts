import { sql } from "@/modules/db/postgres";
import type {
  AdmissionSettingsRow,
  SaveAdmissionSettingsInput,
} from "./entity";

export async function get(): Promise<AdmissionSettingsRow | null> {
  const rows = await sql.unsafe<AdmissionSettingsRow[]>(
    `SELECT tahfizh_yearly_fee, tahfizh_july_fee, unggulan_yearly_fee,
            unggulan_july_fee, darussalam_discount, other_discount,
            payment_deadline::text AS payment_deadline, bank_name,
            bank_account_number, bank_account_name, principal_name,
            committee_chair_name, director_name, pmb_contact_phone,
            letter_contacts, updated_at
     FROM admission_settings
     WHERE singleton_guard`,
  );
  return rows[0] ?? null;
}

export async function update(input: SaveAdmissionSettingsInput): Promise<void> {
  const contactsJson = JSON.stringify(input.letter_contacts);
  await sql.unsafe(
    `UPDATE admission_settings
     SET tahfizh_yearly_fee = $1, tahfizh_july_fee = $2,
         unggulan_yearly_fee = $3, unggulan_july_fee = $4,
         darussalam_discount = $5, other_discount = $6,
         payment_deadline = $7, bank_name = $8, bank_account_number = $9,
         bank_account_name = $10, principal_name = $11,
         committee_chair_name = $12, director_name = $13,
         pmb_contact_phone = $14, letter_contacts = $15::text::jsonb,
         updated_by = $16, updated_at = now()
     WHERE singleton_guard`,
    [
      input.tahfizh_yearly_fee,
      input.tahfizh_july_fee,
      input.unggulan_yearly_fee,
      input.unggulan_july_fee,
      input.darussalam_discount,
      input.other_discount,
      input.payment_deadline,
      input.bank_name,
      input.bank_account_number,
      input.bank_account_name,
      input.principal_name,
      input.committee_chair_name,
      input.director_name,
      input.pmb_contact_phone,
      contactsJson,
      input.actorId,
    ],
  );
}
