-- Row Level Security policies
-- Fail-closed: missing/malformed JWT claims deny access

ALTER TABLE geographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: extract role from JWT (subquery for performance)
-- Returns NULL if claim missing → fail-closed

-- ============ GEOGRAPHIES ============
-- All authenticated users can read
CREATE POLICY geographies_select ON geographies
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY geographies_update ON geographies
  FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- ============ PROFILES ============
-- Admins see all; champions see only their own
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );

-- ============ PROSPECTS ============
-- Champions: geography-scoped. Admins: all.
CREATE POLICY prospects_select ON prospects
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY prospects_insert ON prospects
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY prospects_update ON prospects
  FOR UPDATE TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- Delete: admin-only
CREATE POLICY prospects_delete ON prospects
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- ============ CHILDREN ============
-- Same geography-scoped pattern using denormalized geography_id
CREATE POLICY children_select ON children
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY children_insert ON children
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY children_update ON children
  FOR UPDATE TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY children_delete ON children
  FOR DELETE TO authenticated
  USING ((SELECT auth.jwt() ->> 'role') = 'admin');

-- ============ NOTES ============
CREATE POLICY notes_select ON notes
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY notes_insert ON notes
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- ============ STATUS_HISTORY ============
CREATE POLICY status_history_select ON status_history
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

CREATE POLICY status_history_insert ON status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- ============ AUDIT_LOG ============
-- Insert: all authenticated users
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Select: admins see all; champions see their geography only (for activity feed)
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() ->> 'role') = 'admin'
    OR geography_id = ((SELECT auth.jwt() ->> 'geography_id'))::uuid
  );

-- No UPDATE or DELETE on audit_log — entries are immutable
