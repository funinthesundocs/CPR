-- RLS policies for case_roles table
-- Safe to run multiple times (DROP IF EXISTS guards)

ALTER TABLE case_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_case_roles" ON case_roles;
CREATE POLICY "users_read_own_case_roles"
  ON case_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_case_roles" ON case_roles;
CREATE POLICY "users_insert_own_case_roles"
  ON case_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Service role bypasses RLS automatically (used by API routes for writes)
