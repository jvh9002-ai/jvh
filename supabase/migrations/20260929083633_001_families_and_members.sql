/*
# Families, Members, and Profiles

1. New Tables
- `families`: a family account created by a parent.
  - id (uuid, pk)
  - name (text, family name)
  - owner_id (uuid, references auth.users — the parent who created it)
  - created_at (timestamptz)
- `members`: people in a family (children, teens, college students, the parent themselves).
  - id (uuid, pk)
  - family_id (uuid, references families)
  - name (text)
  - role (text: 'parent' | 'child' | 'teen' | 'college')
  - age (int)
  - avatar_emoji (text, a fun emoji picked during setup)
  - points (int, default 0 — earned from completing tasks)
  - level_name (text, default 'Beginner' — gamification level)
  - created_at (timestamptz)

2. Security
- RLS enabled on both tables.
- Policies scoped to authenticated users.
- A user can manage families they own and members within those families.
- owner_id defaults to auth.uid() so insert without explicit owner works.
*/

CREATE TABLE IF NOT EXISTS families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_families" ON families;
CREATE POLICY "select_own_families" ON families FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_families" ON families;
CREATE POLICY "insert_own_families" ON families FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_families" ON families;
CREATE POLICY "update_own_families" ON families FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_families" ON families;
CREATE POLICY "delete_own_families" ON families FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('parent','child','teen','college')),
  age int NOT NULL DEFAULT 0,
  avatar_emoji text NOT NULL DEFAULT '⭐',
  points int NOT NULL DEFAULT 0,
  level_name text NOT NULL DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_family_members" ON members;
CREATE POLICY "select_family_members" ON members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families WHERE families.id = members.family_id AND families.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_family_members" ON members;
CREATE POLICY "insert_family_members" ON members FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM families WHERE families.id = members.family_id AND families.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_family_members" ON members;
CREATE POLICY "update_family_members" ON members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families WHERE families.id = members.family_id AND families.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM families WHERE families.id = members.family_id AND families.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_family_members" ON members;
CREATE POLICY "delete_family_members" ON members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM families WHERE families.id = members.family_id AND families.owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);