BEGIN;

-- Migration: add registration window to payment_settings
-- Lets admin schedule when public online registration is open instead of it
-- always being on. NULL in either column means the window isn't configured
-- yet, treated as closed — same safe default as before this feature existed.
ALTER TABLE payment_settings
    ADD COLUMN registration_opens_on date,
    ADD COLUMN registration_closes_on date,
    ADD CONSTRAINT registration_window_valid_range
        CHECK (
            registration_opens_on IS NULL
            OR registration_closes_on IS NULL
            OR registration_closes_on >= registration_opens_on
        );

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE payment_settings
--     DROP CONSTRAINT registration_window_valid_range,
--     DROP COLUMN registration_opens_on,
--     DROP COLUMN registration_closes_on;
-- COMMIT;
