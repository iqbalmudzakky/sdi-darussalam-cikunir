BEGIN;

-- Migration: add whatsapp + whatsapp_message to school_profiles
-- Powers the WhatsApp icon in the "Ikuti Kami" social links section on the
-- landing page. Clicking it deep-links to wa.me with the configured
-- template message pre-filled. `telepon` stays as the plain school phone
-- number shown in the Kontak section and is unrelated to this.
ALTER TABLE school_profiles
    ADD COLUMN IF NOT EXISTS whatsapp text NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS whatsapp_message text NOT NULL DEFAULT '';

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE school_profiles DROP COLUMN IF EXISTS whatsapp_message;
-- ALTER TABLE school_profiles DROP COLUMN IF EXISTS whatsapp;
-- COMMIT;
