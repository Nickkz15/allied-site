/*
# Store Allied recruitment test results

1. New Tables
- `allied_quiz_attempts` stores a visitor's submitted name, assigned division, and attribute scores.
- `id` uniquely identifies each attempt.
- `visitor_name` stores the name entered by the visitor.
- `division` stores the calculated Allied division.
- `scores` stores the calculated attribute percentages as JSON.
- `created_at` records when the attempt was submitted.

2. Security
- Row Level Security is enabled.
- This public, no-sign-in experience permits anonymous and authenticated visitors to create, read, update, and delete shared attempt records through separate policies.

3. Important Notes
- No personal account or authentication is required.
- The table is intentionally single-tenant because the quiz is a public recruitment experience.
*/

CREATE TABLE IF NOT EXISTS allied_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  division text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE allied_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read allied attempts" ON allied_quiz_attempts;
CREATE POLICY "Public can read allied attempts" ON allied_quiz_attempts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can create allied attempts" ON allied_quiz_attempts;
CREATE POLICY "Public can create allied attempts" ON allied_quiz_attempts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update allied attempts" ON allied_quiz_attempts;
CREATE POLICY "Public can update allied attempts" ON allied_quiz_attempts
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete allied attempts" ON allied_quiz_attempts;
CREATE POLICY "Public can delete allied attempts" ON allied_quiz_attempts
  FOR DELETE TO anon, authenticated USING (true);
