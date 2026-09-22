BEGIN;

-- Migration: create table doku_notification_events
-- DOKU retries an HTTP Notification up to 3 more times when our endpoint does
-- not answer 2xx, so the same event can legitimately arrive several times. We
-- record every accepted notification keyed by DOKU's own Request-Id and let the
-- unique constraint reject replays, which keeps the handler idempotent as the
-- integration guide requires.
CREATE TABLE IF NOT EXISTS doku_notification_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id text NOT NULL UNIQUE,
    invoice_number text,
    transaction_status text,
    body jsonb NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS doku_notification_events_invoice_idx
    ON doku_notification_events (invoice_number);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS doku_notification_events;
-- COMMIT;
