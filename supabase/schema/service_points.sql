-- Create table for service points
CREATE TABLE IF NOT EXISTS public.service_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  nome_punto_servizio TEXT NOT NULL,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  note TEXT,
  tipo_impianti JSONB DEFAULT '[]'::jsonb,
  marche JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.service_points ENABLE ROW LEVEL SECURITY;

-- Policies: users can operate only on their own rows
CREATE POLICY "Users can view own service points" ON public.service_points
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service points" ON public.service_points
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service points" ON public.service_points
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own service points" ON public.service_points
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Keep updated_at current on update if handle_updated_at function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    -- drop existing trigger if present
    PERFORM (
      CASE
        WHEN EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'service_points_updated_at'
        ) THEN
          pg_trigger_drop('service_points_updated_at'::text)
        ELSE NULL
      END
    );

    -- Create trigger
    DROP TRIGGER IF EXISTS service_points_updated_at ON public.service_points;
    CREATE TRIGGER service_points_updated_at
    BEFORE UPDATE ON public.service_points
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
  END IF;
END$$;