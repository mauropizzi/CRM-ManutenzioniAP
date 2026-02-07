import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PublicIntervention = {
  id: string;
  client_company_name: string;
  client_referent?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  system_type: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  system_location?: string | null;
  internal_ref?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  status?: string | null;
  assigned_technicians?: string | null;
  assigned_supplier?: string | null;
  office_notes?: string | null;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[get-intervention-public] Missing env vars");
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const token = String(body?.token || "").trim();

    if (!token) {
      console.error("[get-intervention-public] Missing token");
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: link, error: linkErr } = await supabaseAdmin
      .from("intervention_public_links")
      .select("intervention_id, expires_at")
      .eq("token", token)
      .single();

    if (linkErr || !link) {
      console.warn("[get-intervention-public] Token not found", { token });
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (link.expires_at) {
      const exp = new Date(link.expires_at).getTime();
      if (Number.isFinite(exp) && exp < Date.now()) {
        console.warn("[get-intervention-public] Token expired", { token });
        return new Response(JSON.stringify({ error: "Expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: intervention, error: intErr } = await supabaseAdmin
      .from("interventions")
      .select(
        [
          "id",
          "client_company_name",
          "client_referent",
          "client_phone",
          "client_email",
          "client_address",
          "system_type",
          "brand",
          "model",
          "serial_number",
          "system_location",
          "internal_ref",
          "scheduled_date",
          "scheduled_time",
          "status",
          "assigned_technicians",
          "assigned_supplier",
          "office_notes",
        ].join(",")
      )
      .eq("id", link.intervention_id)
      .single();

    if (intErr || !intervention) {
      console.error("[get-intervention-public] Intervention not found for token", {
        message: intErr?.message,
        token,
      });
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: PublicIntervention = intervention as any;

    return new Response(JSON.stringify({ intervention: payload }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[get-intervention-public] Generic error", { message: err?.message });
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
