/* @ts-nocheck */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v12.0.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Usa il DB URL (service role) per eseguire DDL in sicurezza
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    console.error("[setup-system-catalog] Missing SUPABASE_DB_URL");
    return new Response(JSON.stringify({ ok: false, error: "Missing SUPABASE_DB_URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const sql = `
-- Ensure service_points table exists
CREATE TABLE IF NOT EXISTS public.service_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  cap TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_points_customer_id ON public.service_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_points_created_by ON public.service_points(created_by);

-- RLS for service_points
ALTER TABLE public.service_points ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_points' AND policyname = 'sp_select_own_or_authenticated'
  ) THEN
    CREATE POLICY "sp_select_own_or_authenticated" ON public.service_points
    FOR SELECT TO authenticated USING ((SELECT auth.uid()) = created_by OR true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_points' AND policyname = 'sp_insert_own'
  ) THEN
    CREATE POLICY "sp_insert_own" ON public.service_points
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_points' AND policyname = 'sp_update_own'
  ) THEN
    CREATE POLICY "sp_update_own" ON public.service_points
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_points' AND policyname = 'sp_delete_own'
  ) THEN
    CREATE POLICY "sp_delete_own" ON public.service_points
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;
END $$;

-- Ensure service_point_systems table exists
CREATE TABLE IF NOT EXISTS public.service_point_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_point_id UUID NOT NULL REFERENCES public.service_points(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  system_type_id UUID REFERENCES public.system_types(id),
  brand_id UUID REFERENCES public.brands(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sps_service_point_id ON public.service_point_systems(service_point_id);
CREATE INDEX IF NOT EXISTS idx_sps_system_type_id ON public.service_point_systems(system_type_id);
CREATE INDEX IF NOT EXISTS idx_sps_brand_id ON public.service_point_systems(brand_id);

ALTER TABLE public.service_point_systems ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_point_systems' AND policyname = 'sps_select_own'
  ) THEN
    CREATE POLICY "sps_select_own" ON public.service_point_systems
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.service_points sp WHERE sp.id = service_point_id AND sp.created_by = (SELECT auth.uid()))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_point_systems' AND policyname = 'sps_insert_own'
  ) THEN
    CREATE POLICY "sps_insert_own" ON public.service_point_systems
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM public.service_points sp WHERE sp.id = service_point_id AND sp.created_by = (SELECT auth.uid()))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_point_systems' AND policyname = 'sps_update_own'
  ) THEN
    CREATE POLICY "sps_update_own" ON public.service_point_systems
    FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.service_points sp WHERE sp.id = service_point_id AND sp.created_by = (SELECT auth.uid()))
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_point_systems' AND policyname = 'sps_delete_own'
  ) THEN
    CREATE POLICY "sps_delete_own" ON public.service_point_systems
    FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM public.service_points sp WHERE sp.id = service_point_id AND sp.created_by = (SELECT auth.uid()))
    );
  END IF;
END $$;

-- Master tables: system_types
CREATE TABLE IF NOT EXISTS public.system_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS system_types_name_unique ON public.system_types (LOWER(name));

ALTER TABLE public.system_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_types' AND policyname = 'system_types_select_all'
  ) THEN
    CREATE POLICY system_types_select_all ON public.system_types
    FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_types' AND policyname = 'system_types_insert_own'
  ) THEN
    CREATE POLICY system_types_insert_own ON public.system_types
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_types' AND policyname = 'system_types_update_own'
  ) THEN
    CREATE POLICY system_types_update_own ON public.system_types
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_types' AND policyname = 'system_types_delete_own'
  ) THEN
    CREATE POLICY system_types_delete_own ON public.system_types
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;
END $$;

-- Master tables: brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS brands_name_unique ON public.brands (LOWER(name));

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brands' AND policyname = 'brands_select_all'
  ) THEN
    CREATE POLICY brands_select_all ON public.brands
    FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brands' AND policyname = 'brands_insert_own'
  ) THEN
    CREATE POLICY brands_insert_own ON public.brands
    FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brands' AND policyname = 'brands_update_own'
  ) THEN
    CREATE POLICY brands_update_own ON public.brands
    FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brands' AND policyname = 'brands_delete_own'
  ) THEN
    CREATE POLICY brands_delete_own ON public.brands
    FOR DELETE TO authenticated USING ((SELECT auth.uid()) = created_by);
  END IF;
END $$;

-- Updated_at trigger (function may already exist)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$;

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

DROP TRIGGER IF EXISTS handle_service_points_updated_at ON public.service_points;
CREATE TRIGGER handle_service_points_updated_at
  BEFORE UPDATE ON public.service_points
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
`;

  const client = new Client(dbUrl);

  try {
    console.log("[setup-system-catalog] Connecting to DB...");
    await client.connect();
    console.log("[setup-system-catalog] Executing SQL...");
    await client.queryObject(sql);
    console.log("[setup-system-catalog] Done.");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error) {
    console.error("[setup-system-catalog] Error", error);
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
});