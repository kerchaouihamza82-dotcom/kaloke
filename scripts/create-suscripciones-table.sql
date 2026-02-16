-- Create suscripciones table
CREATE TABLE IF NOT EXISTS public.suscripciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'inactiva' CHECK (estado IN ('activa', 'cancelada', 'expirada', 'inactiva')),
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_suscripciones_user_id ON public.suscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON public.suscripciones(estado);

-- Enable RLS
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.suscripciones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription (for initial signup)
CREATE POLICY "Users can create their own subscription"
  ON public.suscripciones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
  ON public.suscripciones
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.suscripciones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comment on table
COMMENT ON TABLE public.suscripciones IS 'Tabla para gestionar suscripciones mensuales de usuarios';
