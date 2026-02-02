import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from 'https://esm.sh/resend@1.1.0'; // Utilizziamo Resend per l'invio delle email

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interventionId, recipientEmail } = await req.json();
    console.log("[send-work-report-email] Received request for interventionId:", interventionId, "recipientEmail:", recipientEmail);

    if (!interventionId || !recipientEmail) {
      console.error("[send-work-report-email] Missing interventionId or recipientEmail. Status: 400");
      return new Response(JSON.stringify({ error: 'Missing interventionId or recipientEmail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inizializza il client Supabase per la funzione Edge
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Usa la service role key per accesso server-side
    );

    // Recupera i dettagli dell'intervento
    const { data: intervention, error: interventionError } = await supabaseClient
      .from('interventions')
      .select('*')
      .eq('id', interventionId)
      .single();

    if (interventionError || !intervention) {
      console.error("[send-work-report-email] Error fetching intervention or not found. Status: 500. Error:", interventionError?.message);
      return new Response(JSON.stringify({ error: 'Intervention not found or database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] Intervention fetched successfully:", intervention.id);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error("[send-work-report-email] RESEND_API_KEY is not set. Status: 500");
      return new Response(JSON.stringify({ error: 'Email service API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log("[send-work-report-email] RESEND_API_KEY is set.");

    const resend = new Resend(resendApiKey);

    // Costruisci l'URL per la pagina di stampa della bolla.
    // NOTA: Per la produzione, dovrai sostituire 'http://localhost:32138' con l'URL del tuo sito deployato (es. tramite una variabile d'ambiente).
    const clientPrintPageUrl = `http://localhost:32138/interventions/${interventionId}/print-work-report`;

    const emailContent = `
      Gentile Cliente ${intervention.client_company_name},

      Le inviamo la bolla di consegna relativa all'intervento sul suo impianto ${intervention.system_type} ${intervention.brand} ${intervention.model}.

      Può visualizzare e stampare la bolla di consegna al seguente link:
      ${clientPrintPageUrl}

      Cordiali saluti,
      Antonelli & Zani Refrigerazioni
    `;
    const fromEmail = 'onboarding@resend.dev'; // IMPORTANTE: Sostituisci con un dominio email verificato su Resend
    console.log("[send-work-report-email] Attempting to send email from:", fromEmail, "to:", recipientEmail);

    const { data, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `Bolla di Consegna Intervento ${intervention.client_company_name}`,
      html: emailContent.replace(/\n/g, '<br/>'),
    });

    if (resendError) {
      console.error("[send-work-report-email] Error sending email via Resend. Status: 500. Error:", resendError);
      return new Response(JSON.stringify({ error: resendError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("[send-work-report-email] Email sent successfully:", data);
    return new Response(JSON.stringify({ message: 'Email sent successfully', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("[send-work-report-email] Generic error in Edge Function. Status: 500. Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});