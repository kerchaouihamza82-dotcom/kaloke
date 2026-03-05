-- ============================================================
--  010_stripe_subscription_schema.sql
--  Full subscription + access schema for Stripe sandbox
-- ============================================================

-- ── 1. suscripciones ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suscripciones (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  price_id                TEXT,
  plan                    TEXT,          -- 'mensual' | 'anual'
  estado                  TEXT NOT NULL DEFAULT 'inactiva'
                            CHECK (estado IN ('activa', 'cancelada', 'expirada', 'inactiva', 'pago_fallido')),
  fecha_inicio            TIMESTAMP WITH TIME ZONE,
  fecha_fin               TIMESTAMP WITH TIME ZONE,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id     ON public.suscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado      ON public.suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_customer    ON public.suscripciones(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_sub_id      ON public.suscripciones(stripe_subscription_id);

ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suscripciones_select_own"  ON public.suscripciones;
DROP POLICY IF EXISTS "suscripciones_insert_own"  ON public.suscripciones;
DROP POLICY IF EXISTS "suscripciones_update_own"  ON public.suscripciones;

CREATE POLICY "suscripciones_select_own"
  ON public.suscripciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "suscripciones_insert_own"
  ON public.suscripciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "suscripciones_update_own"
  ON public.suscripciones FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 2. user_profiles – ensure has_access column exists ──────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id                           UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id                TEXT,
  has_access                        BOOLEAN NOT NULL DEFAULT false,
  subscription_type                 TEXT,    -- 'plan-mensual' | 'plan-anual'
  subscription_status               TEXT,    -- 'active' | 'cancelled' | 'past_due' | 'unpaid'
  stripe_subscription_id            TEXT,
  subscription_current_period_end   TIMESTAMP WITH TIME ZONE,
  subscribed_at                     TIMESTAMP WITH TIME ZONE,
  updated_at                        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_id         ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id    ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer   ON public.user_profiles(stripe_customer_id);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_select_own"  ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own"  ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own"  ON public.user_profiles;

CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id OR auth.uid() = user_id);


-- ── 3. updated_at auto-trigger ───────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_suscripciones_updated_at ON public.suscripciones;
CREATE TRIGGER trg_suscripciones_updated_at
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
