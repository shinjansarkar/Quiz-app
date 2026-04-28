-- Supabase schema for QuizFlow
-- Run this in Supabase SQL editor (Project -> SQL Editor)

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- NOTE: This schema assumes you will map auth users to the `users` table by using
-- the auth.uid() value as the `owner_id` / `user_id` where appropriate.
-- You can either set users.id = auth.uid() when creating profiles, or store
-- auth user id in a separate `auth_id` column. Adjust RLS policies accordingly.

-- 2) Users (teacher / student profiles)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid, -- optional: store supabase.auth user id if you want to link profiles
  name text,
  identifier text,
  role text CHECK (role IN ('teacher','student')) DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_identifier_idx ON users(identifier);

-- 3) Tests
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL, -- should point to users.id (or auth uid as uuid)
  name text NOT NULL,
  passcode text,
  duration_seconds int,
  status text DEFAULT 'Draft', -- 'Draft' or 'Active'
  code text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tests_owner_idx ON tests(owner_id);

-- 4) Questions
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  text text NOT NULL,
  options jsonb NOT NULL, -- e.g. ['Option A', 'Option B', ...]
  correct_index int,
  edited_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_test_idx ON questions(test_id);

-- 5) Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  user_id uuid, -- reference users.id
  answers jsonb,
  score int,
  correct_count int,
  total_questions int,
  submitted_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS submissions_test_idx ON submissions(test_id);
CREATE INDEX IF NOT EXISTS submissions_user_idx ON submissions(user_id);

-- 6) Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- nullable: broadcast when null
  test_id uuid,
  type text,
  title text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);

-- 7) Example Row-Level Security (RLS) policies
-- IMPORTANT: Adjust these policies to how you map auth.uid() to users.id
-- (common pattern: users.id = auth.uid() or users.auth_id = auth.uid())

-- Enable RLS on tables you want protected
ALTER TABLE IF EXISTS tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Policy: allow owners (owner_id == auth.uid()) to select/insert/update/delete their own tests
CREATE POLICY IF NOT EXISTS "tests_owner_policy" ON tests
  USING (owner_id = auth.uid()::uuid)
  WITH CHECK (owner_id = auth.uid()::uuid);

-- Policy: allow authenticated users to select questions for tests they own / or that are Active
CREATE POLICY IF NOT EXISTS "questions_select_policy" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tests t WHERE t.id = questions.test_id AND (
        t.status = 'Active' OR t.owner_id = auth.uid()::uuid
      )
    )
  );

-- Policy: allow owners to insert/update/delete questions for their tests
CREATE POLICY IF NOT EXISTS "questions_owner_policy" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tests t WHERE t.id = questions.test_id AND t.owner_id = auth.uid()::uuid)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM tests t WHERE t.id = questions.test_id AND t.owner_id = auth.uid()::uuid)
  );

-- Policy: submissions: students may insert their own submission; teachers can view submissions for their tests
CREATE POLICY IF NOT_EXISTS "submissions_insert_policy" ON submissions
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "submissions_student_select" ON submissions
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY IF NOT EXISTS "submissions_teacher_select" ON submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tests t WHERE t.id = submissions.test_id AND t.owner_id = auth.uid()::uuid)
  );

-- Notifications: allow target user to see their notifications
CREATE POLICY IF NOT_EXISTS "notifications_user_policy" ON notifications
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid()::uuid);

-- 8) Example seed data (optional)
-- INSERT INTO users (id, auth_id, name, identifier, role) VALUES (gen_random_uuid(), null, 'Dr. Sarah Miller', 'EMP001', 'teacher');

-- 9) Notes
-- - If you use Supabase Auth, you'll typically create a trigger/function to ensure a profile row
--   exists in `users` when a new auth user signs up (see Supabase "Auth webhook" or triggers).
-- - RLS policies above assume owner_id and user_id are stored as UUIDs that match auth.uid().
--   If you instead store auth_id in `users.auth_id`, update the policies to join on users.auth_id.
-- - Test these policies in Supabase by toggling RLS and trying operations as different users.

-- End of schema
