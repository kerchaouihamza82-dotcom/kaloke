-- Drop existing table and recreate with simplified structure
DROP TABLE IF EXISTS public.live_calls CASCADE;

-- Create simplified live_calls table
CREATE TABLE public.live_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  enlace TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_calls ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view calls
CREATE POLICY "Everyone can view calls" ON public.live_calls
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert calls
CREATE POLICY "Admins can insert calls" ON public.live_calls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Only admins can update calls
CREATE POLICY "Admins can update calls" ON public.live_calls
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Policy: Only admins can delete calls
CREATE POLICY "Admins can delete calls" ON public.live_calls
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Create index for date queries
CREATE INDEX idx_live_calls_fecha ON public.live_calls(fecha);
