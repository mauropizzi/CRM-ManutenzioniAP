import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[create-intervention-public-link] Missing env vars");
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user via JWT (verify_jwt is false by default)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[create-intervention-public-link] Missing Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabaseAuth.auth.getUser();

    if (userErr || !user) {
      console.error("[create-intervention-public-link] Invalid user", { message: userErr?.message });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const interventionId = String(body?.interventionId || "").trim();

    if (!interventionId) {
      console.error("[create-intervention-public-link] Missing interventionId");
      return new Response(JSON.stringify({ error: "Missing interventionId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Ensure intervention exists and belongs to user
    const { data: intervention, error: interventionErr } = await supabaseAdmin
      .from("interventions")
      .select("id, user_id")
      .eq("id", interventionId)
      .single();

    if (interventionErr || !intervention) {
      console.error("[create-intervention-public-link] Intervention not found", {
        message: interventionErr?.message,
        interventionId,
      });
      return new Response(JSON.stringify({ error: "Intervention not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (String(intervention.user_id || "") !== user.id) {
      console.error("[create-intervention-public-link] Forbidden: intervention not owned by user", {
        interventionUserId: intervention.user_id,
        userId: user.id,
      });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = crypto.randomUUID();

    const { data: linkRow, error: upsertErr } = await supabaseAdmin
      .from("intervention_public_links")
      .upsert(
        {
          token,
          intervention_id: interventionId,
          user_id: user.id,
          expires_at: null,
        },
        { onConflict: "intervention_id,user_id" }
      )
      .select("token")
      .single();

    if (upsertErr || !linkRow) {
      console.error("[create-intervention-public-link] Upsert failed", { message: upsertErr?.message });
      return new Response(JSON.stringify({ error: "Failed to create link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[create-intervention-public-link] Link generated", {
      interventionId,
      userId: user.id,
    });

    return new Response(JSON.stringify({ token: linkRow.token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[create-intervention-public-link] Generic error", { message: err?.message });
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
