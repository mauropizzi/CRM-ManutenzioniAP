import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://nrdsgtuzpnamcovuzghb.supabase.co";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[setup-system-catalog] Missing SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Simple health check response to ensure function deploys successfully
  console.log("[setup-system-catalog] Function deployed and reachable.");
  return new Response(JSON.stringify({ ok: true, message: "setup-system-catalog deployed" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});