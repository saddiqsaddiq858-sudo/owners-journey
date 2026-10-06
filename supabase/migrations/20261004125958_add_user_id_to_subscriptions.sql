/*
# Add user_id to subscriptions for authenticated premium access

## Purpose
Premium features now require sign-in. We add a `user_id` column to the `subscriptions` table
so payments are tied to authenticated users instead of anonymous localStorage IDs.

## Changes
1. `subscriptions` table — add `user_id` column (uuid, nullable for backward compat, references auth.users)
   - Future inserts will set this to the authenticated user's ID
2. `subscriptions` RLS — replace the open anon policies with authenticated-only, owner-scoped policies
   - SELECT: users can only see their own subscriptions
   - INSERT: users can only create subscriptions for themselves
   - UPDATE: users can only update their own subscriptions (used by verify edge function via service key, which bypasses RLS)
   - DELETE: users can only delete their own subscriptions
3. `subscription_events` RLS — replace open anon policies with authenticated-only, owner-scoped via subscriptions FK
   - All operations require the parent subscription to belong to the authenticated user

## Security
- Subscriptions are now private to each authenticated user.
- The edge functions use the service role key which bypasses RLS, so payment verification still works server-side.
- Journey tables remain open (anon + authenticated) since the journey guide works without sign-in.
*/

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Replace subscriptions policies: remove open anon policies, add authenticated owner-scoped policies
DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;

CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Replace subscription_events policies
DROP POLICY IF EXISTS "anon_select_sub_events" ON subscription_events;
DROP POLICY IF EXISTS "anon_insert_sub_events" ON subscription_events;

CREATE POLICY "select_own_sub_events" ON subscription_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.id = subscription_events.subscription_id AND subscriptions.user_id = auth.uid())
  );

CREATE POLICY "insert_own_sub_events" ON subscription_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM subscriptions WHERE subscriptions.id = subscription_events.subscription_id AND subscriptions.user_id = auth.uid())
  );
