BEGIN;

-- Migration: create table registration_payments
-- Holds the pending PPDB registration biodata together with its DOKU Checkout
-- session. The row is created when the applicant submits the form; the biodata
-- lives in the `payload` jsonb column until DOKU confirms the payment, at which
-- point the notification handler inserts it into `registrations` and links the
-- two rows via registration_id. Unpaid submissions therefore never pollute the
-- registrations table.
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'expired');

CREATE TABLE IF NOT EXISTS registration_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- order.invoice_number sent to DOKU. Kept <= 30 chars so the Credit Card
    -- channel accepts it, and unique so a notification maps to exactly one row.
    invoice_number text NOT NULL UNIQUE,
    amount integer NOT NULL CHECK (amount > 0),
    status payment_status NOT NULL DEFAULT 'pending',

    -- Validated CreateRegistrationRequest, minus ip_address. Promoted into the
    -- registrations table only after a SUCCESS notification.
    payload jsonb NOT NULL,

    -- Set once the payment succeeds and the registration row is created.
    registration_id uuid REFERENCES registrations (id) ON DELETE SET NULL,

    -- Echoed back by DOKU on the create-session response.
    session_id text,
    token_id text,
    payment_url text,
    expired_date text,

    -- Filled in from the HTTP Notification body for admin traceability.
    payment_method text,
    acquirer text,
    paid_at timestamptz,

    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS registration_payments_status_idx
    ON registration_payments (status);

CREATE INDEX IF NOT EXISTS registration_payments_created_at_idx
    ON registration_payments (created_at DESC);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS registration_payments;
-- DROP TYPE IF EXISTS payment_status;
-- COMMIT;
