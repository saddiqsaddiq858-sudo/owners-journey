/*
# Add notes and estimated timeframe to journey tasks/stages

## Purpose
Enhance the journey guide with the ability for users to add personal notes to individual tasks, and add estimated timeframe info to each stage so users know how long each phase typically takes.

## Changes
1. `journey_tasks` table — add `notes` column (text, nullable)
   - Users can add their own reflections, plans, or context to each task
2. `journey_stages` table — add `estimated_timeframe` column (text, nullable)
   - Describes the typical duration of this stage, e.g. "3-6 months"

## Security
- No changes to existing RLS policies. The new columns inherit the existing open CRUD policies already set on both tables.
*/

ALTER TABLE journey_tasks ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE journey_stages ADD COLUMN IF NOT EXISTS estimated_timeframe text;
