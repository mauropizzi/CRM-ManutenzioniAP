-- Create system_types table (Tipo Impianto)
CREATE TABLE IF NOT EXISTS public.system_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT system_types_user_name_unique UNIQUE (user_id, name)
);

-- Enable RLS
ALTER TABLE public.system_types ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS system_types_select_own ON public.system_types;
DROP POLICY IF EXISTS system_types_insert_own ON public.system_types;
DROP POLICY IF EXISTS system_types_update_own ON public.system_types;
DROP POLICY IF EXISTS system_types_delete_own ON public.system_types;

CREATE POLICY system_types_select_own ON public.system_types
FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY system_types_insert_own ON public.system_types
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY system_types_update_own ON public.system_types
FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY system_types_delete_own ON public.system_types
FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- updated_at trigger function (create once)
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
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();