BEGIN;

-- Migration: enable RLS on registration_payments and doku_notification_events
-- Same reasoning as registrations: every write goes through our own API routes
-- using the service role key (which bypasses RLS), so anon gets no policy at
-- all and cannot read registrant biodata out of `payload` via Supabase's REST
-- API. Admins only need read access, and only on registration_payments —
-- doku_notification_events is an internal replay log with no policy for anyone.
ALTER TABLE registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doku_notification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view registration payments"
  ON registration_payments FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can view registration payments" ON registration_payments;
-- ALTER TABLE doku_notification_events DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE registration_payments DISABLE ROW LEVEL SECURITY;
-- COMMIT;
