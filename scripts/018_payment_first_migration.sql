-- ============================================================
-- PAYMENT-FIRST MIGRATION
-- Añade subscription_status a user_profiles y crea token table
-- ============================================================

-- 1. Añadir subscription_status a user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Sincronizar has_access con subscription_status para usuarios existentes
UPDATE public.user_profiles
SET subscription_status = CASE WHEN has_access = true THEN 'active' ELSE 'inactive' END;

-- 3. Tabla para tokens de creación de contraseña post-pago
CREATE TABLE IF NOT EXISTS public.password_setup_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  used boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS para password_setup_tokens
ALTER TABLE public.password_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Solo service role puede leer/escribir tokens
CREATE POLICY "service_role_only_tokens" ON public.password_setup_tokens
  USING (false);

-- 4. Índice en subscription_status para queries del middleware
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status
  ON public.user_profiles (subscription_status);

-- 5. Índice en email para lookup rápido del webhook
CREATE INDEX IF NOT EXISTS idx_user_profiles_email
  ON public.user_profiles (email);
