-- ============================================================
--  010_stripe_subscription_schema.sql
--  Safe migration — adds missing columns to suscripciones
--  and creates user_profiles with user_id as the unique key.
-- ============================================================

-- Add missing columns to suscripciones (safe with IF NOT EXISTS)
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS email    TEXT;
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS price_id TEXT;
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS plan     TEXT;

-- Create user_profiles table using user_id (not id) as the PK/unique key
-- so all code that does .eq('user_id', …) works correctly.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id                         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id              TEXT,
  has_access                      BOOLEAN NOT NULL DEFAULT false,
  plan                            TEXT,
  subscription_status             TEXT,
  stripe_subscription_id          TEXT,
  subscription_current_period_end TIMESTAMP WITH TIME ZONE,
  subscribed_at                   TIMESTAMP WITH TIME ZONE,
  updated_at                      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (idempotent re-create)
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
