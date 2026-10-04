/*
# Onboarding persistence, Staff role, and Task approval workflow

1. Modified Tables
- `families`: add `is_onboarded` boolean (default false) — permanently set to true
  when the user finishes Family/Business setup, so re-login skips the setup screen.
- `families`: add `mode` text (default 'family', CHECK in 'family','work') —
  distinguishes Family Mode from Work/Business Mode.
- `members`: expand role CHECK to include 'staff' — for Staff / Worker members
  in a business context.
- `tasks`: expand status CHECK to include 'pending_approval' — when a child or
  worker marks a task complete, it goes to pending approval before the admin
  awards points.
- `tasks`: add `assigned_by` uuid (nullable, references members) — tracks which
  admin assigned the task.

2. Security
- All new columns are covered by existing family-ownership RLS policies.
- No new policies needed — existing CRUD policies already scope by family owner.
*/

ALTER TABLE families
  ADD COLUMN IF NOT EXISTS is_onboarded boolean NOT NULL DEFAULT false;

ALTER TABLE families
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'family'
  CHECK (mode IN ('family','work'));

-- Expand member roles to include 'staff'
DO $$ BEGIN
  ALTER TABLE members DROP CONSTRAINT IF EXISTS members_role_check;
  ALTER TABLE members ADD CONSTRAINT members_role_check
    CHECK (role IN ('parent','child','teen','college','staff'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Expand task statuses to include 'pending_approval'
DO $$ BEGIN
  ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
  ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
    CHECK (status IN ('pending','completed','pending_approval'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES members(id) ON DELETE SET NULL;
