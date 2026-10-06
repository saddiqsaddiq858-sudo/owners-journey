/*
# Business Journey Guide — Stages and Tasks

## Purpose
An interactive guide that walks a user through the journey from doing everything solo to becoming a company owner. The app presents stages (phases of growth) and tasks within each stage. Users can check off tasks, track progress, and see their overall journey progress.

## New Tables
1. `journey_stages`
   - `id` (uuid, primary key)
   - `title` (text) — name of the stage, e.g. "Solo Operator"
   - `description` (text) — what this stage means
   - `stage_order` (int) — ordering of stages from first to last
   - `icon_name` (text) — name of a lucide-react icon for this stage
   - `color_theme` (text) — theme key for color styling
   - `created_at` (timestamptz)

2. `journey_tasks`
   - `id` (uuid, primary key)
   - `stage_id` (uuid, FK to journey_stages, ON DELETE CASCADE)
   - `title` (text) — the actionable task
   - `description` (text) — why this task matters / guidance
   - `task_order` (int) — ordering within a stage
   - `is_completed` (boolean, default false) — whether the user has done this
   - `completed_at` (timestamptz, nullable) — when the user marked it done
   - `created_at` (timestamptz)

## Security
- Single-tenant app with no sign-in. RLS enabled on both tables.
- `TO anon, authenticated` policies allow the anon-key frontend to read and write (the data is intentionally shared/public).
- Full CRUD for both tables is open to anon + authenticated.
*/

CREATE TABLE IF NOT EXISTS journey_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  stage_order int NOT NULL,
  icon_name text NOT NULL DEFAULT 'Circle',
  color_theme text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journey_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stages" ON journey_stages;
CREATE POLICY "anon_select_stages" ON journey_stages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stages" ON journey_stages;
CREATE POLICY "anon_insert_stages" ON journey_stages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stages" ON journey_stages;
CREATE POLICY "anon_update_stages" ON journey_stages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stages" ON journey_stages;
CREATE POLICY "anon_delete_stages" ON journey_stages FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS journey_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES journey_stages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  task_order int NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journey_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON journey_tasks;
CREATE POLICY "anon_select_tasks" ON journey_tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON journey_tasks;
CREATE POLICY "anon_insert_tasks" ON journey_tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON journey_tasks;
CREATE POLICY "anon_update_tasks" ON journey_tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON journey_tasks;
CREATE POLICY "anon_delete_tasks" ON journey_tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_journey_tasks_stage_id ON journey_tasks(stage_id);
