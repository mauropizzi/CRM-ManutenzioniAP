-- Master tables for system types and brands

-- system_types
CREATE TABLE IF NOT EXISTS public.system_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index (case-insensitive) to prevent duplicates like 'Bosch' vs 'BOSCH'
CREATE UNIQUE INDEX IF NOT EXISTS system_types_name_unique ON public.system_types (LOWER(name));

-- brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS brands_name_unique ON public.brands (LOWER(name));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS system_types_updated_at ON public.system_types;
CREATE TRIGGER system_types_updated_at
  BEFORE UPDATE ON public.system_types
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.system_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Policies: allow all authenticated users to read; only the creator can write
DROP POLICY IF EXISTS system_types_select ON public.system_types;
CREATE POLICY system_types_select ON public.system_types
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS system_types_insert ON public.system_types;
CREATE POLICY system_types_insert ON public.system_types
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS system_types_update ON public.system_types;
CREATE POLICY system_types_update ON public.system_types
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS system_types_delete ON public.system_types;
CREATE POLICY system_types_delete ON public.system_types
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS brands_select ON public.brands;
CREATE POLICY brands_select ON public.brands
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS brands_insert ON public.brands;
CREATE POLICY brands_insert ON public.brands
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS brands_update ON public.brands;
CREATE POLICY brands_update ON public.brands
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);

DROP POLICY IF EXISTS brands_delete ON public.brands;
CREATE POLICY brands_delete ON public.brands
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);