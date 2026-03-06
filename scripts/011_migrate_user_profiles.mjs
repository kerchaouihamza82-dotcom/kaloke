import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, { ssl: 'require' })

async function run() {
  console.log('[v0] Running DB migration...')

  // 1. Add missing columns to suscripciones
  await sql`
    ALTER TABLE IF EXISTS public.suscripciones
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS price_id TEXT,
      ADD COLUMN IF NOT EXISTS plan TEXT
  `.catch(e => console.log('[v0] alter suscripciones:', e.message))
  console.log('[v0] suscripciones columns ensured')

  // 2. Create user_profiles
  await sql`
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      has_access  BOOLEAN NOT NULL DEFAULT false,
      plan        TEXT,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('[v0] user_profiles table ensured')

  // 3. Enable RLS
  await sql`ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY`

  // 4. Policies
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles' AND policyname = 'users_view_own_profile'
      ) THEN
        CREATE POLICY users_view_own_profile ON public.user_profiles
          FOR SELECT USING (auth.uid() = user_id);
      END IF;
    END $$
  `
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles' AND policyname = 'users_update_own_profile'
      ) THEN
        CREATE POLICY users_update_own_profile ON public.user_profiles
          FOR UPDATE USING (auth.uid() = user_id);
      END IF;
    END $$
  `
  console.log('[v0] RLS policies ensured')
  console.log('[v0] Migration complete!')

  await sql.end()
}

run().catch(e => { console.error('[v0] Migration error:', e); process.exit(1) })
