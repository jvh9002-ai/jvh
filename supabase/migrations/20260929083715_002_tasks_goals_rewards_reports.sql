/*
# Tasks, Goals, Rewards, Growth Reports

1. New Tables
- `tasks`: daily missions assigned to a family member by the parent (or self-assigned for teens/college).
  - id (uuid, pk)
  - member_id (uuid, references members)
  - title (text)
  - category (text: 'learning' | 'health' | 'discipline' | 'kindness' | 'creativity' | 'skills' | 'career' | 'family' | 'personal')
  - points (int, default 10)
  - status (text: 'pending' | 'completed', default 'pending')
  - due_date (date, optional)
  - created_at (timestamptz)
- `goals`: long-term goals a member is working toward.
  - id (uuid, pk)
  - member_id (uuid, references members)
  - title (text)
  - category (text)
  - progress (int 0-100, default 0)
  - target_date (date, optional)
  - created_at (timestamptz)
- `rewards`: rewards a parent creates that members unlock with points.
  - id (uuid, pk)
  - member_id (uuid, references members — the member who can redeem it, nullable for family-wide rewards)
  - family_id (uuid, references families)
  - title (text)
  - points_required (int)
  - redeemed (boolean, default false)
  - created_at (timestamptz)
- `growth_reports`: weekly AI-generated growth report per member.
  - id (uuid, pk)
  - member_id (uuid, references members)
  - week_start (date)
  - scores (jsonb — {learning, health, discipline, skills, confidence})
  - summary (text)
  - recommendations (text)
  - created_at (timestamptz)
- `ai_messages`: conversation history with the AI Family Coach.
  - id (uuid, pk)
  - member_id (uuid, references members, nullable — can be a parent-level chat)
  - family_id (uuid, references families)
  - role (text: 'user' | 'assistant')
  - content (text)
  - created_at (timestamptz)

2. Security
- RLS enabled on all tables.
- All scoped through family ownership: a user can only touch rows that belong to a family they own.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'learning',
  points int NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  due_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_tasks" ON tasks;
CREATE POLICY "select_family_tasks" ON tasks FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = tasks.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_family_tasks" ON tasks;
CREATE POLICY "insert_family_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = tasks.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_family_tasks" ON tasks;
CREATE POLICY "update_family_tasks" ON tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = tasks.member_id AND f.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = tasks.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_family_tasks" ON tasks;
CREATE POLICY "delete_family_tasks" ON tasks FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = tasks.member_id AND f.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_tasks_member_id ON tasks(member_id);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'skills',
  progress int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_goals" ON goals;
CREATE POLICY "select_family_goals" ON goals FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = goals.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_family_goals" ON goals;
CREATE POLICY "insert_family_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = goals.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_family_goals" ON goals;
CREATE POLICY "update_family_goals" ON goals FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = goals.member_id AND f.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = goals.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_family_goals" ON goals;
CREATE POLICY "delete_family_goals" ON goals FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = goals.member_id AND f.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_goals_member_id ON goals(member_id);

CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  points_required int NOT NULL DEFAULT 50,
  redeemed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_rewards" ON rewards;
CREATE POLICY "select_family_rewards" ON rewards FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families f WHERE f.id = rewards.family_id AND f.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_family_rewards" ON rewards;
CREATE POLICY "insert_family_rewards" ON rewards FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM families f WHERE f.id = rewards.family_id AND f.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_family_rewards" ON rewards;
CREATE POLICY "update_family_rewards" ON rewards FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families f WHERE f.id = rewards.family_id AND f.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM families f WHERE f.id = rewards.family_id AND f.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_family_rewards" ON rewards;
CREATE POLICY "delete_family_rewards" ON rewards FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families f WHERE f.id = rewards.family_id AND f.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_rewards_family_id ON rewards(family_id);

CREATE TABLE IF NOT EXISTS growth_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  scores jsonb NOT NULL DEFAULT '{"learning":0,"health":0,"discipline":0,"skills":0,"confidence":0}',
  summary text NOT NULL DEFAULT '',
  recommendations text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE growth_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_reports" ON growth_reports;
CREATE POLICY "select_family_reports" ON growth_reports FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = growth_reports.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_family_reports" ON growth_reports;
CREATE POLICY "insert_family_reports" ON growth_reports FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = growth_reports.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_family_reports" ON growth_reports;
CREATE POLICY "update_family_reports" ON growth_reports FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = growth_reports.member_id AND f.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = growth_reports.member_id AND f.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_family_reports" ON growth_reports;
CREATE POLICY "delete_family_reports" ON growth_reports FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN families f ON f.id = m.family_id
      WHERE m.id = growth_reports.member_id AND f.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_reports_member_id ON growth_reports(member_id);

CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_ai" ON ai_messages;
CREATE POLICY "select_family_ai" ON ai_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families f WHERE f.id = ai_messages.family_id AND f.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_family_ai" ON ai_messages;
CREATE POLICY "insert_family_ai" ON ai_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM families f WHERE f.id = ai_messages.family_id AND f.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_family_ai" ON ai_messages;
CREATE POLICY "delete_family_ai" ON ai_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families f WHERE f.id = ai_messages.family_id AND f.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_ai_family_id ON ai_messages(family_id);