BEGIN;

-- Migration: create table site_visits
-- Counts visits to the public landing page so the admin dashboard can show
-- traffic without depending on an analytics vendor. The site has exactly one
-- public page (app/page.tsx), so there is deliberately no `path` column: it
-- would hold the same value on every row. Add one, and move the tracker to the
-- root layout, if a second public page ever ships.
--
-- No IP address and no user agent are stored. Both are used once, in memory, to
-- build visitor_hash and to drop obvious crawlers, and are then discarded.
CREATE TABLE IF NOT EXISTS site_visits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- sha256 of IP + user agent + a server secret + the current date in
    -- Asia/Jakarta. Lets us count distinct people per day without keeping
    -- anything that identifies them: the date in the input means yesterday's
    -- hash for the same visitor is a different value, so the table cannot be
    -- used to follow someone over time, and the secret makes the hash
    -- impractical to reverse by trying every IPv4 address.
    visitor_hash text NOT NULL,

    -- How long the page stayed open, filled in by a later beacon. Nullable on
    -- purpose and often null: the browser does not always get to send the
    -- beacon, so averages must skip these rows rather than read them as zero.
    duration_ms integer CHECK (duration_ms >= 0),

    visited_at timestamptz NOT NULL DEFAULT now()
);

-- Every dashboard query filters or sorts by time.
CREATE INDEX IF NOT EXISTS site_visits_visited_at_idx
    ON site_visits (visited_at DESC);

-- Unique-visitor counts group by hash within a time window.
CREATE INDEX IF NOT EXISTS site_visits_visitor_hash_visited_at_idx
    ON site_visits (visitor_hash, visited_at);

-- Same reasoning as doku_notification_events: this is an internal table written
-- only by our own API routes over DATABASE_URL. Nobody reaches it through
-- Supabase's REST API, so it gets no policy at all — not for anon, not for
-- authenticated. Admin reads go through the server, which does not use RLS.
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS site_visits;
-- COMMIT;
