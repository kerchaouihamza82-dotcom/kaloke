// Disable TLS verification globally for self-signed Supabase certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import pg from 'pg'

const { Client } = pg

const connStr = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
// Append sslmode=require if not already present; disable cert verification for self-signed certs
const connectionString = connStr?.includes('sslmode=')
  ? connStr
  : `${connStr}?sslmode=require`

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined },
})

const migration = `
-- Add missing columns to suscripciones
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS email    TEXT;
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS price_id TEXT;
ALTER TABLE public.suscripciones ADD COLUMN IF NOT EXISTS plan     TEXT;

-- user_profiles already exists but may have 'id' instead of 'user_id'.
-- Rename 'id' -> 'user_id' if the column is still called 'id'.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'id'
  ) THEN
    ALTER TABLE public.user_profiles RENAME COLUMN id TO user_id;
  END IF;
END
$$;

-- Create the table only if it still doesn't exist (first run scenario)
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

-- Ensure all needed columns exist
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id              TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS has_access                      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS plan                            TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_status             TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id          TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscribed_at                   TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at                      TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;

CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
`

async function run() {
  await client.connect()
  console.log('Connected to Postgres')
  await client.query(migration)
  console.log('Migration complete: user_profiles table created, suscripciones columns added.')
  await client.end()
}

run().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
