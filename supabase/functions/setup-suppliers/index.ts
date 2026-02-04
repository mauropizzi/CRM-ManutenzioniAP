// @ts-nocheck

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v11.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[setup-suppliers] Request received");

  // Recupera la stringa di connessione al DB
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    console.error("[setup-suppliers] Missing SUPABASE_DB_URL");
    return new Response(JSON.stringify({ error: "Missing SUPABASE_DB_URL" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const client = new Client(dbUrl);

  const sql = `
    CREATE TABLE IF NOT EXISTS public.suppliers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      ragione_sociale TEXT NOT NULL,
      partita_iva TEXT,
      codice_fiscale TEXT,
      indirizzo TEXT,
      cap TEXT,
      citta TEXT,
      provincia TEXT,
      telefono TEXT,
      email TEXT,
      pec TEXT,
      tipo_servizio TEXT,
      attivo BOOLEAN DEFAULT true,
      note TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

    -- Policies di base per utenti autenticati
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_select_own') THEN
        CREATE POLICY "suppliers_select_own" ON public.suppliers
        FOR SELECT TO authenticated USING (auth.uid() = user_id);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_insert_own') THEN
        CREATE POLICY "suppliers_insert_own" ON public.suppliers
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_update_own') THEN
        CREATE POLICY "suppliers_update_own" ON public.suppliers
        FOR UPDATE TO authenticated USING (auth.uid() = user_id);
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_delete_own') THEN
        CREATE POLICY "suppliers_delete_own" ON public.suppliers
        FOR DELETE TO authenticated USING (auth.uid() = user_id);
      END IF;
    END
    $$;

    -- Policies admin (coerenti con il resto del progetto)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_admin_select') THEN
        CREATE POLICY "suppliers_admin_select" ON public.suppliers
        FOR SELECT TO authenticated USING ((public.get_user_role(auth.uid()) = 'amministratore') OR (auth.uid() = user_id));
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_admin_update') THEN
        CREATE POLICY "suppliers_admin_update" ON public.suppliers
        FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'suppliers_admin_delete') THEN
        CREATE POLICY "suppliers_admin_delete" ON public.suppliers
        FOR DELETE TO authenticated USING (public.get_user_role(auth.uid()) = 'amministratore');
      END IF;
    END
    $$;

    -- Trigger updated_at
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'suppliers_updated_at'
      ) THEN
        CREATE TRIGGER suppliers_updated_at
        BEFORE UPDATE ON public.suppliers
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
      END IF;
    END
    $$;
  `;

  try {
    console.log("[setup-suppliers] Connecting to database...");
    await client.connect();
    console.log("[setup-suppliers] Executing SQL...");
    await client.queryObject(sql);
    console.log("[setup-suppliers] SQL executed successfully");

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[setup-suppliers] Error executing SQL:", error);
    const msg = (typeof error === "object" && error && "message" in error) ? (error as any).message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
});