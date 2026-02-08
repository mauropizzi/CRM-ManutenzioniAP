-- Create brands table (Marca)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT brands_user_name_unique UNIQUE (user_id, name)
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS brands_select_own ON public.brands;
DROP POLICY IF EXISTS brands_insert_own ON public.brands;
DROP POLICY IF EXISTS brands_update_own ON public.brands;
DROP POLICY IF EXISTS brands_delete_own ON public.brands;

CREATE POLICY brands_select_own ON public.brands
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY brands_insert_own ON public.brands
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY brands_update_own ON public.brands
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY brands_delete_own ON public.brands
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- updated_at trigger function (create if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();