/*
# Create subscriptions table for Paystack premium features

## Purpose
Track Paystack subscription payments for premium features. Since this app has no sign-in/auth,
we use a simple anonymous subscriber ID (stored in localStorage on the client and passed to
the edge functions) to associate payments with a user's session.

## New Tables
1. `subscriptions`
   - `id` (uuid, primary key)
   - `subscriber_id` (text) — anonymous ID generated on the client, stored in localStorage
   - `paystack_reference` (text, unique) — Paystack transaction reference
   - `plan` (text) — 'premium' (extensible for future tiers)
   - `status` (text) — 'pending', 'active', 'cancelled', 'expired'
   - `amount_kobo` (integer) — amount paid in kobo (Paystack's smallest currency unit)
   - `currency` (text, default 'NGN')
   - `email` (text, nullable) — email used for the transaction
   - `activated_at` (timestamptz, nullable) — when payment was confirmed
   - `expires_at` (timestamptz, nullable) — when the subscription expires
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. `subscription_events` (append-only audit log)
   - `id` (uuid, primary key)
   - `subscription_id` (uuid, FK to subscriptions)
   - `event_type` (text) — 'initialized', 'verified', 'cancelled', 'expired'
   - `payload` (jsonb) — raw event data
   - `created_at` (timestamptz)

## Security
- Single-tenant app with no sign-in. RLS enabled on both tables.
- `TO anon, authenticated` policies allow the anon-key frontend to read and write.
- The subscriptions table is intentionally open since there is no auth — the subscriber_id
  provides soft isolation. The edge functions handle payment verification server-side
  using the Paystack secret key.
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id text NOT NULL,
  paystack_reference text UNIQUE,
  plan text NOT NULL DEFAULT 'premium',
  status text NOT NULL DEFAULT 'pending',
  amount_kobo integer,
  currency text NOT NULL DEFAULT 'NGN',
  email text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sub_events" ON subscription_events;
CREATE POLICY "anon_select_sub_events" ON subscription_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sub_events" ON subscription_events;
CREATE POLICY "anon_insert_sub_events" ON subscription_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paystack_reference ON subscriptions(paystack_reference);
